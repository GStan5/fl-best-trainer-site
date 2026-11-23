import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import {
  ensureNewsletterTables,
  upsertSubscriber,
  sendMarketingEmail,
  type SqlTag,
} from "../../lib/newsletter";

// NOTE: lib/database is imported lazily inside saveLead, not at the top
// level. The shared module throws at import time when DATABASE_URL is
// unset (pre-existing repo behavior), and this route must still return
// success with no DB env so the on-page download chain never breaks.

// Independent for Life — free 7-day guide signup (Phase 1).
// New route; does not touch any existing API. The DB table is created
// additively (CREATE TABLE IF NOT EXISTS) and no existing table is read
// or modified. If DATABASE_URL or Gmail env is missing, we log and still
// return success: the on-page download is the chain that must never break.

const GUIDE_PDF_URL =
  "https://flbesttrainer.com/downloads/independent-for-life-guide.pdf";

// Signup sources (Phase 2: flagship waitlist joins through this same
// route; waitlist members also receive the free guide. Phase 5: the
// niche founding lists join as "niche-<slug>" sources, one per plan in
// lib/nichePrograms.ts — the per-plan slug is what the admin hub reads
// as member pull). Anything off the allowlist / niche pattern falls
// back to "guide" rather than being rejected.
const ALLOWED_SOURCES = ["guide", "starter", "flagship", "plans"];
const NICHE_SOURCE_RE = /^niche-[a-z0-9-]+$/;

function normalizeSource(raw: unknown): string {
  if (typeof raw === "string") {
    if (ALLOWED_SOURCES.includes(raw)) return raw;
    if (raw.length <= 60 && NICHE_SOURCE_RE.test(raw)) return raw;
  }
  return "guide";
}

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function saveLead(
  firstName: string,
  email: string,
  source: string
): Promise<void> {
  if (!process.env.DATABASE_URL) {
    console.log(
      "[guide-signup] DATABASE_URL not set — skipping lead save for",
      email
    );
    return;
  }
  try {
    const { default: sql } = await import("../../lib/database");
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
      INSERT INTO leads (first_name, email, source)
      VALUES (${firstName}, ${email}, ${source})
    `;
  } catch (err) {
    console.error("[guide-signup] Lead save failed (continuing):", err);
  }
}

async function saveSubscriber(
  firstName: string,
  email: string,
  source: string
): Promise<void> {
  // Same lazy pattern as saveLead: this route must still return success
  // with no DB env so the on-page download chain never breaks.
  if (!process.env.DATABASE_URL) return;
  try {
    const { default: sql } = (await import("../../lib/database")) as {
      default: SqlTag;
    };
    await ensureNewsletterTables(sql);
    // Only guide signups enroll in the follow-up sequence (design doc,
    // gap 2). Flagship / niche / plans signups land on the list only.
    await upsertSubscriber(sql, {
      email,
      firstName,
      source,
      enrollSequence: source === "guide",
    });
  } catch (err) {
    console.error("[guide-signup] Subscriber save failed (continuing):", err);
  }
}

async function sendGuideEmail(
  firstName: string,
  email: string,
  source: string
): Promise<void> {
  const { GMAIL_USER, GMAIL_PASS } = process.env;
  if (!GMAIL_USER || !GMAIL_PASS) {
    console.log(
      "[guide-signup] Gmail env not set — skipping guide email for",
      email
    );
    return;
  }
  try {
    const pdfPath = path.join(
      process.cwd(),
      "public/downloads/independent-for-life-guide.pdf"
    );
    const attachments = fs.existsSync(pdfPath)
      ? [
          {
            filename: "Independent-for-Life-7-Day-Guide.pdf",
            path: pdfPath,
          },
        ]
      : [];

    // Guide email = email 0 of the sequence: it goes through the
    // marketing sender, so it carries the footer, the unsubscribe link,
    // and the List-Unsubscribe header like every other sequence email.
    // The DB log is best-effort — without DATABASE_URL the email still
    // sends and the download chain never breaks.
    let sql: SqlTag | null = null;
    if (process.env.DATABASE_URL) {
      try {
        const mod = (await import("../../lib/database")) as {
          default: SqlTag;
        };
        sql = mod.default;
        await ensureNewsletterTables(sql);
      } catch {
        sql = null;
      }
    }

    await sendMarketingEmail(sql, {
      to: email,
      firstName,
      subject: "Your free 7-Day Starter Guide is here",
      bodyHtml: `
        <p>Hi {first_name},</p>
        <p>Thanks for requesting the <strong>Independent for Life 7-Day Starter Guide</strong> — it's attached to this email as a PDF.</p>
        <p>You can also download it any time here:<br/>
        <a href="${GUIDE_PDF_URL}">${GUIDE_PDF_URL}</a></p>
        <p>Start with Day 1 whenever you're ready. All you need is a sturdy chair, a clear wall, and two water bottles.</p>
        <p>Over the next week I'll send you three short tips. After that, one useful idea a week.</p>
        <p>Stay strong,<br/>Gavin Stanifer, NASM Certified Personal Trainer<br/>FL Best Trainer — Longboat Key, Florida</p>
      `,
      kind: "guide",
      campaign: "guide",
      cta: { label: "Download your guide", url: GUIDE_PDF_URL },
      // Audit M6: email 0 sets the expectation for the sequence and the
      // weekly. Audit S1: no review ask in email 0 — value first.
      // No hero photo — Hormozi's no-images rule (research Part B):
      // the template renders the signature headshot only.
      preheader: "Your free guide is attached — start with Day 1.",
      showReview: false,
      source,
      attachments,
    });
  } catch (err) {
    console.error("[guide-signup] Guide email failed (continuing):", err);
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

  const firstName =
    typeof req.body?.firstName === "string" ? req.body.firstName.trim() : "";
  const email =
    typeof req.body?.email === "string" ? req.body.email.trim() : "";
  const source = normalizeSource(req.body?.source);

  if (!firstName || !email || !isValidEmail(email)) {
    return res
      .status(400)
      .json({ error: "Please provide your first name and a valid email." });
  }

  await saveLead(firstName, email, source);
  await saveSubscriber(firstName, email, source);
  await sendGuideEmail(firstName, email, source);

  return res.status(200).json({
    ok: true,
    downloadUrl: "/downloads/independent-for-life-guide.pdf",
  });
}
