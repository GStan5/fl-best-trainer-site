import type { NextApiRequest, NextApiResponse } from "next";
import { requireAdmin, getSql } from "../../lib/programAdmin";
import { ensureNewsletterTables } from "../../lib/newsletter";

// Ad spend, recorded by hand (analytics, 2026-11-24): what Gavin
// spent per channel per month on Facebook / Instagram / Google ads.
// There is no ad-platform API pulling this — the spend is entered in
// the admin screen when ads run, and CAC is spend divided by the
// buyers that channel brought in that month (see adSpendCac in
// lib/newsletter.ts). Admin only. GET lists the rows; POST upserts
// one row per channel per month (amount in dollars, stored as cents).
const CHANNELS = ["facebook", "instagram", "google", "other"] as const;
const PERIOD_RE = /^\d{4}-(0[1-9]|1[0-2])$/;

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
      const rows = (await sql`
        SELECT channel, period, spend_cents AS "spendCents", note
        FROM ad_spend
        ORDER BY period DESC, channel ASC
      `) as unknown as Array<{
        channel: string;
        period: string;
        spendCents: number;
        note: string | null;
      }>;
      return res.status(200).json({ rows });
    }

    if (req.method === "POST") {
      const channel =
        typeof req.body?.channel === "string"
          ? req.body.channel.trim().toLowerCase()
          : "";
      const period =
        typeof req.body?.period === "string" ? req.body.period.trim() : "";
      const amount = Number(req.body?.amount);
      const note =
        typeof req.body?.note === "string"
          ? req.body.note.trim().slice(0, 200)
          : null;
      if (!CHANNELS.includes(channel as (typeof CHANNELS)[number])) {
        return res.status(400).json({
          error: "Channel must be facebook, instagram, google, or other.",
        });
      }
      if (!PERIOD_RE.test(period)) {
        return res
          .status(400)
          .json({ error: "Period must be YYYY-MM, e.g. 2026-12." });
      }
      if (!Number.isFinite(amount) || amount < 0 || amount > 1000000) {
        return res
          .status(400)
          .json({ error: "Amount must be a dollar amount from 0 up." });
      }
      const spendCents = Math.round(amount * 100);
      await sql`
        INSERT INTO ad_spend (channel, period, spend_cents, note)
        VALUES (${channel}, ${period}, ${spendCents}, ${note})
        ON CONFLICT (channel, period) DO UPDATE SET
          spend_cents = EXCLUDED.spend_cents,
          note = EXCLUDED.note
      `;
      return res.status(200).json({ ok: true });
    }

    res.setHeader("Allow", "GET, POST");
    return res.status(405).json({ error: "Method not allowed" });
  } catch (err) {
    console.error("[ad-spend] failed:", err);
    return res.status(500).json({ error: "Failed to load ad spend" });
  }
}
