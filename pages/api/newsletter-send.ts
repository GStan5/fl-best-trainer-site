import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin, getSql } from "../../lib/programAdmin";
import { mailerConfigured } from "../../lib/mailer";
import {
  ensureNewsletterTables,
  sendMarketingEmail,
} from "../../lib/newsletter";

// Weekly send — the Send button on the admin screen. Admin only.
// POST { draftId }.
//
// Rules (design doc): only an APPROVED draft sends. It goes to every
// subscribed address, logs every send in email_sends, and marks the
// draft sent. No automatic weekly send — Gavin's tap is the trigger,
// every time. A send that fails for one address is logged and the rest
// still go out.

// Draft bodies are stored as plain text (Grim writes them in chat
// voice); at send time, blank-line-separated blocks become paragraphs.
function textToHtml(body: string): string {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  return escaped
    .split(/\n\s*\n/)
    .map((block) => `<p>${block.replace(/\n/g, "<br />")}</p>`)
    .join("\n");
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
      SELECT id, subject, body, status
      FROM newsletter_drafts WHERE id = ${draftId} LIMIT 1
    `) as unknown as Array<{
      id: number;
      subject: string;
      body: string;
      status: string;
    }>;
    const draft = drafts[0];
    if (!draft) {
      return res.status(404).json({ error: "Draft not found." });
    }
    if (draft.status !== "approved") {
      return res.status(400).json({
        error: `Only an approved draft can be sent (this one is ${draft.status}).`,
      });
    }

    const recipients = (await sql`
      SELECT email, first_name
      FROM newsletter_subscribers
      WHERE unsubscribed_at IS NULL
      ORDER BY subscribed_at ASC
    `) as unknown as Array<{ email: string; first_name: string | null }>;

    let sent = 0;
    let failed = 0;
    for (const r of recipients) {
      try {
        await sendMarketingEmail(sql, {
          to: r.email,
          firstName: r.first_name ?? undefined,
          subject: draft.subject,
          bodyHtml: textToHtml(draft.body),
          kind: "weekly",
          campaign: "weekly",
        });
        sent += 1;
      } catch (err) {
        console.error(`[newsletter-send] failed for ${r.email}:`, err);
        failed += 1;
      }
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
    });
  } catch (err) {
    console.error("[newsletter-send] failed:", err);
    return res.status(500).json({ error: "Weekly send failed" });
  }
}
