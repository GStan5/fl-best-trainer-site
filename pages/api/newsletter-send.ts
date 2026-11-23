import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin, getSql } from "../../lib/programAdmin";
import { mailerConfigured } from "../../lib/mailer";
import {
  ensureNewsletterTables,
  sendMarketingEmail,
  logEmailSend,
  resolveWeeklyDeal,
  weeklyBodyHtml,
  textToHtml,
  TEST_RECIPIENTS,
} from "../../lib/newsletter";
import { marketingSendAllowed } from "../../lib/ladder";

// Re-exported for the drafts preview action, which renders through
// the same function (pages/api/newsletter-drafts.ts imports it from
// here). The implementation lives in lib/newsletter.ts.
export { textToHtml } from "../../lib/newsletter";

// Weekly send — the Send button on the admin screen. Admin only.
// POST { draftId }            -> send to every subscriber
// POST { draftId, test: true } -> test send: the draft only, to the
//   two test addresses (audit M8). Works on a draft or an approved
//   draft; never changes the draft's status, never touches the list.
//
// Rules (design doc): only an APPROVED draft sends to the list. It
// goes to every subscribed address, logs every send in email_sends.
// No automatic weekly send — Gavin's tap is the trigger, every time.
// A send that fails for one address is logged and the rest still go
// out. A weekly that fails for EVERYONE is NOT marked sent (audit
// M4) — the draft stays approved so it can be retried, and the failed
// addresses come back in the response instead of being swallowed.
//
// The weekly is four blocks (Gavin 2026-11-23): One idea, One focus,
// One item, One deal. Blocks 1–3 come from the draft; block 4 (the
// deal) is resolved PER RECIPIENT at send time from purchase_emails
// (resolveWeeklyDeal) — two readers can get the same weekly with a
// different deal. That is also the audit S5 fix, done properly:
// buyers never get pitched what they already own, because the deal
// is the next rung up from what they bought — never the Starter
// pitch to a Starter buyer, never two rungs up.

