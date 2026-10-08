import { NextApiRequest, NextApiResponse } from "next";
import { TRACKED_PAGES } from "../../lib/programs";
import {
  requireAdmin,
  getSql,
  ensureProgramTables,
  checkoutMode,
} from "../../lib/programAdmin";

// Independent for Life — admin overview feed (Phase 5).
// New route (existing pages/api/admin/** untouched). Admin-only, using
// the same session + users.is_admin check as pages/api/admin/*.
// Powers pages/admin/online.tsx. Every data query degrades to zeros on
// DB trouble (guide-signup style): the hub must render, not 500.

interface LeadRow {
  firstName: string;
  email: string;
  source: string;
  createdAt: string | null;
}

interface FormCheckRow {
  email: string;
  videoUrl: string;
  note: string;
  createdAt: string | null;
  status: string;
}

function iso(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

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

  const totals = {
    leads: 0,
    signupsBySource: {} as Record<string, number>,
    last7d: 0,
    last30d: 0,
  };
  let recentLeads: LeadRow[] = [];
  let funnel = TRACKED_PAGES.map((page) => ({ page, views: 0 }));
  const formChecks: { pending: number; latest: FormCheckRow[] } = {
    pending: 0,
    latest: [],
  };

  try {
    const sql = await getSql();
    if (sql) {
      try {
        await ensureProgramTables(sql);
      } catch (err) {
        console.error("[program-admin] table ensure failed:", err);
      }

      try {
        const rows = await sql`SELECT count(*)::int AS n FROM leads`;
        totals.leads = Number(rows[0]?.n ?? 0);
      } catch (err) {
        console.error("[program-admin] leads total failed:", err);
      }

      try {
        const rows = await sql`
          SELECT coalesce(source, 'guide') AS source, count(*)::int AS n
          FROM leads GROUP BY 1
        `;
        for (const row of rows) {
          totals.signupsBySource[String(row.source)] = Number(row.n ?? 0);
        }
      } catch (err) {
        console.error("[program-admin] signups-by-source failed:", err);
      }

      try {
        const r7 = await sql`
          SELECT count(*)::int AS n FROM leads
          WHERE created_at >= now() - interval '7 days'
        `;
        totals.last7d = Number(r7[0]?.n ?? 0);
        const r30 = await sql`
          SELECT count(*)::int AS n FROM leads
          WHERE created_at >= now() - interval '30 days'
        `;
        totals.last30d = Number(r30[0]?.n ?? 0);
      } catch (err) {
        console.error("[program-admin] recent-windows failed:", err);
      }

      try {
        const rows = await sql`
          SELECT first_name, email, source, created_at
          FROM leads ORDER BY created_at DESC LIMIT 20
        `;
        recentLeads = rows.map((row) => ({
          firstName: String(row.first_name ?? ""),
          email: String(row.email ?? ""),
          source: String(row.source ?? "guide"),
          createdAt: iso(row.created_at),
        }));
      } catch (err) {
        console.error("[program-admin] recent leads failed:", err);
      }

      try {
        const rows = await sql`
          SELECT page, count(*)::int AS n FROM events
          WHERE event = 'view' GROUP BY page
        `;
        const viewsByPage = new Map<string, number>();
        for (const row of rows) {
          viewsByPage.set(String(row.page), Number(row.n ?? 0));
        }
        funnel = TRACKED_PAGES.map((page) => ({
          page,
          views: viewsByPage.get(page) ?? 0,
        }));
      } catch (err) {
        console.error("[program-admin] funnel views failed:", err);
      }

      try {
        const pending = await sql`
          SELECT count(*)::int AS n FROM form_checks WHERE status = 'pending'
        `;
        formChecks.pending = Number(pending[0]?.n ?? 0);
        const latest = await sql`
          SELECT email, video_url, note, created_at, status
          FROM form_checks ORDER BY created_at DESC LIMIT 5
        `;
        formChecks.latest = latest.map((row) => ({
          email: String(row.email ?? ""),
          videoUrl: String(row.video_url ?? ""),
          note: String(row.note ?? ""),
          createdAt: iso(row.created_at),
          status: String(row.status ?? "pending"),
        }));
      } catch (err) {
        console.error("[program-admin] form checks failed:", err);
      }
    }
  } catch (err) {
    console.error("[program-admin] overview failed (returning zeros):", err);
  }

  return res.status(200).json({
    totals,
    recentLeads,
    funnel,
    formChecks,
    checkoutMode: checkoutMode(),
  });
}
