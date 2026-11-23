import type { NextApiRequest, NextApiResponse } from "next";
import sql from "../../../lib/database";
import { mailerConfigured } from "../../../lib/mailer";
import {
  ensureNewsletterTables,
  sendMarketingEmail,
  logEmailSend,
} from "../../../lib/newsletter";
import { sequenceEmailForStep } from "../../../lib/sequenceEmails";

// Follow-up sequence cron — daily, 9:00 AM (vercel.json).
// Picks up everyone whose next_send_at is due, sends the next step,
// logs it in email_sends, and advances them. A failed send stays due
// and retries the next day — nothing is lost, nothing is sent twice.
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
//      is logged as 'skipped-bought' and the sequence is marked
//      finished.
//
// Sunset (research B6): a subscriber silent for 90 days (no opens or
// clicks in email_events, and first send was 90+ days ago) is
// suppressed in place — sequence_step 0, next_send_at NULL — and
// logged as 'suppressed'. Suppression is a state, not a delete; the
// row stays, and resubscribing restarts the sequence at step 1
// (audit S16). With 4 subscribers the re-engage email is a
// hand-written draft (see the design doc); once the list is bigger
// this becomes an automated winback sequence.
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
        AND sequence_step BETWEEN 1 AND 3
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
      // Sunset (research B6): silent 90 days → suppress in place.
      // email_events is a Phase 2 table; until it exists the check
      // throws and is skipped — a missing table must never break the
      // sequence for everyone else.
      try {
        const engagement = (await sql`
          SELECT 1 FROM email_events
          WHERE email = ${sub.email}
            AND event_type IN ('open', 'click')
            AND created_at >= NOW() - INTERVAL '90 days'
          LIMIT 1
        `) as unknown as Array<Record<string, unknown>>;
        const firstSend = (await sql`
          SELECT sent_at FROM email_sends
          WHERE email = ${sub.email}
          ORDER BY sent_at ASC LIMIT 1
        `) as unknown as Array<{ sent_at: string }>;
        if (
          engagement.length === 0 &&
          firstSend.length > 0 &&
          Date.now() - new Date(firstSend[0].sent_at).getTime() >
            90 * 24 * 60 * 60 * 1000
        ) {
          if (!dryRun) {
            await logEmailSend(sql, {
              email: sub.email,
              kind: "sunset-suppress",
              subject: "(suppressed — 90 days silent, no re-engage reply)",
              status: "suppressed",
            });
            await sql`
              UPDATE newsletter_subscribers
              SET sequence_step = 0, next_send_at = NULL
              WHERE email = ${sub.email}
            `;
          }
          results.push({
            email: sub.email,
            step: sub.sequence_step,
            status: "suppressed",
            detail:
              "Silent 90 days — suppressed in place, row kept, resubscribe restarts the sequence.",
          });
          continue;
        }
      } catch (err) {
        // No email_events table yet (Phase 2) or a transient error —
        // skip the sunset check for this subscriber, not the send.
        console.error(
          `[email-sequence] sunset check failed for ${sub.email} (skipping check):`,
          err
        );
      }

      const step = sub.sequence_step;
      const emailDef = sequenceEmailForStep(step);

      if (!emailDef) {
        results.push({ email: sub.email, step, status: "skipped-no-email" });
        continue;
      }

      // Gate 2: Gavin's approval. Never send an unapproved step.
      if (!emailDef.approved) {
        results.push({
          email: sub.email,
          step,
          status: "skipped-not-approved",
          detail: "Sequence step not approved yet — left due.",
        });
        continue;
      }

      // Gate 3: email 3 only — skip the pitch for existing buyers of
      // ANY product (research B7: never pitch down the ladder).
      if (step === 3) {
        const bought = (await sql`
          SELECT 1 FROM purchase_emails
          WHERE email = ${sub.email}
            AND status = 'sent'
          LIMIT 1
        `) as unknown as Array<Record<string, unknown>>;
        if (bought.length > 0) {
          if (!dryRun) {
            await logEmailSend(sql, {
              email: sub.email,
              kind: "sequence-3",
              subject: emailDef.subject,
              status: "skipped-bought",
            });
            await sql`
              UPDATE newsletter_subscribers
              SET sequence_step = 4, next_send_at = NULL
              WHERE email = ${sub.email}
            `;
          }
          results.push({
            email: sub.email,
            step,
            status: "skipped-bought",
            detail: "Already bought Starter — pitch skipped, sequence finished.",
          });
          continue;
        }
      }

      if (dryRun) {
        results.push({
          email: sub.email,
          step,
          status: "would-send",
          detail: `Subject: ${emailDef.subject}`,
        });
        continue;
      }

      // Live send.
      try {
        await sendMarketingEmail(sql, {
          to: sub.email,
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
          `[email-sequence] send failed for ${sub.email} step ${step}:`,
          err
        );
        results.push({
          email: sub.email,
          step,
          status: "failed",
          detail: err instanceof Error ? err.message : "Send failed",
        });
        continue;
      }

      // Advance: step 1 -> due day 4 (+2d), step 2 -> due day 7 (+3d),
      // step 3 -> finished.
      if (step === 1) {
        await sql`
          UPDATE newsletter_subscribers
          SET sequence_step = 2, next_send_at = now() + interval '2 days'
          WHERE email = ${sub.email}
        `;
      } else if (step === 2) {
        await sql`
          UPDATE newsletter_subscribers
          SET sequence_step = 3, next_send_at = now() + interval '3 days'
          WHERE email = ${sub.email}
        `;
      } else {
        await sql`
          UPDATE newsletter_subscribers
          SET sequence_step = 4, next_send_at = NULL
          WHERE email = ${sub.email}
        `;
      }
      results.push({ email: sub.email, step, status: "sent" });
    }

    const sent = results.filter((r) => r.status === "sent").length;
    const failed = results.filter((r) => r.status === "failed").length;
    const skipped = results.length - sent - failed;

    return res.status(200).json({
      ok: true,
      dryRun,
      checked: due.length,
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
