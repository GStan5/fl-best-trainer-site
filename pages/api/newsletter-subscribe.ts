import type { NextApiRequest, NextApiResponse } from "next";
import {
  getSql,
  ensureProgramTables,
} from "../../lib/programAdmin";
import {
  ensureNewsletterTables,
  upsertSubscriber,
  isValidEmail,
  normalizeEmail,
} from "../../lib/newsletter";

// Newsletter signup (homepage box). Email-only, no name field, low
// friction. Writes to newsletter_subscribers with source "newsletter".
// Does NOT enroll in the follow-up sequence: the homepage box does not
// deliver the free guide, and only guide signups get the sequence
// (design doc, gap 2).

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  const email =
    typeof req.body?.email === "string" ? normalizeEmail(req.body.email) : "";
  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Please provide a valid email." });
  }

  const sql = await getSql();
  if (!sql) {
    return res.status(500).json({ error: "Database not configured" });
  }

  try {
    await ensureProgramTables(sql);
    await ensureNewsletterTables(sql);
    await upsertSubscriber(sql, { email, source: "newsletter" });
  } catch (err) {
    console.error("[newsletter-subscribe] save failed:", err);
    return res.status(500).json({ error: "Something went wrong." });
  }

  return res.status(200).json({ ok: true });
}
