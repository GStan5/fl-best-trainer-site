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
import { marketingSendAllowed } from "../../lib/ladder";
import { sequenceEmailForStep } from "../../lib/sequenceEmails";
import { postPurchaseEmailForStep } from "../../lib/postPurchaseEmails";
import { winbackEmailForStep } from "../../lib/winbackEmails";

// Test route — send any sequence, post-purchase, or winback step to a
// TEST address on demand, so the dry run covers every email in one
// sitting instead of waiting weeks. Same CRON_SECRET Bearer check as
// the cron routes.
//
// POST { email, kind, step, dryRun }
//   kind: "sequence" (default, steps 1–4), "post-purchase" (1–4),
//         "winback" (1–3). Unknown kind → 400.
//
// Dry run is the default (?dryRun=1, or omit it): builds the email and
// reports what WOULD be sent, sends nothing, logs nothing. Pass
// dryRun=0 for a real send — which needs the step to be approved by
// Gavin first, and a test address only: live sends are refused to any
// address outside the two test recipients (audit M2). Dry runs may
// keep any address. The sequence steps are approved only when
// SEQUENCE_APPROVED is flipped (the launch gate); the post-purchase
// and winback defs are approved copy, so their test sends work as
// soon as this branch is deployed.

function verifyCron(req: NextApiRequest): boolean {
  const cronSecret = process.env.CRON_SECRET;
  if (!cronSecret) return true; // matches the other cron routes
  return req.headers.authorization === `Bearer ${cronSecret}`;
}

interface EmailDef {
  step: number;
  subject: string;
  campaign: string;
  approved: boolean;
  cta?: { label: string; url: string };
  ctaRepeat?: boolean;
  ps?: string;
  pps?: string;
  headline?: string;
  preheader?: string;
  eyebrow?: string;
  showReview: boolean;
  html: string;
}

const KINDS: Record<
  string,
  { resolve: (step: number) => EmailDef | null; steps: string; source: string }
> = {
  sequence: {
    resolve: sequenceEmailForStep,
    steps: "1, 2, 3, or 4",
    source: "guide",
  },
  "post-purchase": {
    resolve: postPurchaseEmailForStep,
    steps: "1, 2, 3, or 4",
    source: "purchase",
  },
  winback: {
    resolve: winbackEmailForStep,
    steps: "1, 2, or 3",
    source: "guide",
  },
};

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
  const kind =
    typeof req.body?.kind === "string" ? req.body.kind : "sequence";
  const dryRun = req.body?.dryRun !== 0 && req.body?.dryRun !== "0" && req.body?.dryRun !== false;

  if (!email || !isValidEmail(email)) {
    return res.status(400).json({ error: "Please provide a valid email." });
  }
  const kindDef = KINDS[kind];
  if (!kindDef) {
    return res.status(400).json({
      error: "Kind must be sequence, post-purchase, or winback.",
    });
  }
  const emailDef = kindDef.resolve(step);
  if (!emailDef) {
    return res
      .status(400)
      .json({ error: `Step must be ${kindDef.steps} for kind ${kind}.` });
  }

  if (dryRun) {
    // Send gate (Gavin 2026-11-23): a dry run reports what WOULD
    // happen live — and live, a non-allowlisted address is skipped,
    // not sent. So the dry run reports the skip, with wouldSend null.
    if (!marketingSendAllowed(email)) {
      return res.status(200).json({
        ok: true,
        dryRun: true,
        sent: false,
        status: "skipped-not-allowlisted",
        detail:
          "Send gate is ON — only the allowlist receives marketing email.",
        wouldSend: null,
      });
    }
    return res.status(200).json({
      ok: true,
      dryRun: true,
      sent: false,
      status: "would-send",
      wouldSend: {
        to: email,
        kind,
        step: emailDef.step,
        subject: emailDef.subject,
        campaign: emailDef.campaign,
      },
    });
  }

  // Real send: needs Gavin's approval, a configured mailer, and a
  // test address only (audit M2 — a typo must never send a live
  // sequence email to a stranger). Checked before the mailer, so the
  // refusal holds even without Gmail env. The send gate is checked
  // too — it is unreachable while the test recipients are all
  // allowlisted, but the gate must hold even if that list ever
  // changes.
  if (!isTestRecipient(email)) {
    return res.status(400).json({
      error:
        "Test sends go only to gavinstanifer@live.com and grim1051990@gmail.com — nothing sent.",
    });
  }
  if (!marketingSendAllowed(email)) {
    return res.status(400).json({
      error:
        "Send gate is ON — only the allowlist receives marketing email. Nothing sent.",
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
      kind: `${kind}-${emailDef.step}`,
      campaign: emailDef.campaign,
      cta: emailDef.cta,
      ctaRepeat: emailDef.ctaRepeat,
      ps: emailDef.ps,
      pps: emailDef.pps,
      headline: emailDef.headline,
      preheader: emailDef.preheader,
      eyebrow: emailDef.eyebrow,
      showReview: emailDef.showReview,
      source: kindDef.source,
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
