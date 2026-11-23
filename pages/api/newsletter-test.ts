import type { NextApiRequest, NextApiResponse } from "next";
import { getSql } from "../../lib/programAdmin";
import { mailerConfigured } from "../../lib/mailer";
import {
  ensureNewsletterTables,
  sendMarketingEmail,
  isValidEmail,
  normalizeEmail,
  isTestRecipient,
} from "../../lib/newsletter";
import { sequenceEmailForStep } from "../../lib/sequenceEmails";

// Test route — send any sequence step to a TEST address on demand, so
// the dry run covers all 3 emails in one sitting instead of waiting a
// week. Same CRON_SECRET Bearer check as the cron routes.
//
// Dry run is the default (?dryRun=1, or omit it): builds the email and
// reports what WOULD be sent, sends nothing, logs nothing. Pass
// dryRun=0 for a real send — which needs the step to be approved by
// Gavin first, and a test address only: live sends are refused to any
// address outside the two test recipients (audit M2). Dry runs may
// keep any address.

function verifyCron(req: NextApiRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // matches the other cron routes
  return req.headers.authorization === `Bearer ${cronSecret}`;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ error: "Method not allowed" });
  }

  if (!verifyCron(req)) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  const email =
    typeof req.body?.email === "string" ? normalizeEmail(req.body.email) : "";
  const step = Number(req.body?.step);
  const dryRun = req.body?.dryRun !== 0 && req.body?.dryRun !== "0" && req.body?.dryRun !== false;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Please provide a valid email." });
  }
  const emailDef = sequenceEmailForStep(step);
  if (!emailDef) {
    return res
      .status(400)
      .json({ error: "Step must be 1, 2, or 3." });
  }

  if (dryRun) {
    return res.status(200).json({
      ok: true,
      dryRun: true,
      sent: false,
      wouldSend: {
        to: email,
        step: emailDef.step,
        subject: emailDef.subject,
        kind: `sequence-${emailDef.step}`,
        campaign: emailDef.campaign,
      },
    });
  }

  // Real send: needs Gavin's approval, a configured mailer, and a
  // test address only (audit M2 — a typo must never send a live
  // sequence email to a stranger). Checked before the mailer, so the
  // refusal holds even without Gmail env.
  if (!isTestRecipient(email)) {
    return res.status(400).json({
      error:
        "Test sends go only to gavinstanifer@live.com and grim1051990@gmail.com — nothing sent.",
    });
  }
  if (!emailDef.approved) {
    return res.status(400).json({
      error: "Sequence step not approved yet — nothing sent.",
    });
  }
  if (!mailerConfigured()) {
    return res.status(503).json({
      ok: false,
      error: "Mailer not configured — Gmail env missing, nothing sent.",
    });
  }

  const sql = await getSql();
  if (!sql) {
    return res.status(500).json({ error: "Database not configured" });
  }

  try {
    await ensureNewsletterTables(sql);
    await sendMarketingEmail(sql, {
      to: email,
      subject: emailDef.subject,
      bodyHtml: emailDef.html,
      kind: `sequence-${emailDef.step}`,
      campaign: emailDef.campaign,
      cta: emailDef.cta,
      ctaRepeat: emailDef.ctaRepeat,
      ps: emailDef.ps,
      pps: emailDef.pps,
      headline: emailDef.headline,
      preheader: emailDef.preheader,
      eyebrow: emailDef.eyebrow,
      showReview: emailDef.showReview,
      source: "guide",
    });
    return res.status(200).json({ ok: true, dryRun: false, sent: true });
  } catch (err) {
    console.error("[newsletter-test] send failed:", err);
    return res.status(500).json({
      ok: false,
      error: err instanceof Error ? err.message : "Send failed",
    });
  }
}
