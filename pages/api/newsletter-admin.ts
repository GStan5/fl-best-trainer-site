import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin, getSql } from "../../lib/programAdmin";
import {
  ensureNewsletterTables,
  starterBuyersFromEmail,
} from "../../lib/newsletter";

// Newsletter admin stats — powers the newsletter section on
// pages/admin/online.tsx. Admin only (same gate as the other admin
// routes). Read-only: never sends anything.
//
// Metrics (research B5): clicks are the primary metric now — opens
// are approximate since Apple Mail Privacy Protection inflates them
// (~13 points). The closed loop is the monthly review: delivered,
// bounces, clicks, unsubscribes, spam complaints, Starter sales from
// email (starterBuyersFromEmail), list size. Opens stay in the
// admin numbers only as a rough sense of reach, never as the
// decision metric.

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
      SELECT id, subject, status, cta_label, cta_url,
             idea, strategy, item_name, item_body, item_url,
             created_at, sent_at
      FROM newsletter_drafts
      ORDER BY created_at DESC
      LIMIT 10
    `) as unknown as Array<{
      id: number;
      subject: string;
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

    // Closed loop (audit S14, research B5): Starter buyers whose
    // email is (or was) a newsletter subscriber. The count is the
    // number of buyers who were subscribers when they bought —
    // the revenue half of the monthly report.
    const buyers = await starterBuyersFromEmail(sql);
    const starterSalesFromEmail = buyers.filter(
      (b) => b.subscribed_at !== null
    ).length;

    return res.status(200).json({
      subscribed: Number(totals[0]?.subscribed ?? 0),
      joined7d: Number(totals[0]?.joined7d ?? 0),
      unsubscribed: Number(totals[0]?.unsubscribed ?? 0),
      starterSalesFromEmail,
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
