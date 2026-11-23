// Newsletter engine — shared helpers for the FL Best Trainer newsletter
// system (Phase 1). Everything that sends marketing mail (sequence,
// weekly, and the guide email that starts the sequence) goes through
// here, so the footer, the unsubscribe link, the List-Unsubscribe
// header, and the UTM tags are identical on every send.
//
// Transactional mail (waiver, purchase delivery) uses lib/mailer.ts
// directly — no footer, no unsubscribe link. That distinction is
// deliberate: a receipt is not marketing.
//
// No DB import at the top level: callers pass the neon `sql` tag in
// (the guide-signup pattern — lib/database throws at import time when
// DATABASE_URL is unset, and these helpers must not break routes that
// degrade gracefully without a DB).

import { createHmac, timingSafeEqual } from "crypto";
import { sendMail, mailerConfigured } from "./mailer";
import {
  renderEmailTemplate,
  renderEmailFooterText,
  type EmailCta,
} from "./emailTemplate";

export type SqlTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Record<string, unknown>[]>;

export const SITE = "https://flbesttrainer.com";

// Footer address — config constant, one-line swap later. DECIDED
// (Gavin 2026-11-23): the LLC's registered agent address for now.
// NOTE: when the system is close to finished, he should probably get a
// virtual mailbox from iPostal1 instead.
export const FOOTER_ADDRESS =
  "FL Best Trainer LLC, 336 E. College Avenue, Suite 301, Tallahassee, FL 32301";

export const FOOTER_BUSINESS = "FL Best Trainer LLC";

// ---------------------------------------------------------------------------
// Tables (additive, same safe shape as `leads`)
// ---------------------------------------------------------------------------

