import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin, getSql } from "../../lib/programAdmin";
import {
  ensureNewsletterTables,
  buildMarketingEmail,
} from "../../lib/newsletter";

// Weekly newsletter drafts — create, list, approve, preview. Admin only.
// Drafts are the weekly send's content; the Send button lives in
// pages/api/newsletter-send.ts and only works on approved drafts.
//
// POST { subject, body, ctaLabel?, ctaUrl? } -> create a draft (status 'draft')
// POST { action: 'approve', id }    -> draft -> approved
// POST { action: 'archive', id }    -> any status -> archived
// POST { action: 'preview', id }    -> renders the draft through the
//   template and returns the HTML — so Gavin sees exactly what would
//   send, before approving (audit M8). No email is sent.
// GET                               -> list drafts, newest first
//
// A sent draft is immutable: corrections are a new draft, never an
// edit to the sent one.

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const adminEmail = await requireAdmin(req, res);
  if (!adminEmail) return;

  const sql = await getSql();
  if (!sql) {
    return res.status(500).json({ error: "Database not configured" });
  }

  try {
    await ensureNewsletterTables(sql);

    if (req.method === "GET") {
      const drafts = (await sql`
        SELECT id, subject, body, status, cta_label, cta_url, created_at, sent_at
        FROM newsletter_drafts
        ORDER BY created_at DESC
        LIMIT 50
      `) as unknown as Array<{
        id: number;
        subject: string;
        body: string;
        status: string;
        cta_label: string | null;
        cta_url: string | null;
        created_at: string | null;
        sent_at: string | null;
      }>;
      return res.status(200).json({ drafts });
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "GET, POST");
      return res.status(405).json({ error: "Method not allowed" });
    }

    const action = req.body?.action;

    if (action === "preview") {
      const id = Number(req.body?.id);
      if (!id) {
        return res.status(400).json({ error: "A draft id is required." });
      }
      const rows = (await sql`
        SELECT id, subject, body, status, cta_label, cta_url
        FROM newsletter_drafts WHERE id = ${id} LIMIT 1
      `) as unknown as Array<{
        id: number;
        subject: string;
        body: string;
        status: string;
        cta_label: string | null;
        cta_url: string | null;
      }>;
      const draft = rows[0];
      if (!draft) {
        return res.status(404).json({ error: "Draft not found." });
      }
      // Same rendering the send path uses (shared textToHtml shape is
      // in newsletter-send.ts; kept in sync by the preview checks).
      const { textToHtml } = await import("./newsletter-send");
      let built;
      try {
        built = buildMarketingEmail({
          subject: draft.subject,
          bodyHtml: textToHtml(draft.body),
          email: "preview@flbesttrainer.com",
          campaign: "weekly",
          cta:
            draft.cta_label && draft.cta_url
              ? { label: draft.cta_label, url: draft.cta_url }
              : undefined,
          preheader: draft.body
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 120),
          showReview: true,
          source: "newsletter",
          unsubscribeUrlOverride:
            "https://flbesttrainer.com/api/newsletter-unsubscribe?token=preview",
        });
      } catch (err) {
        return res.status(503).json({
          error:
            err instanceof Error ? err.message : "Preview could not render.",
        });
      }
      return res.status(200).json({
        draftId: draft.id,
        subject: draft.subject,
        status: draft.status,
        html: built.html,
      });
    }

    if (action === "approve" || action === "archive") {
      const id = Number(req.body?.id);
      if (!id) {
        return res.status(400).json({ error: "A draft id is required." });
      }
      const target = action === "approve" ? "approved" : "archived";
      const updated = (await sql`
        UPDATE newsletter_drafts
        SET status = ${target}
        WHERE id = ${id}
          AND status <> 'sent'
        RETURNING id, subject, status
      `) as unknown as Array<{ id: number; subject: string; status: string }>;
      if (updated.length === 0) {
        return res.status(400).json({
          error: "Draft not found, or it was already sent and can't change.",
        });
      }
      return res.status(200).json({ draft: updated[0] });
    }

    const subject =
      typeof req.body?.subject === "string" ? req.body.subject.trim() : "";
    const body =
      typeof req.body?.body === "string" ? req.body.body.trim() : "";
    const ctaLabel =
      typeof req.body?.ctaLabel === "string"
        ? req.body.ctaLabel.trim()
        : "";
    const ctaUrl =
      typeof req.body?.ctaUrl === "string" ? req.body.ctaUrl.trim() : "";
    if (!subject || !body) {
      return res
        .status(400)
        .json({ error: "A draft needs both a subject and a body." });
    }
    if ((ctaLabel && !ctaUrl) || (!ctaLabel && ctaUrl)) {
      return res.status(400).json({
        error: "A button needs both a label and a link.",
      });
    }

    const created = (await sql`
      INSERT INTO newsletter_drafts (subject, body, status, cta_label, cta_url)
      VALUES (${subject}, ${body}, 'draft', ${ctaLabel || null}, ${ctaUrl || null})
      RETURNING id, subject, status, created_at
    `) as unknown as Array<{
      id: number;
      subject: string;
      status: string;
      created_at: string | null;
    }>;
    return res.status(200).json({ draft: created[0] });
  } catch (err) {
    console.error("[newsletter-drafts] failed:", err);
    return res.status(500).json({ error: "Failed to save draft" });
  }
}
