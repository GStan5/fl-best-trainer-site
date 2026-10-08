import { NextApiRequest, NextApiResponse } from "next";
import {
  requireMember,
  requireAdmin,
  getSessionName,
  getSql,
  ensureProgramTables,
} from "../../lib/programAdmin";

// Independent for Life — member form-check submissions (Phase 5).
// New route. Members paste a video link on /form-check; submissions
// land in the additive `form_checks` table and Gavin works the queue
// at /admin/online-form-checks, reviewing videos in the weekly
// Steady Letter.
//
// - POST: any signed-in member (email/name taken from the session,
//   never the request body). 401 signed-out.
// - GET: admin-only queue read (newest first, pending first).
// - PATCH: admin-only status toggle { id, status: pending|reviewed }.

function isHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function iso(value: unknown): string | null {
  if (value === null || value === undefined) return null;
  const d = value instanceof Date ? value : new Date(String(value));
  return Number.isNaN(d.getTime()) ? null : d.toISOString();
}

async function handlePost(req: NextApiRequest, res: NextApiResponse) {
  const email = await requireMember(req, res);
  if (!email) return;

  const videoUrl =
    typeof req.body?.videoUrl === "string" ? req.body.videoUrl.trim() : "";
  const note =
    typeof req.body?.note === "string" ? req.body.note.trim().slice(0, 1000) : "";

  if (!videoUrl || !isHttpUrl(videoUrl)) {
    return res
      .status(400)
      .json({ error: "Please paste a valid video link (http/https)." });
  }

  const sql = await getSql();
  if (!sql) {
    return res.status(503).json({ error: "Submissions are unavailable." });
  }

  try {
    const name = await getSessionName(req, res);
    await ensureProgramTables(sql);
    await sql`
      INSERT INTO form_checks (email, name, video_url, note)
      VALUES (${email}, ${name}, ${videoUrl}, ${note})
    `;
    return res.status(200).json({ ok: true });
  } catch (err) {
    console.error("[form-check] insert failed:", err);
    return res.status(500).json({ error: "Could not save your video." });
  }
}

async function handleGet(req: NextApiRequest, res: NextApiResponse) {
  const adminEmail = await requireAdmin(req, res);
  if (!adminEmail) return;

  const sql = await getSql();
  if (!sql) {
    return res.status(200).json({ formChecks: [] });
  }

  try {
    await ensureProgramTables(sql);
    const rows = await sql`
      SELECT id, email, name, video_url, note, status, created_at
      FROM form_checks
      ORDER BY (status = 'pending') DESC, created_at DESC
      LIMIT 200
    `;
    return res.status(200).json({
      formChecks: rows.map((row) => ({
        id: Number(row.id),
        email: String(row.email ?? ""),
        name: String(row.name ?? ""),
        videoUrl: String(row.video_url ?? ""),
        note: String(row.note ?? ""),
        status: String(row.status ?? "pending"),
        createdAt: iso(row.created_at),
      })),
    });
  } catch (err) {
    console.error("[form-check] queue read failed:", err);
    return res.status(200).json({ formChecks: [] });
  }
}

async function handlePatch(req: NextApiRequest, res: NextApiResponse) {
  const adminEmail = await requireAdmin(req, res);
  if (!adminEmail) return;

  const id = Number(req.body?.id);
  const status = req.body?.status;
  if (!Number.isInteger(id) || (status !== "pending" && status !== "reviewed")) {
    return res
      .status(400)
      .json({ error: "Provide an id and status of pending or reviewed." });
  }

  const sql = await getSql();
  if (!sql) {
    return res.status(503).json({ error: "Database not configured" });
  }

  try {
    await ensureProgramTables(sql);
    const rows = await sql`
      UPDATE form_checks SET status = ${status}
      WHERE id = ${id}
      RETURNING id, status
    `;
    if (rows.length === 0) {
      return res.status(404).json({ error: "Submission not found" });
    }
    return res.status(200).json({ ok: true, id, status });
  } catch (err) {
    console.error("[form-check] status update failed:", err);
    return res.status(500).json({ error: "Could not update status" });
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "POST") return handlePost(req, res);
  if (req.method === "GET") return handleGet(req, res);
  if (req.method === "PATCH") return handlePatch(req, res);
  res.setHeader("Allow", "GET, POST, PATCH");
  return res.status(405).json({ error: "Method not allowed" });
}
