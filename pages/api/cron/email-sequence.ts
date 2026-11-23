import type { NextApiRequest, NextApiResponse } from "next";
import sql from "../../../lib/database";
import { mailerConfigured } from "../../../lib/mailer";
import {
  ensureNewsletterTables,
  sendMarketingEmail,
  logEmailSend,
  enrollWinback,
  processPostPurchaseRow,
  processWinbackRow,
  normalizeEmail,
} from "../../../lib/newsletter";
import {
  SUNSET_SILENT_DAYS,
  marketingSendAllowed,
} from "../../../lib/ladder";
import {
  sequenceEmailForStep,
  sequenceGapDays,
} from "../../../lib/sequenceEmails";

// Follow-up sequence cron — daily, 9:00 AM (vercel.json).
// Picks up everyone whose next_send_at is due, sends the next step,
// logs it in email_sends, and advances them. A failed send stays due
// and retries the next day — nothing is lost, nothing is sent twice.
// This route also processes the post-purchase and winback due rows
// (their own tables, their own state) — one daily marketing cron, not
// three.
//
// Gates, checked before EVERY send:
//   1. The subscriber has not unsubscribed (query filters them out).
//   2. The step is approved by Gavin (lib/sequenceEmails.ts). An
//      unapproved step is skipped and left due — nothing sends before
//      his yes, even if this cron is live.
//   3. Before email 3 only: they have not already bought anything.
//      Online buys live in purchase_emails (status = 'sent') — NOT the
//      purchases table. Any product counts (research B7's ladder rule:
//      never pitch DOWN the ladder — a Self-Study or monthly buyer
//      who gets the Starter pitch would see a $37 offer for the thing
//      they already bought past). A buyer skips the pitch: the send
//      is logged as 'skipped-bought' and they advance to step 4, the
//      Day-14 check-in — the check-in is not a pitch, buyers get it
//      too.
//
// Sunset (research B6, winback B9): a subscriber silent for
// SUNSET_SILENT_DAYS (lib/ladder.ts, 90) is enrolled in the winback
// sequence (3 emails, ~5 days apart) instead of being suppressed in
// place — and suppressed only after the third winback email. Suppression is a state, not a delete; the
// row stays, and resubscribing restarts the sequence at step 1
// (audit S16). LIMIT: email_events is a Phase 2 table; until it
// exists the check throws and is skipped — a missing table must never
// break the sequence for everyone else. And the check only runs for
// subscribers who are DUE for a sequence step, so someone who
// finished the sequence and then goes silent is never checked —
// extending the sunset scan to the whole list is a follow-up, not
// this build.
//
// Auth: same CRON_SECRET Bearer check as the other cron routes.
// ?dryRun=1 logs what WOULD be sent and sends nothing — the safe way
// to rehearse this route.

function verifyCron(req: NextApiRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // matches the other cron routes
  return req.headers.authorization === `Bearer ${cronSecret}`;
}

