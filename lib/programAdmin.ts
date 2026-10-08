import type { NextApiRequest, NextApiResponse } from "next";

// Server-only helpers for the Independent for Life run-it endpoints
// (Phase 5): pages/api/program-admin.ts, program-leads.ts, form-check.ts.
// New file — no existing endpoint or table is modified.
//
// The admin check MIRRORS pages/api/admin/class-attendees.ts exactly:
// getServerSession(req, res, authOptions), 401 when there is no session
// email, then a users.is_admin lookup, 403 when not an admin.
//
// lib/database and the auth options are imported lazily (the
// guide-signup pattern): the shared DB module throws at import time
// when DATABASE_URL is unset, and these routes must still answer
// 401/403 cleanly for signed-out requests in any environment.

export type CheckoutMode = "test" | "live" | "off";

// How the online checkout would behave right now. Derived ONLY from key
// prefix + the go-live flag; never returns any key material. Mirrors the
// guard in pages/api/stripe/checkout-online.ts: a test key runs test
// checkouts, a live key sells only when ONLINE_SALES_LIVE === "true",
// anything else refuses (reported here as "off").
export function checkoutMode(): CheckoutMode {
  const key = process.env.STRIPE_SECRET_KEY || "";
  if (key.startsWith("sk_test_")) return "test";
  if (key.startsWith("sk_live_") && process.env.ONLINE_SALES_LIVE === "true") {
    return "live";
  }
  return "off";
}

type SqlTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Record<string, unknown>[]>;

// Lazily load the shared neon client; null when DATABASE_URL is unset.
export async function getSql(): Promise<SqlTag | null> {
  if (!process.env.DATABASE_URL) return null;
  const { default: sql } = await import("./database");
  return sql as unknown as SqlTag;
}

// Creates the additive Phase 1/5 tables when missing (same DDL as
// pages/api/guide-signup.ts for leads). Never touches existing tables.
export async function ensureProgramTables(sql: SqlTag): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS leads (
      id serial primary key,
      first_name text,
      email text,
      source text,
      created_at timestamptz default now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS events (
      id serial primary key,
      page text,
      event text default 'view',
      created_at timestamptz default now()
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS form_checks (
      id serial primary key,
      email text,
      name text,
      video_url text,
      note text,
      status text default 'pending',
      created_at timestamptz default now()
    )
  `;
}

async function getSessionEmail(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<string | null> {
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("../pages/api/auth/[...nextauth]");
    const session = await getServerSession(req, res, authOptions);
    return session?.user?.email ?? null;
  } catch (err) {
    console.error("[program] session lookup failed:", err);
    return null;
  }
}

// Member gate: returns the signed-in email, or sends 401 and returns null.
export async function requireMember(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<string | null> {
  const email = await getSessionEmail(req, res);
  if (!email) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }
  return email;
}

// Admin gate (mirrors pages/api/admin/class-attendees.ts): returns the
// admin email, or sends 401/403/500 and returns null.
export async function requireAdmin(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<string | null> {
  const email = await getSessionEmail(req, res);
  if (!email) {
    res.status(401).json({ error: "Unauthorized" });
    return null;
  }

  const sql = await getSql();
  if (!sql) {
    res.status(500).json({ error: "Database not configured" });
    return null;
  }

  try {
    const rows = await sql`
      SELECT is_admin FROM users WHERE email = ${email} LIMIT 1
    `;
    if (rows.length === 0 || !rows[0].is_admin) {
      res.status(403).json({ error: "Admin access required" });
      return null;
    }
  } catch (err) {
    console.error("[program] admin check failed:", err);
    res.status(500).json({ error: "Internal server error" });
    return null;
  }

  return email;
}

// Session user's display name (best effort; "" when unavailable).
export async function getSessionName(
  req: NextApiRequest,
  res: NextApiResponse
): Promise<string> {
  try {
    const { getServerSession } = await import("next-auth");
    const { authOptions } = await import("../pages/api/auth/[...nextauth]");
    const session = await getServerSession(req, res, authOptions);
    return session?.user?.name ?? "";
  } catch {
    return "";
  }
}
