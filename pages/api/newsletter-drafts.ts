import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin, getSql } from "../../lib/programAdmin";
import {
  ensureNewsletterTables,
  buildMarketingEmail,
  weeklyBodyHtml,
  WEEKLY_DEALS,
} from "../../lib/newsletter";

// Weekly newsletter drafts — create, list, approve, preview. Admin only.
// Drafts are the weekly send's content; the Send button lives in
// pages/api/newsletter-send.ts and only works on approved drafts.
//
// A weekly draft is the 4-block container (Gavin 2026-11-23): an idea,
// a focus/strategy, and a gear item. The deal (block 4) is NOT in the
// draft — it is resolved per recipient at send time from
// purchase_emails, so the draft carries no deal and the preview shows
// a sample one (the Starter deal, for a non-buyer).
//
// POST { subject, idea, strategy, itemName, itemBody, itemUrl } ->
//   create a structured draft (status 'draft')
// POST { subject, body, ctaLabel?, ctaUrl? } -> create a legacy draft
//   (body only, pre-restructure shape — still sends the old way)
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
        SELECT id, subject, body, status, cta_label, cta_url,
               idea, strategy, item_name, item_body, item_url,
               created_at, sent_at
        FROM newsletter_drafts
        ORDER BY created_at DESC
        LIMIT 50
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
        SELECT id, subject, body, status, cta_label, cta_url,
               idea, strategy, item_name, item_body, item_url
        FROM newsletter_drafts WHERE id = ${id} LIMIT 1
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
      const draft = rows[0];
      if (!draft) {
        return res.status(404).json({ error: "Draft not found." });
      }
      // Same rendering the send path uses (shared textToHtml shape is
      // in lib/newsletter.ts). A structured draft renders the 4-block
      // weekly with the SAMPLE deal (the Starter deal, for a non-buyer
      // — the preview has no real recipient, so no purchase history
      // to resolve from); a legacy draft renders the old way.
      const { textToHtml } = await import("./newsletter-send");
      const structured = Boolean(draft.idea && draft.idea.trim());
      const sampleDeal = WEEKLY_DEALS.starter;
      let built;
      try {
        built = buildMarketingEmail({
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
          email: "preview@flbesttrainer.com",
          campaign: "weekly",
          cta:
            !structured && draft.cta_label && draft.cta_url
              ? { label: draft.cta_label, url: draft.cta_url }
              : undefined,
          deal: structured
            ? {
                line: sampleDeal.line,
                cta: { label: sampleDeal.label, url: sampleDeal.url },
              }
            : undefined,
          preheader: (structured ? (draft.idea as string) : (draft.body ?? ""))
            .replace(/\s+/g, " ")
            .trim()
            .slice(0, 120),
          // Research F7: the weekly preview carries "The Daily Rep"
          // as its header tagline; B10: the forward line (weekly only).
          headerTagline: "The Daily Rep",
          forwardLine: true,
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
    const str = (v: unknown): string =>
      typeof v === "string" ? v.trim() : "";
    // Structured draft (the 4-block weekly): idea + strategy + item
    // are all required — a weekly without its item is not a weekly.
    const idea = str(req.body?.idea);
    const strategy = str(req.body?.strategy);
    const itemName = str(req.body?.itemName);
    const itemBody = str(req.body?.itemBody);
    const itemUrl = str(req.body?.itemUrl);
    const structured =
      idea !== "" ||
      strategy !== "" ||
      itemName !== "" ||
      itemBody !== "" ||
      itemUrl !== "";
    if (structured) {
      if (
        !subject ||
        !idea ||
        !strategy ||
        !itemName ||
        !itemBody ||
        !itemUrl
      ) {
        return res.status(400).json({
          error:
            "A weekly draft needs a subject, one idea, one focus, and one item (name, why it helps, and link).",
        });
      }
      if (!/^https?:\/\//.test(itemUrl)) {
        return res.status(400).json({
          error:
            "The item link needs to be a full link starting with https://",
        });
      }
      const created = (await sql`
        INSERT INTO newsletter_drafts
          (subject, body, status, cta_label, cta_url,
           idea, strategy, item_name, item_body, item_url)
        VALUES (${subject}, NULL, 'draft', NULL, NULL,
                ${idea}, ${strategy}, ${itemName}, ${itemBody}, ${itemUrl})
        RETURNING id, subject, status, created_at
      `) as unknown as Array<{
        id: number;
        subject: string;
        status: string;
        created_at: string | null;
      }>;
      return res.status(200).json({ draft: created[0] });
    }

    // Legacy draft (body only, pre-restructure shape).
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
