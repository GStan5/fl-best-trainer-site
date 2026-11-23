import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin, getSql } from "../../lib/programAdmin";
import { ensureNewsletterTables } from "../../lib/newsletter";

// Weekly newsletter drafts — create, list, approve. Admin only.
// Drafts are the weekly send's content; the Send button lives in
// pages/api/newsletter-send.ts and only works on approved drafts.
//
// POST { subject, body }            -> create a draft (status 'draft')
// POST { action: 'approve', id }    -> draft -> approved
// POST { action: 'archive', id }    -> any status -> archived
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
        SELECT id, subject, body, status, created_at, sent_at
        FROM newsletter_drafts
        ORDER BY created_at DESC
        LIMIT 50
      `) as unknown as Array<{
        id: number;
        subject: string;
        body: string;
        status: string;
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
    if (!subject || !body) {
      return res
        .status(400)
        .json({ error: "A draft needs both a subject and a body." });
    }

    const created = (await sql`
      INSERT INTO newsletter_drafts (subject, body, status)
      VALUES (${subject}, ${body}, 'draft')
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
