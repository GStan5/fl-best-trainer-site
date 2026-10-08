import nodemailer from "nodemailer";
import fs from "fs";
import path from "path";

// Independent for Life — purchase delivery emails (2026-10-08, Gavin
// sign-off day). Called by the NEW online webhook route only; the
// existing in-person flows never touch this. Sends from the site's
// Gmail transport (same pattern as pages/api/guide-signup.ts and
// pages/api/waiver.ts). Delivery by product:
//   starter-plan  → the 4-Week Starter PDF attached + public link
//   self-study    → the 6-Week Program PDF via the buyer's own
//                   session-verified download link (never a public URL)
//   monthly-*     → welcome email (Steady Letter + form-check links)

const SITE = "https://flbesttrainer.com";

export const ONLINE_PRODUCTS = [
  "starter-plan",
  "self-study",
  "monthly-97",
  "monthly-147",
  "monthly-197",
] as const;

export type OnlineProduct = (typeof ONLINE_PRODUCTS)[number];

export function isOnlineProduct(v: unknown): v is OnlineProduct {
  return (
    typeof v === "string" &&
    (ONLINE_PRODUCTS as readonly string[]).includes(v)
  );
}

function transporter() {
  const { GMAIL_USER, GMAIL_PASS } = process.env;
  if (!GMAIL_USER || !GMAIL_PASS) return null;
  return nodemailer.createTransport({
    service: "gmail",
    auth: { user: GMAIL_USER, pass: GMAIL_PASS },
  });
}

const SIGN_OFF = `<p>Stay strong,<br/>Gavin Stanifer, NASM Certified Personal Trainer<br/>FL Best Trainer LLC — Longboat Key, Florida</p>`;

export async function sendPurchaseEmail(
  product: OnlineProduct,
  email: string,
  sessionId: string
): Promise<void> {
  const tx = transporter();
  if (!tx) {
    throw new Error("Gmail env not set — cannot send purchase email");
  }
  const from = `"FL Best Trainer" <${process.env.GMAIL_USER}>`;

  if (product === "starter-plan") {
    const pdfPath = path.join(
      process.cwd(),
      "public/downloads/independent-for-life-starter-plan.pdf"
    );
    const attachments = fs.existsSync(pdfPath)
      ? [
          {
            filename: "Independent-for-Life-4-Week-Starter-Plan.pdf",
            path: pdfPath,
          },
        ]
      : [];
    await tx.sendMail({
      from,
      to: email,
      subject: "Your 4-Week Starter Plan is here",
      html: `
        <p>Welcome in — your <strong>Independent for Life 4-Week Starter Plan</strong> is attached to this email as a PDF.</p>
        <p>You can also download it any time here:<br/>
        <a href="${SITE}/downloads/independent-for-life-starter-plan.pdf">${SITE}/downloads/independent-for-life-starter-plan.pdf</a></p>
        <p>Start with Session 1 and the baseline tests. Print the tracker on the last page — fridge, not a drawer.</p>
        ${SIGN_OFF}
      `,
      attachments,
    });
    return;
  }

  if (product === "self-study") {
    const link = `${SITE}/api/download/self-study?session_id=${encodeURIComponent(sessionId)}`;
    await tx.sendMail({
      from,
      to: email,
      subject: "Your Independent for Life — Self-Study program is here",
      html: `
        <p>Welcome in — your <strong>Independent for Life: 6-Week Strength Foundations</strong> program is ready.</p>
        <p>Download your program here (this link is yours — it verifies your purchase, so keep this email):<br/>
        <a href="${link}">${link}</a></p>
        <p>Begin with the Week 1 baseline tests, write your numbers down, and let the tracker on the last page run the show. The video library unlocks with your site account as the clips are published.</p>
        ${SIGN_OFF}
      `,
    });
    return;
  }

  // monthly-97 / monthly-147 / monthly-197
  const tier =
    product === "monthly-197"
      ? "Monthly Best"
      : product === "monthly-147"
        ? "Monthly Plus"
        : "Monthly";
  await tx.sendMail({
    from,
    to: email,
    subject: `You're in — Independent for Life ${tier}`,
    html: `
      <p>Welcome to <strong>Independent for Life ${tier}</strong>.</p>
      <p>Your training block arrives in the weekly Steady Letter, along with the week's form-check videos and coaching notes. Two links worth saving:</p>
      <p>· Submit a form check: <a href="${SITE}/form-check">${SITE}/form-check</a> (sign in with the account you just used)<br/>
      · Member library: <a href="${SITE}/library">${SITE}/library</a></p>
      <p>First letter lands this week. Train steady.</p>
      ${SIGN_OFF}
    `,
  });
}
