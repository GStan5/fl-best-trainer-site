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
//   3. Before email 3 only: they have not already bought Starter.
//      Online buys live in purchase_emails (product = 'starter-plan',
//      status = 'sent') — NOT the purchases table. A buyer skips the
//      pitch: the send is logged as 'skipped-bought' and the sequence
//      is marked finished.
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
      SELECT email, first_name, sequence_step
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

      // Gate 3: email 3 only — skip the pitch for existing buyers.
      if (step === 3) {
        const bought = (await sql`
          SELECT 1 FROM purchase_emails
          WHERE email = ${sub.email}
            AND product = 'starter-plan'
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
