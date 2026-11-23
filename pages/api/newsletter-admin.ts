import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin, getSql } from "../../lib/programAdmin";
import { ensureNewsletterTables } from "../../lib/newsletter";

// Newsletter admin stats — powers the newsletter section on
// pages/admin/online.tsx. Admin only (same gate as the other admin
// routes). Read-only: never sends anything.

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const adminEmail = await requireAdmin(req, res);
  if (!adminEmail) return;

  const sql = await getSql();
  if (!sql) {
    return res.status(500).json({ error: "Database not configured" });
  }

  try {
    await ensureNewsletterTables(sql);

    const totals = (await sql`
      SELECT
        count(*) FILTER (WHERE unsubscribed_at IS NULL)::int AS subscribed,
        count(*) FILTER (WHERE unsubscribed_at IS NULL AND subscribed_at >= now() - interval '7 days')::int AS joined7d,
        count(*) FILTER (WHERE unsubscribed_at IS NOT NULL)::int AS unsubscribed
      FROM newsletter_subscribers
    `) as unknown as Array<{
      subscribed: number;
      joined7d: number;
      unsubscribed: number;
    }>;

    const byStep = (await sql`
      SELECT sequence_step, count(*)::int AS n
      FROM newsletter_subscribers
      WHERE unsubscribed_at IS NULL
      GROUP BY sequence_step
      ORDER BY sequence_step
    `) as unknown as Array<{ sequence_step: number; n: number }>;

    const drafts = (await sql`
      SELECT id, subject, status, created_at, sent_at
      FROM newsletter_drafts
      ORDER BY created_at DESC
      LIMIT 10
    `) as unknown as Array<{
      id: number;
      subject: string;
      status: string;
      created_at: string | null;
      sent_at: string | null;
    }>;

    const recentSends = (await sql`
      SELECT email, kind, subject, sent_at, status
      FROM email_sends
      ORDER BY sent_at DESC
      LIMIT 10
    `) as unknown as Array<{
      email: string;
      kind: string;
      subject: string;
      sent_at: string | null;
      status: string;
    }>;

    return res.status(200).json({
      subscribed: Number(totals[0]?.subscribed ?? 0),
      joined7d: Number(totals[0]?.joined7d ?? 0),
      unsubscribed: Number(totals[0]?.unsubscribed ?? 0),
      byStep: byStep.map((r) => ({
        step: Number(r.sequence_step),
        count: Number(r.n),
      })),
      drafts,
      recentSends,
    });
  } catch (err) {
    console.error("[newsletter-admin] stats failed:", err);
    return res.status(500).json({ error: "Failed to load newsletter stats" });
  }
}
