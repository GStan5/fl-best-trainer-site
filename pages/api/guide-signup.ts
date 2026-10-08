import { NextApiRequest, NextApiResponse } from "next";
import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

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

function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

async function saveLead(firstName: string, email: string): Promise<void> {
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
      VALUES (${firstName}, ${email}, 'guide')
    `;
  } catch (err) {
    console.error("[guide-signup] Lead save failed (continuing):", err);
  }
}

async function sendGuideEmail(firstName: string, email: string): Promise<void> {
  const { GMAIL_USER, GMAIL_PASS } = process.env;
  if (!GMAIL_USER || !GMAIL_PASS) {
    console.log(
      "[guide-signup] Gmail env not set — skipping guide email for",
      email
    );
    return;
  }
  try {
    // Same Gmail/nodemailer transport pattern as pages/api/waiver.ts.
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: GMAIL_USER,
        pass: GMAIL_PASS,
      },
    });

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

    await transporter.sendMail({
      from: `"FL Best Trainer" <${GMAIL_USER}>`,
      to: email,
      subject: "Your free 7-Day Starter Guide is here",
      html: `
        <p>Hi ${firstName},</p>
        <p>Thanks for requesting the <strong>Independent for Life 7-Day Starter Guide</strong> — it's attached to this email as a PDF.</p>
        <p>You can also download it any time here:<br/>
        <a href="${GUIDE_PDF_URL}">${GUIDE_PDF_URL}</a></p>
        <p>Start with Day 1 whenever you're ready. All you need is a sturdy chair, a clear wall, and two water bottles.</p>
        <p>Stay strong,<br/>Gavin Stanifer, NASM Certified Personal Trainer<br/>FL Best Trainer — Longboat Key, Florida</p>
      `,
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

  if (!firstName || !email || !isValidEmail(email)) {
    return res
      .status(400)
      .json({ error: "Please provide your first name and a valid email." });
  }

  await saveLead(firstName, email);
  await sendGuideEmail(firstName, email);

  return res.status(200).json({
    ok: true,
    downloadUrl: "/downloads/independent-for-life-guide.pdf",
  });
}