interface DueRow {
  email: string;
  first_name: string | null;
  source: string | null;
  sequence_step: number;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!verifyCron(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const dryRun = req.query.dryRun === "1" || req.query.dryRun === "true";

  // Live runs need Gmail. Dry runs don't send, so they don't need it.
  if (!dryRun && !mailerConfigured()) {
    return res.status(503).json({
      ok: false,
      error: "Mailer not configured — Gmail env missing, nothing sent.",
    });
  }

  try {
    await ensureNewsletterTables(sql);

    const due = (await sql`
      SELECT email, first_name, source, sequence_step
      FROM newsletter_subscribers
      WHERE unsubscribed_at IS NULL
        AND sequence_step BETWEEN 1 AND 4
        AND next_send_at IS NOT NULL
        AND next_send_at <= now()
      ORDER BY next_send_at ASC
    `) as unknown as DueRow[];

    const results: Array<{
      email: string;
      step: number;
      status: string;
      detail?: string;
    }> = [];

    for (const sub of due) {
      // One address, one spelling: the stored value is normalized at
      // every entry point, but normalize here too — the loop's
      // lookups (purchase_emails, email_events, email_sends) and the
      // gate check must all see the canonical form, never a stray
      // casing from an older row.
      const email = normalizeEmail(sub.email);
      // Send gate (Gavin 2026-11-23): while ON, only the allowlist
      // receives marketing email. Checked FIRST — a non-allowlisted
      // subscriber is never enrolled in winback either (winback is
      // marketing). A gated skip is terminal for the sequence: the
      // subscriber advances to finished (step 5), the step does not
      // sit due for the day the gate lifts. Dry runs report the skip
      // without changing anything.
      if (!marketingSendAllowed(email)) {
        if (!dryRun) {
          await logEmailSend(sql, {
            email: email,
            kind: `sequence-${sub.sequence_step}`,
            subject: "(skipped — send gate)",
            status: "skipped-not-allowlisted",
          });
          await sql`
            UPDATE newsletter_subscribers
            SET sequence_step = 5, next_send_at = NULL
            WHERE email = ${email}
          `;
        }
        results.push({
          email: email,
          step: sub.sequence_step,
          status: "skipped-not-allowlisted",
          detail:
            "Send gate is ON — only the allowlist receives marketing email.",
        });
        continue;
      }

      // Sunset (research B6, winback B9): silent SUNSET_SILENT_DAYS
      // (lib/ladder.ts — the threshold is config, not a literal) →
      // enroll in the winback sequence, don't suppress in place.
      // Suppression happens only after the third winback email gets
      // no reply. email_events is a Phase 2 table; until it exists
      // the check throws and is skipped — a missing table must never
      // break the sequence for everyone else.
      try {
        const engagement = (await sql`
          SELECT 1 FROM email_events
          WHERE email = ${email}
            AND event_type IN ('open', 'click')
            AND created_at >= NOW() - make_interval(days => ${SUNSET_SILENT_DAYS})
          LIMIT 1
        `) as unknown as Array<Record<string, unknown>>;
        const firstSend = (await sql`
          SELECT sent_at FROM email_sends
          WHERE email = ${email}
          ORDER BY sent_at ASC LIMIT 1
        `) as unknown as Array<{ sent_at: string }>;
        if (
          engagement.length === 0 &&
          firstSend.length > 0 &&
          Date.now() - new Date(firstSend[0].sent_at).getTime() >
            SUNSET_SILENT_DAYS * 24 * 60 * 60 * 1000
        ) {
          if (!dryRun) {
            await enrollWinback(sql, email);
            await logEmailSend(sql, {
              email: email,
              kind: "sunset-winback",
              subject: `(enrolled in winback — ${SUNSET_SILENT_DAYS} days silent)`,
              status: "winback-enrolled",
            });
            await sql`
              UPDATE newsletter_subscribers
              SET sequence_step = 0, next_send_at = NULL
              WHERE email = ${email}
            `;
          }
          results.push({
            email: email,
            step: sub.sequence_step,
            status: "winback-enrolled",
            detail: `Silent ${SUNSET_SILENT_DAYS} days — enrolled in the winback sequence; suppression only after the third winback email.`,
          });
          continue;
        }
      } catch (err) {
        // No email_events table yet (Phase 2) or a transient error —
        // skip the sunset check for this subscriber, not the send.
        console.error(
          `[email-sequence] sunset check failed for ${email} (skipping check):`,
          err
        );
      }

      const step = sub.sequence_step;
      const emailDef = sequenceEmailForStep(step);

      if (!emailDef) {
        results.push({ email: email, step, status: "skipped-no-email" });
        continue;
      }

      // Gate 2: Gavin's approval. Never send an unapproved step.
      if (!emailDef.approved) {
        results.push({
          email: email,
          step,
          status: "skipped-not-approved",
          detail: "Sequence step not approved yet — left due.",
        });
        continue;
      }

      // Gate 3: email 3 only — skip the pitch for existing buyers of
      // ANY product (research B7: never pitch down the ladder). They
      // advance to step 4, the Day-14 check-in — it is not a pitch,
      // so buyers get it too.
      if (step === 3) {
        const bought = (await sql`
          SELECT 1 FROM purchase_emails
          WHERE email = ${email}
            AND status = 'sent'
          LIMIT 1
        `) as unknown as Array<Record<string, unknown>>;
        if (bought.length > 0) {
          if (!dryRun) {
            await logEmailSend(sql, {
              email: email,
              kind: "sequence-3",
              subject: emailDef.subject,
              status: "skipped-bought",
            });
            // Advance to step 4, the Day-14 check-in — gap from the
            // defs (step 3 -> step 4), never a literal.
            const gapDays = sequenceGapDays(3, 4);
            await sql`
              UPDATE newsletter_subscribers
              SET sequence_step = 4, next_send_at = now() + make_interval(days => ${gapDays})
              WHERE email = ${email}
            `;
          }
          results.push({
            email: email,
            step,
            status: "skipped-bought",
            detail:
              "Already bought something — pitch skipped, Day-14 check-in still due in 7 days.",
          });
          continue;
        }
      }

      if (dryRun) {
        results.push({
          email: email,
          step,
          status: "would-send",
          detail: `Subject: ${emailDef.subject}`,
        });
        continue;
      }

      // Live send.
      try {
        await sendMarketingEmail(sql, {
          to: email,
          firstName: sub.first_name ?? undefined,
          subject: emailDef.subject,
          bodyHtml: emailDef.html,
          kind: `sequence-${step}`,
          campaign: emailDef.campaign,
          cta: emailDef.cta,
          ctaRepeat: emailDef.ctaRepeat,
          ps: emailDef.ps,
          pps: emailDef.pps,
          headline: emailDef.headline,
          preheader: emailDef.preheader,
          eyebrow: emailDef.eyebrow,
          showReview: emailDef.showReview,
          source: sub.source,
        });
      } catch (err) {
        // Logged as 'failed' inside sendMarketingEmail. Leave due —
        // tomorrow's run retries.
        console.error(
          `[email-sequence] send failed for ${email} step ${step}:`,
          err
        );
        results.push({
          email: email,
          step,
          status: "failed",
          detail: err instanceof Error ? err.message : "Send failed",
        });
        continue;
      }

      // Advance — gaps come from the defs' sendAfterDays (the defs
      // are the timing config): step 1 -> due day 4, step 2 -> due
      // day 7, step 3 -> due day 14, step 4 -> finished (step 5).
      if (step === 1) {
        const gapDays = sequenceGapDays(1, 2);
        await sql`
          UPDATE newsletter_subscribers
          SET sequence_step = 2, next_send_at = now() + make_interval(days => ${gapDays})
          WHERE email = ${email}
        `;
      } else if (step === 2) {
        const gapDays = sequenceGapDays(2, 3);
        await sql`
          UPDATE newsletter_subscribers
          SET sequence_step = 3, next_send_at = now() + make_interval(days => ${gapDays})
          WHERE email = ${email}
        `;
      } else if (step === 3) {
        const gapDays = sequenceGapDays(3, 4);
        await sql`
          UPDATE newsletter_subscribers
          SET sequence_step = 4, next_send_at = now() + make_interval(days => ${gapDays})
          WHERE email = ${email}
        `;
      } else {
        await sql`
          UPDATE newsletter_subscribers
          SET sequence_step = 5, next_send_at = NULL
          WHERE email = ${email}
        `;
      }
      results.push({ email: email, step, status: "sent" });
    }

    // Post-purchase due rows (research B7): own table, own state.
    // A buyer may also be mid-sequence — the two run side by side.
    const ppDue = (await sql`
      SELECT email, product, step FROM post_purchase_sequences
      WHERE step BETWEEN 1 AND 4
        AND next_send_at IS NOT NULL
        AND next_send_at <= now()
      ORDER BY next_send_at ASC
    `) as unknown as Array<{
      email: string;
      product: string | null;
      step: number;
    }>;
    for (const row of ppDue) {
      const r = await processPostPurchaseRow(sql, row, dryRun);
      results.push({ ...r, step: r.step });
    }

    // Winback due rows (research B9): the re-engage step of the
    // sunset policy. Suppression happens inside processWinbackRow,
    // only after step 3.
    const wbDue = (await sql`
      SELECT email, step FROM winback_sequences
      WHERE step BETWEEN 1 AND 3
        AND next_send_at IS NOT NULL
        AND next_send_at <= now()
      ORDER BY next_send_at ASC
    `) as unknown as Array<{ email: string; step: number }>;
    for (const row of wbDue) {
      const r = await processWinbackRow(sql, row, dryRun);
      results.push({ ...r, step: r.step });
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const skipped = results.length - sent - failed;

    return res.status(200).json({
      ok: true,
      dryRun,
      checked: due.length + ppDue.length + wbDue.length,
      sent,
      failed,
      skipped,
      results,
    });
  } catch (err) {
    console.error("[email-sequence] cron failed:", err);
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : "Sequence cron failed",
    });
  }
}