export async function ensureNewsletterTables(sql: SqlTag): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_subscribers (
      id serial primary key,
      email text unique not null,
      first_name text,
      source text,
      subscribed_at timestamptz default now(),
      unsubscribed_at timestamptz,
      sequence_step integer default 0,
      next_send_at timestamptz
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS email_sends (
      id serial primary key,
      email text,
      kind text,
      subject text,
      sent_at timestamptz default now(),
      status text
    )
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS newsletter_drafts (
      id serial primary key,
      subject text,
      body text,
      status text default 'draft',
      created_at timestamptz default now(),
      sent_at timestamptz
    )
  `;
}

// ---------------------------------------------------------------------------
// Subscribers
// ---------------------------------------------------------------------------

export function isValidEmail(email: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

export function normalizeEmail(email: string): string {
  return email.trim().toLowerCase();
}

export interface SubscriberRow {
  id: number;
  email: string;
  first_name: string | null;
  source: string | null;
  subscribed_at: string | null;
  unsubscribed_at: string | null;
  sequence_step: number;
  next_send_at: string | null;
}

// Upsert one subscriber. First source wins; a resubscribe clears
// unsubscribed_at (they asked to hear from us again). Enrollment in the
// sequence happens only when `enrollSequence` is true AND the subscriber
// is not already enrolled, mid-sequence, or finished (step 0 only) — a
// second guide signup never restarts or rewinds the sequence.
export async function upsertSubscriber(
  sql: SqlTag,
  opts: {
    email: string;
    firstName?: string;
    source: string;
    enrollSequence?: boolean;
  }
): Promise<SubscriberRow> {
  const email = normalizeEmail(opts.email);
  const firstName = (opts.firstName ?? "").trim();

  await sql`
    INSERT INTO newsletter_subscribers (email, first_name, source, sequence_step, next_send_at)
    VALUES (${email}, ${firstName || null}, ${opts.source}, 0, NULL)
    ON CONFLICT (email) DO UPDATE SET
      first_name = COALESCE(NULLIF(EXCLUDED.first_name, ''), newsletter_subscribers.first_name),
      unsubscribed_at = NULL
  `;

  if (opts.enrollSequence) {
    await sql`
      UPDATE newsletter_subscribers
      SET sequence_step = 1,
          next_send_at = now() + interval '2 days'
      WHERE email = ${email}
        AND sequence_step = 0
    `;
  }

  const rows = (await sql`
    SELECT id, email, first_name, source, subscribed_at, unsubscribed_at,
           sequence_step, next_send_at
    FROM newsletter_subscribers WHERE email = ${email} LIMIT 1
  `) as unknown as SubscriberRow[];
  return rows[0];
}

// ---------------------------------------------------------------------------
// Unsubscribe tokens — HMAC with the existing NEXTAUTH_SECRET.
// No new secret. Token: base64url(email) + "." + hex(hmac(email)).
// ---------------------------------------------------------------------------

function unsubscribeSecret(): string {
  const secret = process.env.NEXTAUTH_SECRET;
  if (!secret) {
    throw new Error("NEXTAUTH_SECRET not set — cannot sign unsubscribe link");
  }
  return secret;
}

export function signUnsubscribeToken(email: string): string {
  const normalized = normalizeEmail(email);
  const sig = createHmac("sha256", unsubscribeSecret())
    .update(normalized)
    .digest("hex");
  return `${Buffer.from(normalized, "utf8").toString("base64url")}.${sig}`;
}

export function verifyUnsubscribeToken(token: string): string | null {
  try {
    const [encoded, sig] = token.split(".");
    if (!encoded || !sig) return null;
    const email = Buffer.from(encoded, "base64url").toString("utf8");
    if (!isValidEmail(email)) return null;
    const expected = createHmac("sha256", unsubscribeSecret())
      .update(normalizeEmail(email))
      .digest("hex");
    const sigBuf = Buffer.from(sig, "hex");
    const expBuf = Buffer.from(expected, "hex");
    if (sigBuf.length !== expBuf.length) return null;
    if (!timingSafeEqual(sigBuf, expBuf)) return null;
    return normalizeEmail(email);
  } catch {
    return null;
  }
}

export function unsubscribeUrl(email: string): string {
  return `${SITE}/api/newsletter-unsubscribe?token=${signUnsubscribeToken(email)}`;
}

// ---------------------------------------------------------------------------
// Email building — footer, UTM tags, List-Unsubscribe header
// ---------------------------------------------------------------------------

// Adds utm_source=email&utm_medium=email&utm_campaign=<campaign> to a
// link on our own site that doesn't already carry UTM tags.
export function withUtmUrl(url: string, campaign: string): string {
  if (url.includes("utm_source=")) return url;
  const sep = url.includes("?") ? "&" : "?";
  return `${url}${sep}utm_source=email&utm_medium=email&utm_campaign=${campaign}`;
}

export function withUtm(html: string, campaign: string): string {
  return html.replace(
    /href="(https:\/\/flbesttrainer\.com[^"]*)"/g,
    (_match, url: string) => `href="${withUtmUrl(url, campaign)}"`
  );
}

function stripTags(html: string): string {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<\/p>/gi, "\n\n")
    .replace(/<[^>]*>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

export interface BuiltMarketingEmail {
  subject: string;
  html: string;
  text: string;
  headers: Record<string, string>;
}

// Builds the full marketing email through the shared template
// (lib/emailTemplate.ts): header, body, one primary button, PS, footer
// (review ask, follow-along, why-you-get-this, address, unsubscribe).
// The plain-text version carries the same content as plain lines —
// body text, CTA link, PS, footer asks — so it is never a lesser
// email. The footer is added at send time, never stored in the
// content — so the address can change in one place.
export function buildMarketingEmail(opts: {
  subject: string;
  bodyHtml: string;
  email: string;
  campaign: string;
  cta?: EmailCta;
  ps?: string;
}): BuiltMarketingEmail {
  const unsub = unsubscribeUrl(opts.email);
  const body = withUtm(opts.bodyHtml, opts.campaign);
  const cta = opts.cta
    ? { label: opts.cta.label, url: withUtmUrl(opts.cta.url, opts.campaign) }
    : undefined;
  const html = renderEmailTemplate({
    bodyHtml: body,
    cta,
    ps: opts.ps,
    unsubscribeUrl: unsub,
    footerBusiness: FOOTER_BUSINESS,
    footerAddress: FOOTER_ADDRESS,
  });
  const textParts = [stripTags(body)];
  if (cta) textParts.push(`\n${cta.label}: ${cta.url}`);
  if (opts.ps) textParts.push(`\nP.S. ${opts.ps}`);
  const text =
    textParts.join("\n") +
    renderEmailFooterText({
      unsubscribeUrl: unsub,
      footerBusiness: FOOTER_BUSINESS,
      footerAddress: FOOTER_ADDRESS,
    });
  return {
    subject: opts.subject,
    html,
    text,
    headers: { "List-Unsubscribe": `<${unsub}>` },
  };
}

// ---------------------------------------------------------------------------
// Sending + audit log
// ---------------------------------------------------------------------------

export async function logEmailSend(
  sql: SqlTag | null,
  opts: { email: string; kind: string; subject: string; status: string }
): Promise<void> {
  if (!sql) return; // no DB (e.g. guide signup without DATABASE_URL) — skip the log
  try {
    await sql`
      INSERT INTO email_sends (email, kind, subject, status)
      VALUES (${normalizeEmail(opts.email)}, ${opts.kind}, ${opts.subject}, ${opts.status})
    `;
  } catch (err) {
    // The audit log must never break a send.
    console.error("[newsletter] email_sends log failed (continuing):", err);
  }
}

// Sends one marketing email and logs it. Throws when Gmail is not
// configured or the send fails — the caller decides whether that is
// fatal or logged-and-retried. A failed send is logged as 'failed'
// before the throw, so the audit trail shows the attempt.
export async function sendMarketingEmail(
  sql: SqlTag | null,
  opts: {
    to: string;
    firstName?: string;
    subject: string;
    bodyHtml: string;
    kind: string;
    campaign: string;
    cta?: EmailCta;
    ps?: string;
    attachments?: Array<{
      filename: string;
      path?: string;
      content?: string | Buffer;
      encoding?: string;
      contentType?: string;
    }>;
  }
): Promise<void> {
  if (!mailerConfigured()) {
    throw new Error("Gmail env not set — cannot send email");
  }
  const to = normalizeEmail(opts.to);
  const bodyHtml = opts.bodyHtml.replace(
    /\{first_name\}/g,
    (opts.firstName ?? "").trim() || "there"
  );
  const built = buildMarketingEmail({
    subject: opts.subject,
    bodyHtml,
    email: to,
    campaign: opts.campaign,
    cta: opts.cta,
    ps: opts.ps,
  });
  try {
    await sendMail({
      to,
      subject: built.subject,
      html: built.html,
      text: built.text,
      headers: built.headers,
      attachments: opts.attachments,
    });
  } catch (err) {
    await logEmailSend(sql, {
      email: to,
      kind: opts.kind,
      subject: opts.subject,
      status: "failed",
    });
    throw err;
  }
  await logEmailSend(sql, {
    email: to,
    kind: opts.kind,
    subject: opts.subject,
    status: "sent",
  });
}