// First paragraph, plain text, for the inbox preheader (audit S4).
function preheaderFromBody(body: string): string {
  return body.replace(/\s+/g, " ").trim().slice(0, 120);
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const adminEmail = await requireAdmin(req, res);
  if (!adminEmail) return;

  const draftId = Number(req.body?.draftId);
  const test = req.body?.test === true || req.body?.test === "true";
  if (!draftId) {
    return res.status(400).json({ error: "A draft id is required." });
  }

  if (!mailerConfigured()) {
    return res.status(503).json({
      ok: false,
      error: "Mailer not configured — Gmail env missing, nothing sent.",
    });
  }

  const sql = await getSql();
  if (!sql) {
    return res.status(500).json({ error: "Database not configured" });
  }

  try {
    await ensureNewsletterTables(sql);

    const drafts = (await sql`
      SELECT id, subject, body, status, cta_label, cta_url,
             idea, strategy, item_name, item_body, item_url
      FROM newsletter_drafts WHERE id = ${draftId} LIMIT 1
    `) as unknown as Array<{
      id: number;
      subject: string;
      body: string | null;
      status: string;
      cta_label: string | null;
      cta_url: string | null;
      idea: string | null;
      strategy: string | null;
      item_name: string | null;
      item_body: string | null;
      item_url: string | null;
    }>;
    const draft = drafts[0];
    if (!draft) {
      return res.status(404).json({ error: "Draft not found." });
    }
    if (test) {
      if (draft.status === "sent") {
        return res.status(400).json({
          error: "That draft already sent — test a new draft instead.",
        });
      }
    } else if (draft.status !== "approved") {
      return res.status(400).json({
        error: `Only an approved draft can be sent (this one is ${draft.status}).`,
      });
    }

    const recipients: Array<{
      email: string;
      first_name: string | null;
      source: string | null;
    }> = test
      ? TEST_RECIPIENTS.map((email) => ({
          email,
          first_name: null,
          source: "newsletter",
        }))
      : ((await sql`
          SELECT email, first_name, source
          FROM newsletter_subscribers
          WHERE unsubscribed_at IS NULL
          ORDER BY subscribed_at ASC
        `) as unknown as Array<{
          email: string;
          first_name: string | null;
          source: string | null;
        }>);

    let sent = 0;
    let failed = 0;
    const failedEmails: string[] = [];
    let skipped = 0;
    const skippedEmails: string[] = [];
    // A structured draft (idea set) renders the 4-block weekly:
    // blocks 1–3 from the draft, block 4 (the deal) resolved per
    // recipient. A legacy draft (body only, no idea) renders the old
    // way — body + its own CTA button — so drafts written before the
    // restructure still send.
    const structured = Boolean(draft.idea && draft.idea.trim());
    for (const r of recipients) {
      // Send gate (Gavin 2026-11-23): while ON, only the allowlist
      // receives marketing email. Skipped recipients are logged
      // (status `skipped-not-allowlisted`) and counted, never sent —
      // and a weekly skipped for everyone is NOT a failure (audit
      // M4 is about sends that fail, not sends the gate blocks), so
      // it does not mark the draft sent and does not 500.
      if (!marketingSendAllowed(r.email)) {
        await logEmailSend(sql, {
          email: r.email,
          kind: test ? "weekly-test" : "weekly",
          subject: draft.subject,
          status: "skipped-not-allowlisted",
        });
        skipped += 1;
        skippedEmails.push(r.email);
        continue;
      }
      try {
        const deal = structured
          ? await resolveWeeklyDeal(sql, r.email)
          : undefined;
        await sendMarketingEmail(sql, {
          to: r.email,
          firstName: r.first_name ?? undefined,
          subject: draft.subject,
          bodyHtml: structured
            ? weeklyBodyHtml({
                idea: draft.idea as string,
                strategy: (draft.strategy ?? "") as string,
                itemName: (draft.item_name ?? "") as string,
                itemBody: (draft.item_body ?? "") as string,
                itemUrl: (draft.item_url ?? "") as string,
              })
            : textToHtml(draft.body ?? ""),
          kind: test ? "weekly-test" : "weekly",
          campaign: "weekly",
          cta:
            !structured && draft.cta_label && draft.cta_url
              ? { label: draft.cta_label, url: draft.cta_url }
              : undefined,
          deal: deal
            ? { line: deal.line, cta: { label: deal.label, url: deal.url } }
            : undefined,
          preheader: preheaderFromBody(
            structured ? (draft.idea as string) : (draft.body ?? "")
          ),
          // Research F7: the weekly carries the blog's name, "The
          // Daily Rep", as its header tagline. B10: the forward line
          // in the footer (weekly only) — the zero-infrastructure
          // referral, one line, no per-subscriber links.
          headerTagline: "The Daily Rep",
          forwardLine: true,
          showReview: true,
          source: r.source,
        });
        sent += 1;
      } catch (err) {
        console.error(`[newsletter-send] failed for ${r.email}:`, err);
        failed += 1;
        failedEmails.push(r.email);
      }
    }

    if (test) {
      // Test sends never change the draft.
      return res.status(200).json({
        ok: sent > 0,
        test: true,
        draftId,
        total: recipients.length,
        sent,
        failed,
        failedEmails,
        skipped,
        skippedEmails,
      });
    }

    if (sent === 0 && failed > 0) {
      // Audit M4: a weekly that failed for everyone is NOT marked
      // sent — the draft stays approved so it can be retried, and the
      // failure comes back in the response instead of being swallowed.
      return res.status(500).json({
        ok: false,
        draftId,
        total: recipients.length,
        sent: 0,
        failed,
        failedEmails,
        skipped,
        skippedEmails,
        error:
          "Nobody got this weekly — the draft is still approved, so it can be sent again.",
      });
    }

    if (sent === 0 && skipped > 0) {
      // Everyone was skipped by the send gate — not a failure, so no
      // 500 and no retry language: the draft stays approved, and the
      // send can go out when the gate lifts.
      return res.status(200).json({
        ok: true,
        draftId,
        total: recipients.length,
        sent: 0,
        failed: 0,
        failedEmails: [],
        skipped,
        skippedEmails,
        note: "Everyone was skipped by the send gate — only the allowlist receives marketing email while it is ON.",
      });
    }

    if (sent === 0) {
      // Empty list (or a list with nobody left to send to): same M4
      // shape as a total failure, without blaming the gate.
      return res.status(500).json({
        ok: false,
        draftId,
        total: recipients.length,
        sent: 0,
        failed,
        failedEmails,
        skipped,
        skippedEmails,
        error:
          "Nobody got this weekly — the draft is still approved, so it can be sent again.",
      });
    }

    await sql`
      UPDATE newsletter_drafts
      SET status = 'sent', sent_at = now()
      WHERE id = ${draftId}
    `;

    return res.status(200).json({
      ok: true,
      draftId,
      total: recipients.length,
      sent,
      failed,
      failedEmails,
      skipped,
      skippedEmails,
    });
  } catch (err) {
    console.error("[newsletter-send] failed:", err);
    return res.status(500).json({ error: "Weekly send failed" });
  }
}
