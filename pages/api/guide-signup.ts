import { NextApiRequest, NextApiResponse } from "next";
import fs from "fs";
import path from "path";
import {
  ensureNewsletterTables,
  upsertSubscriber,
  sendMarketingEmail,
  normalizeEmail,
  type SqlTag,
} from "../../lib/newsletter";
import { NEWSLETTER_SEND_GATE_ON } from "../../lib/ladder";
import { getPostById } from "../../utils/markdown";

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
  "https://www.flbesttrainer.com/downloads/independent-for-life-guide.pdf";

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

// Attribution for the analytics build (2026-11-24): which post sent
// the reader, and which channel (UTM) they arrived with. postId must
// be a real blog post id — a made-up ?from= value stores as null, so
// junk never pollutes the per-post numbers. UTM values are free text
// (they come from ad platforms), capped at 100 chars.
function normalizePostId(raw: unknown): string | null {
  if (typeof raw !== "string" || raw.length > 80) return null;
  return getPostById(raw) ? raw : null;
}

function normalizeUtm(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  const v = raw.trim().slice(0, 100);
  return v === "" ? null : v;
}

async function saveLead(
  firstName: string,
  email: string,
  source: string,
  attribution?: {
    postId?: string | null;
    utmSource?: string | null;
    utmMedium?: string | null;
    utmCampaign?: string | null;
  }
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
    // Attribution columns (analytics, 2026-11-24): ADD COLUMN IF
    // NOT EXISTS so the live table (created before these existed)
    // gains them on the next signup — same safe additive shape as
    // the newsletter tables.
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS post_id text`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_source text`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_medium text`;
    await sql`ALTER TABLE leads ADD COLUMN IF NOT EXISTS utm_campaign text`;
    await sql`
      INSERT INTO leads (first_name, email, source, post_id, utm_source, utm_medium, utm_campaign)
      VALUES (${firstName}, ${email}, ${source}, ${attribution?.postId ?? null}, ${attribution?.utmSource ?? null}, ${attribution?.utmMedium ?? null}, ${attribution?.utmCampaign ?? null})
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
    // Send gate (Gavin 2026-11-23): while the gate is ON, NOBODY
    // enrolls — new guide signups land on the list at step 0 with no
    // sequence and no next_send_at (like the flagship lead today), so
    // nobody silently queues up for the day the gate lifts. The guide
    // email itself still sends (transactional — the PDF they asked
    // for); only the sequence enrollment is gated.
    await upsertSubscriber(sql, {
      email,
      firstName,
      source,
      enrollSequence: source === "guide" && !NEWSLETTER_SEND_GATE_ON,
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
      // Guide email = email 0, restructured per Hormozi and APPROVED
      // by Gavin 2026-11-23 ~14:32 ("guide email 0 good") — that
      // approval covered the copy as it stood then. The reply prompt
      // was removed 2026-11-24 under the zero-contact rule (Gavin
      // 2026-11-24): the email now ends with a link to the
      // start-here hub instead. Those new words are NOT approved
      // until Gavin says so from the exact renders. Headline is the
      // immediate reward; the PS restates the setup. No sign-off
      // paragraph — the template's signature block closes the letter.
      // Water-bottle line (Gavin ~14:32): "water bottles or your
      // preferred dumbbell weight". Expectation line unchanged (audit
      // M6): the sequence and the weekly are promised here, never a
      // surprise.
      bodyHtml: `
        <p>Hi {first_name},</p>
        <p>Thanks for requesting the <strong>Independent for Life 7-Day Starter Guide</strong>, it's attached to this email as a PDF.</p>
        <p>You can also download it any time here:<br/>
        <a href="${GUIDE_PDF_URL}">${GUIDE_PDF_URL}</a></p>
        <p>Start with Day 1 whenever you're ready. All you need is a sturdy chair, a clear wall, and water bottles or your preferred dumbbell weight.</p>
        <p>When you finish Day 1, here is what to read next: <a href="https://www.flbesttrainer.com/blog/start-here">start here</a>. It is every idea from the blog, grouped by what you need.</p>
        <p>Over the next week I'll send you three short tips. After that, one useful idea a week.</p>
      `,
      kind: "guide",
      campaign: "guide",
      cta: { label: "Download your guide", url: GUIDE_PDF_URL },
      headline: "Your guide is attached. Start with Day 1.",
      ps: "Start with Day 1 when you are ready. A chair, a wall, and water bottles or your preferred dumbbell weight is all you need.",
      // Audit M6: email 0 sets the expectation for the sequence and the
      // weekly. Audit S1: no review ask in email 0 — value first.
      // No hero photo — Hormozi's no-images rule (research Part B):
      // the template renders the signature headshot only.
      preheader: "Your free guide is attached. Start with Day 1.",
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
  // One address, one spelling: emails are normalized (trim +
  // lowercase) at every entry point, so GavinStanifer@live.com and
  // gavinstanifer@live.com land on the same row. Covers the lead
  // save, the subscriber upsert, and the guide email below.
  const email =
    typeof req.body?.email === "string"
      ? normalizeEmail(req.body.email)
      : "";
  const source = normalizeSource(req.body?.source);
  // Attribution (analytics, 2026-11-24): the post that sent the
  // reader (?from= on the /start link, added by the blog post view)
  // and the UTM channel (ad URLs carry utm_source=facebook /
  // instagram / google). Validated, never trusted raw.
  const attribution = {
    postId: normalizePostId(req.body?.postId),
    utmSource: normalizeUtm(req.body?.utm_source),
    utmMedium: normalizeUtm(req.body?.utm_medium),
    utmCampaign: normalizeUtm(req.body?.utm_campaign),
  };

  if (!firstName || !email || !isValidEmail(email)) {
    return res
      .status(400)
      .json({ error: "Please provide your first name and a valid email." });
  }

  await saveLead(firstName, email, source, attribution);
  await saveSubscriber(firstName, email, source);
  await sendGuideEmail(firstName, email, source);

  return res.status(200).json({
    ok: true,
    downloadUrl: "/downloads/independent-for-life-guide.pdf",
  });
}
