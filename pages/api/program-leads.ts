import { NextApiRequest, NextApiResponse } from "next";
import {
  requireAdmin,
  getSql,
  ensureProgramTables,
} from "../../lib/programAdmin";

// Independent for Life — admin leads export (Phase 5).
// New route (existing pages/api/admin/** untouched); same admin check
// as pages/api/admin/*. Powers the "Download leads CSV" button on
// pages/admin/online.tsx — the newsletter tooling for now is:
// download the CSV, send from Gmail. Query trouble degrades to an
// empty export rather than an error page.

interface LeadRow {
  first_name: unknown;
  email: unknown;
  source: unknown;
  created_at: unknown;
}

function csvCell(value: string): string {
  if (/[",\n\r]/.test(value)) {
    return `"${value.replace(/"/g, '""')}"`;
  }
  return value;
}

function iso(value: unknown): string {
  if (value === null || value === undefined) return "";
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? "" : d.toISOString();
}

async function fetchLeads(limit: number | null): Promise<LeadRow[]> {
  try {
    const sql = await getSql();
    if (!sql) return [];
    await ensureProgramTables(sql);
    if (limit === null) {
      return (await sql`
        SELECT first_name, email, source, created_at
        FROM leads ORDER BY created_at DESC
      `) as LeadRow[];
    }
    return (await sql`
      SELECT first_name, email, source, created_at
      FROM leads ORDER BY created_at DESC LIMIT ${limit}
    `) as LeadRow[];
  } catch (err) {
    console.error("[program-leads] fetch failed (returning empty):", err);
    return [];
  }
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

  if (req.query.format === "csv") {
    const rows = await fetchLeads(null);
    const lines = ["first_name,email,source,created_at"];
    for (const row of rows) {
      lines.push(
        [
          csvCell(String(row.first_name ?? "")),
          csvCell(String(row.email ?? "")),
          csvCell(String(row.source ?? "")),
          csvCell(iso(row.created_at)),
        ].join(",")
      );
    }
    res.setHeader("Content-Type", "text/csv");
    res.setHeader(
      "Content-Disposition",
      'attachment; filename="ifl-leads.csv"'
    );
    return res.status(200).send(lines.join("\n") + "\n");
  }

  const rows = await fetchLeads(200);
  return res.status(200).json({
    leads: rows.map((row) => ({
      firstName: String(row.first_name ?? ""),
      email: String(row.email ?? ""),
      source: String(row.source ?? "guide"),
      createdAt: iso(row.created_at) || null,
    })),
  });
}
