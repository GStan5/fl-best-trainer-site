import { NextApiRequest, NextApiResponse } from "next";
import { TRACKED_PAGES } from "../../lib/programs";

// Independent for Life — first-party funnel tracking beacon (Phase 5).
// New route; receives page-view + checkout-success events from
// components/FunnelTracker.tsx into the additive `events` table.
// No cookies, no identifiers, no PII — just (page, event, time).
// Fire-and-forget semantics: ALWAYS 200 { ok: true }; DB errors are
// logged and swallowed so tracking can never break a page.

const EVENT_PATTERN = /^[a-z_]{1,40}$/;

// Tiny in-memory rate limit: 60 requests/min/IP per instance.
const hits = new Map<string, { count: number; windowStart: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = hits.get(ip);
  if (!entry || now - entry.windowStart > 60_000) {
    hits.set(ip, { count: 1, windowStart: now });
    return false;
  }
  entry.count += 1;
  return entry.count > 60;
}

async function recordEvent(page: string, event: string): Promise<void> {
  if (!process.env.DATABASE_URL) return;
  try {
    const { getSql, ensureProgramTables } = await import(
      "../../lib/programAdmin"
    );
    const sql = await getSql();
    if (!sql) return;
    await ensureProgramTables(sql);
    await sql`
      INSERT INTO events (page, event) VALUES (${page}, ${event})
    `;
  } catch (err) {
    console.error("[track] event insert failed (ignored):", err);
  }
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const forwarded = req.headers["x-forwarded-for"];
  const ip =
    (Array.isArray(forwarded) ? forwarded[0] : forwarded)?.split(",")[0]?.trim() ||
    req.socket.remoteAddress ||
    "unknown";

  if (rateLimited(ip)) {
    return res.status(200).json({ ok: true });
  }

  const page = typeof req.body?.page === "string" ? req.body.page : "";
  const rawEvent = typeof req.body?.event === "string" ? req.body.event : "";
  const event = EVENT_PATTERN.test(rawEvent) ? rawEvent : "view";

  // Only allowlisted funnel pages are stored; anything else is a
  // successful no-op so callers never need to care.
  if (TRACKED_PAGES.includes(page)) {
    await recordEvent(page, event);
  }

  return res.status(200).json({ ok: true });
}
