import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin, getSql } from "../../lib/programAdmin";
import { mailerConfigured } from "../../lib/mailer";
import {
  ensureNewsletterTables,
  sendMarketingEmail,
  TEST_RECIPIENTS,
} from "../../lib/newsletter";

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

// Draft bodies are stored as plain text (Grim writes them in chat
// voice); at send time, blank-line-separated blocks become paragraphs.
// Bare URLs are linkified (audit M3) — the weekly's nudge has to be
// clickable, or the blog -> trust -> gear + plans loop is a dead end.
export function textToHtml(body: string): string {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  const linkified = escaped.replace(
    /(https?:\/\/[^\s<]+)/g,
    (url: string) => {
      // Un-escape &amp; inside the href only — the visible text keeps
      // the escaped form so a pasted URL still reads correctly.
      const href = url.replace(/&amp;/g, "&");
      return `<a href="${href}">${url}</a>`;
    }
  );
  return linkified
    .split(/\n\s*\n/)
    .map((block) => `<p>${block.replace(/\n/g, "<br />")}</p>`)
    .join("\n");
}

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
      SELECT id, subject, body, status, cta_label, cta_url
      FROM newsletter_drafts WHERE id = ${draftId} LIMIT 1
    `) as unknown as Array<{
      id: number;
      subject: string;
      body: string;
      status: string;
      cta_label: string | null;
      cta_url: string | null;
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
    for (const r of recipients) {
      try {
        await sendMarketingEmail(sql, {
          to: r.email,
          firstName: r.first_name ?? undefined,
          subject: draft.subject,
          bodyHtml: textToHtml(draft.body),
          kind: test ? "weekly-test" : "weekly",
          campaign: "weekly",
          cta:
            draft.cta_label && draft.cta_url
              ? { label: draft.cta_label, url: draft.cta_url }
              : undefined,
          preheader: preheaderFromBody(draft.body),
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
      });
    }

    if (sent === 0) {
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
    });
  } catch (err) {
    console.error("[newsletter-send] failed:", err);
    return res.status(500).json({ error: "Weekly send failed" });
  }
}
