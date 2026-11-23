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
  renderSignatureText,
  whyYouGetThisLine,
  type EmailCta,
} from "./emailTemplate";
import {
  SITE,
  ladderRank,
  nextRungAfterProducts,
  weeklyDealForProducts,
  marketingSendAllowed,
  type WeeklyDeal,
} from "./ladder";
// Re-exported so existing import sites keep working: the ladder is
// the single source of truth, this file just passes it through.
export { SITE } from "./ladder";
export type { WeeklyDeal } from "./ladder";
export { ladderRank, weeklyDealForProducts } from "./ladder";
import {
  postPurchaseEmailForStep,
  postPurchaseDueInDays,
  postPurchaseGapDays,
  type PostPurchaseEmail,
} from "./postPurchaseEmails";
import {
  winbackEmailForStep,
  winbackGapDays,
  type WinbackEmail,
} from "./winbackEmails";
import { sequenceDueInDays } from "./sequenceEmails";

export type SqlTag = (
  strings: TemplateStringsArray,
  ...values: unknown[]
) => Promise<Record<string, unknown>[]>;

// SITE, WeeklyDeal, ladderRank, weeklyDealForProducts live in
// lib/ladder.ts (the single source of truth) and are re-exported
// above so existing import sites keep working.

// Footer address — config constant, one-line swap later. DECIDED
// (Gavin 2026-11-23): the LLC's registered agent address for now.
// NOTE: when the system is close to finished, he should probably get a
// virtual mailbox from iPostal1 instead.
export const FOOTER_ADDRESS =
  "FL Best Trainer LLC, 336 E. College Avenue, Suite 301, Tallahassee, FL 32301";

export const FOOTER_BUSINESS = "FL Best Trainer LLC";

// Test sends go ONLY to these two addresses (Gavin 2026-11-23) —
// Gavin's, and Grim's so he can open it and see what a client sees.
// Enforced in the test routes; a live send to any other address is
// refused. Dry runs may use any address.
export const TEST_RECIPIENTS = [
  "gavinstanifer@live.com",
  "grim1051990@gmail.com",
] as const;

export function isTestRecipient(email: string): boolean {
  return (TEST_RECIPIENTS as readonly string[]).includes(
    normalizeEmail(email)
  );
}

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
  // One address, one spelling (Gavin 2026-11-23): emails are
  // normalized (trim + lowercase) at every entry point, and the DB
  // itself refuses a second spelling — a mixed-case signup can never
  // create a second row for an existing address, even racing the
  // upsert. The plain `email unique` stays; this index is the
  // case-insensitive guard on top of it.
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS newsletter_subscribers_email_lower_idx
    ON newsletter_subscribers (lower(email))
  `;
  await sql`
    CREATE TABLE IF NOT EXISTS email_sends (
      id serial primary key,
      email text,
      kind text,
      subject text,
      sent_at timestamptz default now(),
      status text,
      channel text default 'email'
    )
  `;
  // SMS seam (Gavin 2026-11-23: texting is NOT built now, but the
  // audit log is ready for it): every send records its channel.
  // 'email' is the only channel today; a future SMS sender writes
  // 'sms' here. Same additive shape as the other ALTERs.
  await sql`
    ALTER TABLE email_sends
    ADD COLUMN IF NOT EXISTS channel text DEFAULT 'email'
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
  // Weekly CTA (audit M3): a draft can carry its own primary button.
  // ADD COLUMN IF NOT EXISTS so tables created before this column
  // existed get it on the next call — same safe additive shape.
  await sql`
    ALTER TABLE newsletter_drafts
    ADD COLUMN IF NOT EXISTS cta_label text
  `;
  await sql`
    ALTER TABLE newsletter_drafts
    ADD COLUMN IF NOT EXISTS cta_url text
  `;
  // Weekly 4-block structure (Gavin 2026-11-23): a weekly draft is
  // an idea, a focus/strategy, and a gear item — not a free-form
  // body. The deal (block 4) is NOT in the draft: it is resolved per
  // recipient at send time from purchase_emails (see
  // resolveWeeklyDeal). Same additive shape as above.
  await sql`
    ALTER TABLE newsletter_drafts
    ADD COLUMN IF NOT EXISTS idea text
  `;
  await sql`
    ALTER TABLE newsletter_drafts
    ADD COLUMN IF NOT EXISTS strategy text
  `;
  await sql`
    ALTER TABLE newsletter_drafts
    ADD COLUMN IF NOT EXISTS item_name text
  `;
  await sql`
    ALTER TABLE newsletter_drafts
    ADD COLUMN IF NOT EXISTS item_body text
  `;
  await sql`
    ALTER TABLE newsletter_drafts
    ADD COLUMN IF NOT EXISTS item_url text
  `;
  // Post-purchase sequence (research B7, wired 2026-11-23): its own
  // send state, NOT sequence_step — a buyer may also be mid-sequence
  // and the two run side by side. step 1 = thank-you (due at
  // purchase), 2 = Day 2, 3 = Day 7 (Self-Study nudge, Starter
  // buyers only), 4 = Day 14 (referral ask), 5 = finished. product
  // is the highest rung bought (see ladderRank) — a later purchase
  // of a higher rung upgrades it, and the step-3 check reads it.
  await sql`
    CREATE TABLE IF NOT EXISTS post_purchase_sequences (
      id serial primary key,
      email text unique not null,
      product text,
      step integer default 0,
      next_send_at timestamptz,
      created_at timestamptz default now()
    )
  `;
  // Winback sequence (research B9, wired 2026-11-23): the re-engage
  // step of the sunset policy. step 1 = "It's been a while" (due at
  // enrollment), 2 = one big useful thing (+5d), 3 = "Should I stop
  // sending these?" (+5d), 4 = done — suppression happens only after
  // step 3. Suppression is a state, never a delete.
  await sql`
    CREATE TABLE IF NOT EXISTS winback_sequences (
      id serial primary key,
      email text unique not null,
      step integer default 0,
      next_send_at timestamptz,
      created_at timestamptz default now()
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
    // Due date comes from the sequence def (step 1's sendAfterDays),
    // not a literal — the defs are the timing config.
    const dueInDays = sequenceDueInDays(1);
    await sql`
      UPDATE newsletter_subscribers
      SET sequence_step = 1,
          next_send_at = now() + make_interval(days => ${dueInDays})
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
    // Strict shape: the signature must be exactly 64 hex chars.
    // Without this, Buffer.from(sig, "hex") silently truncates at
    // the first non-hex character — so a valid token with junk
    // appended to it would still verify.
    if (!/^[0-9a-f]{64}$/.test(sig)) return null;
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

// Draft bodies are stored as plain text (Grim writes them in chat
// voice); at render time, blank-line-separated blocks become
// paragraphs. Bare URLs are linkified — a pasted link has to be
// clickable, or the blog -> trust -> gear + plans loop is a dead end
// (audit M3). Markdown links [label](url) render as a labelled link.
// A block that is exactly one of the fixed weekly section names
// ("One idea", "One focus", "One item", "One deal" — the weekly's
// 4-block container, Gavin 2026-11-23) renders as a bold uppercase
// 14px heading instead of a body paragraph, so the fixed container
// reads as a container and not stray paragraphs.
const WEEKLY_SECTION_HEADINGS = [
  "one idea",
  "one focus",
  "one item",
  "one deal",
];

export function textToHtml(body: string): string {
  const escaped = body
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
  // Markdown links first: [Check the price](https://...) becomes a
  // labelled link. The bare-URL pass below must not re-link the URL
  // inside the href it just created — the lookbehind skips any URL
  // immediately after href=".
  const linked = escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_match, label: string, url: string) =>
      `<a href="${url}">${label}</a>`
  );
  const linkified = linked.replace(
    /(?<!href=")(https?:\/\/[^\s<"]+)/g,
    (url: string) => {
      // Un-escape &amp; inside the href only — the visible text keeps
      // the escaped form so a pasted URL still reads correctly.
      const href = url.replace(/&amp;/g, "&");
      return `<a href="${href}">${url}</a>`;
    }
  );
  return linkified
    .split(/\n\s*\n/)
    .map((block) => {
      const headingText = block.trim().replace(/:$/, "");
      if (
        WEEKLY_SECTION_HEADINGS.includes(headingText.toLowerCase()) &&
        !block.includes("<br />")
      ) {
        return `<p style="margin: 16px 0 4px; font-size: 14px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #4169E1;">${headingText}</p>`;
      }
      return `<p>${block.replace(/\n/g, "<br />")}</p>`;
    })
    .join("\n");
}

// ---------------------------------------------------------------------------
// Weekly — the 4-block container + the per-recipient deal
// ---------------------------------------------------------------------------
//
// The weekly (Gavin 2026-11-23) is four blocks, in this order:
//   1. One idea — one useful idea.
//   2. One focus — one focus or strategy that helps with every single
//      workout.
//   3. One item — one gear pick (bought via OUR affiliate link) + why
//      it helps / what it helps with.
//   4. One deal — the next-rung offer for THAT reader, resolved per
//      recipient at send time from purchase_emails. "Deal" means the
//      next rung, NOT a discount — never discount to convert (Hormozi).
//      Blocks 1–2 teach (value first), blocks 3–4 sell (pitch last).
// The draft carries blocks 1–3 only. The deal is never in the draft.
//
// The deal comes from lib/ladder.ts — the Value Ladder, ONLINE
// PROGRAMS ONLY (guide → Starter → Self-Study → Flagship → Monthly).
// The resolver below reads the ladder; nothing in this file names a
// rung, a price, or a deal. A buyer who owns the top rung, or a
// product we don't recognise, gets the referral ask instead of a
// pitch. A failed purchase lookup falls back to Starter (non-buyer
// default) — never to no deal, never to a wrong-rung pitch.
// Known limit: purchase_emails only sees ONLINE buys. Someone who
// bought classes or training in person (never through Stripe) reads
// as a non-buyer and gets the Starter deal until their purchase is
// recorded online.

export async function resolveWeeklyDeal(
  sql: SqlTag,
  email: string
): Promise<WeeklyDeal> {
  try {
    // lower() on the stored side: purchase_emails is written by the
    // Stripe webhook, whose addresses arrive as the customer typed
    // them — a mixed-case stored email must still match. The param
    // is normalized; the column is compared case-insensitively.
    const rows = (await sql`
      SELECT product FROM purchase_emails
      WHERE lower(email) = ${normalizeEmail(email)} AND status = 'sent'
    `) as unknown as Array<{ product: string }>;
    return weeklyDealForProducts(rows.map((r) => r.product));
  } catch (err) {
    console.error(
      "[newsletter] resolveWeeklyDeal failed (Starter fallback):",
      err
    );
    // Non-buyer deal — the ladder's first rung, read from the
    // config, not a literal.
    return weeklyDealForProducts([]);
  }
}

export interface WeeklyDraftContent {
  idea: string;
  strategy: string;
  itemName: string;
  itemBody: string;
  itemUrl: string;
}

// Composes blocks 1–3 of the weekly (idea, focus, item) into HTML
// through textToHtml, so the section headings render as headings and
// the item link renders as a labelled "Check the price" link. The
// deal (block 4) is NOT composed here — it is resolved per recipient
// and passed to buildMarketingEmail as `deal`.
export function weeklyBodyHtml(content: WeeklyDraftContent): string {
  const body = [
    "One idea",
    "",
    content.idea.trim(),
    "",
    "One focus",
    "",
    content.strategy.trim(),
    "",
    "One item",
    "",
    `${content.itemName.trim()} — ${content.itemBody.trim()}`,
    "",
    `[Check the price](${content.itemUrl.trim()})`,
  ].join("\n");
  return textToHtml(body);
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
  // Repeat the button once when the body carries a <!--cta--> marker
  // (research F8 — long email 3 only).
  ctaRepeat?: boolean;
  ps?: string;
  pps?: string;
  headline?: string;
  preheader?: string;
  // Header tagline under the wordmark. Default "Independent for Life";
  // the weekly ("The Daily Rep") passes its own name.
  headerTagline?: string;
  eyebrow?: string;
  showReview?: boolean;
  source?: string | null;
  // Weekly only (research B10): the forward/share line in the footer.
  forwardLine?: boolean;
  // Weekly only: block 4 — the per-recipient deal, resolved from
  // purchase_emails (resolveWeeklyDeal). Renders as the "One deal"
  // section with its own button, after the body and before the
  // signature. A weekly has a deal and no cta; a sequence email has
  // a cta and no deal — one primary button per email either way.
  deal?: { line: string; cta: EmailCta };
  // Preview only: render with a placeholder unsubscribe URL instead
  // of signing one (the admin draft preview has no real recipient).
  unsubscribeUrlOverride?: string;
}): BuiltMarketingEmail {
  const unsub = opts.unsubscribeUrlOverride ?? unsubscribeUrl(opts.email);
  const body = withUtm(opts.bodyHtml, opts.campaign);
  const cta = opts.cta
    ? { label: opts.cta.label, url: withUtmUrl(opts.cta.url, opts.campaign) }
    : undefined;
  const deal = opts.deal
    ? {
        line: opts.deal.line,
        cta: {
          label: opts.deal.cta.label,
          url: withUtmUrl(opts.deal.cta.url, opts.campaign),
        },
      }
    : undefined;
  const html = renderEmailTemplate({
    bodyHtml: body,
    cta,
    ctaRepeat: opts.ctaRepeat,
    ps: opts.ps,
    pps: opts.pps,
    headline: opts.headline,
    preheader: opts.preheader,
    headerTagline: opts.headerTagline,
    eyebrow: opts.eyebrow,
    unsubscribeUrl: unsub,
    footerBusiness: FOOTER_BUSINESS,
    footerAddress: FOOTER_ADDRESS,
    showReview: opts.showReview,
    source: opts.source,
    forwardLine: opts.forwardLine,
    deal,
    utmCampaign: opts.campaign,
  });
  // Research B14: Gmail clips messages at ~102KB of HTML — and hides
  // the footer and the unsubscribe link behind "view entire message".
  // Our emails are ~7KB; warn loudly if one ever approaches the
  // limit instead of silently shipping a clipped email.
  if (html.length > 100 * 1024) {
    console.warn(
      `[newsletter] WARNING: rendered email "${opts.subject}" is ${Math.round(html.length / 1024)}KB — over the 100KB Gmail clipping guardrail.`
    );
  }
  // Text version mirrors the HTML order: headline, body, deal,
  // signature, PS, PPS, CTA link, footer asks — so it is never a
  // lesser email. A PS that carries a markdown link renders in plain
  // text as "label: url" (never raw "[label](url)" syntax).
  const plainPs = (s: string): string =>
    s.replace(
      /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
      (_m, label: string, url: string) => `${label}: ${url}`
    );
  const textParts = [
    ...(opts.headline ? [opts.headline, ""] : []),
    stripTags(body),
    ...(deal
      ? [`\nOne deal\n${deal.line}\n${deal.cta.label}: ${deal.cta.url}`]
      : []),
    renderSignatureText(),
  ];
  if (cta) textParts.push(`\n${cta.label}: ${cta.url}`);
  if (opts.ps) textParts.push(`\nP.S. ${plainPs(opts.ps)}`);
  if (opts.pps) textParts.push(`\nP.P.S. ${plainPs(opts.pps)}`);
  const text =
    textParts.join("\n") +
    renderEmailFooterText({
      unsubscribeUrl: unsub,
      footerBusiness: FOOTER_BUSINESS,
      footerAddress: FOOTER_ADDRESS,
      showReview: opts.showReview,
      source: opts.source,
      forwardLine: opts.forwardLine,
    });
  return {
    subject: opts.subject,
    html,
    text,
    // List-Unsubscribe-Post (audit S17): RFC 8058 one-click. The route
    // already unsubscribes on GET with no confirmation, so this header
    // is truthful — Gmail can offer unsubscribe without a confirm step.
    headers: {
      "List-Unsubscribe": `<${unsub}>`,
      "List-Unsubscribe-Post": "List-Unsubscribe=One-Click",
    },
  };
}

// ---------------------------------------------------------------------------
// Sending + audit log
// ---------------------------------------------------------------------------

// Monthly closed loop (audit S14, research B5): Starter buyers whose
// email is (or was) a newsletter subscriber, and when they subscribed.
// Clicks are the primary metric now (Apple MPP inflated opens ~13
// points) — this query is the revenue half of the monthly report:
// delivered, bounces, clicks, unsubscribes, spam complaints, Starter
// sales from email, list size. Run it monthly; do not guess at
// conversion. Returns [] if purchase_emails does not exist yet, so
// the admin stats never break on a fresh database.
export async function starterBuyersFromEmail(
  sql: SqlTag
): Promise<
  Array<{
    email: string;
    purchased_at: string | null;
    subscribed_at: string | null;
    source: string | null;
  }>
> {
  try {
    const rows = (await sql`
      SELECT pe.email, pe.created_at AS purchased_at,
             ns.subscribed_at, ns.source
      FROM purchase_emails pe
      LEFT JOIN newsletter_subscribers ns ON lower(ns.email) = lower(pe.email)
      WHERE pe.product = 'starter-plan' AND pe.status = 'sent'
      ORDER BY pe.created_at DESC
    `) as unknown as Array<{
      email: string;
      purchased_at: string | null;
      subscribed_at: string | null;
      source: string | null;
    }>;
    return rows;
  } catch (err) {
    console.error(
      "[newsletter] starterBuyersFromEmail failed (returning []):",
      err
    );
    return [];
  }
}

export async function logEmailSend(
  sql: SqlTag | null,
  opts: {
    email: string;
    kind: string;
    subject: string;
    status: string;
    // SMS seam: the channel this send went out on. 'email' is the
    // only channel today — every existing caller omits it and gets
    // 'email'. A future SMS sender passes 'sms'.
    channel?: string;
  }
): Promise<void> {
  if (!sql) return; // no DB (e.g. guide signup without DATABASE_URL) — skip the log
  try {
    await sql`
      INSERT INTO email_sends (email, kind, subject, status, channel)
      VALUES (${normalizeEmail(opts.email)}, ${opts.kind}, ${opts.subject}, ${opts.status}, ${opts.channel ?? "email"})
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
    ctaRepeat?: boolean;
    ps?: string;
    pps?: string;
    headline?: string;
    preheader?: string;
    headerTagline?: string;
    eyebrow?: string;
    showReview?: boolean;
    source?: string | null;
    forwardLine?: boolean;
    deal?: { line: string; cta: EmailCta };
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
    ctaRepeat: opts.ctaRepeat,
    ps: opts.ps,
    pps: opts.pps,
    headline: opts.headline,
    preheader: opts.preheader,
    headerTagline: opts.headerTagline,
    eyebrow: opts.eyebrow,
    showReview: opts.showReview,
    source: opts.source,
    forwardLine: opts.forwardLine,
    deal: opts.deal,
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

// ---------------------------------------------------------------------------
// Post-purchase + winback engines (research B7/B9, wired 2026-11-23)
// ---------------------------------------------------------------------------
//
// Both engines mirror the sequence cron's shape: a due row, a def
// lookup, a gate check, a send (or a dry-run report), an advance.
// The cron route calls processPostPurchaseRow / processWinbackRow for
// each due row; the purchase webhook calls enrollPostPurchase +
// processPostPurchaseRow for step 1 so the thank-you goes out right
// after the receipt instead of waiting for the next 9 AM cron run.
// A failed send stays due and retries the next day — nothing is lost,
// nothing is sent twice.

// First name + source for an email, from the subscriber row if one
// exists. Buyers are not always subscribers (they may have bought
// without ever downloading the guide) — null means "there" and the
// caller's default source.
export async function subscriberInfo(
  sql: SqlTag,
  email: string
): Promise<{ first_name: string | null; source: string | null } | null> {
  try {
    const rows = (await sql`
      SELECT first_name, source FROM newsletter_subscribers
      WHERE email = ${normalizeEmail(email)} LIMIT 1
    `) as unknown as Array<{
      first_name: string | null;
      source: string | null;
    }>;
    return rows[0] ?? null;
  } catch (err) {
    console.error("[newsletter] subscriberInfo failed:", err);
    return null;
  }
}

export interface PostPurchaseRow {
  email: string;
  product: string | null;
  step: number;
  next_send_at?: string | null;
}

export interface EngineResult {
  email: string;
  step: number;
  status: string;
  detail?: string;
}

// Enrolls a buyer in the post-purchase sequence. The copy is written
// for the Starter buyer (emails 1–2 say "do Day 1 / Day 2"), so a
// Self-Study or monthly buyer enrolls at step 4 only — the referral
// ask, which the draft sends to all buyers. A Starter buyer enrolls
// at step 1, due now. A later purchase of a higher rung upgrades the
// stored product (the step-3 check reads purchase_emails anyway, so
// an upgrade after enrolling still skips the nudge). A finished buyer
// (step 5) who buys again starts a fresh cycle.
export async function enrollPostPurchase(
  sql: SqlTag,
  email: string,
  product: string
): Promise<PostPurchaseRow> {
  const normalized = normalizeEmail(email);
  const newRank = ladderRank(product);
  const existing = (await sql`
    SELECT email, product, step FROM post_purchase_sequences
    WHERE email = ${normalized} LIMIT 1
  `) as unknown as PostPurchaseRow[];

  // Fresh enrollment: Starter buyers start at step 1 (due now);
  // Self-Study / flagship / monthly buyers start at step 4 only —
  // the referral ask, due on step 4's sendAfterDays. Emails 1–3 are
  // written for the Starter buyer ("do Day 1 / Day 2", the Self-Study
  // nudge), so a higher-rung buyer never sees them. "Starter buyer"
  // means the lowest paid rung on the ladder (lib/ladder.ts) — the
  // rank comes from the config, not a literal.
  const freshStep = newRank === 1 ? 1 : 4;
  const freshDue = new Date(
    Date.now() +
      (freshStep === 1 ? 0 : postPurchaseDueInDays(4) * 24 * 60 * 60 * 1000)
  ).toISOString();

  if (existing.length === 0) {
    const rows = (await sql`
      INSERT INTO post_purchase_sequences (email, product, step, next_send_at)
      VALUES (${normalized}, ${product}, ${freshStep}, ${freshDue})
      RETURNING email, product, step
    `) as unknown as PostPurchaseRow[];
    return rows[0];
  }

  // Existing row: keep the higher-rung product. A finished buyer
  // (step 5) who buys again starts a fresh cycle for that purchase;
  // a mid-sequence buyer keeps their place, and the step-3 check
  // reads purchase_emails, so an upgrade after enrolling still
  // skips the Self-Study nudge.
  const row = existing[0];
  const bestProduct =
    newRank >= ladderRank(row.product ?? "") ? product : row.product;
  if (row.step >= 5) {
    const rows = (await sql`
      UPDATE post_purchase_sequences
      SET product = ${bestProduct}, step = ${freshStep}, next_send_at = ${freshDue}
      WHERE email = ${normalized}
      RETURNING email, product, step
    `) as unknown as PostPurchaseRow[];
    return rows[0];
  }
  const rows = (await sql`
    UPDATE post_purchase_sequences
    SET product = ${bestProduct}
    WHERE email = ${normalized}
    RETURNING email, product, step
  `) as unknown as PostPurchaseRow[];
  return rows[0];
}

// One due post-purchase row, end to end: def lookup, step-3 product
// check, send (or dry-run report), advance. A failed send stays due
// and retries the next day. Returns a cron-shaped result.
export async function processPostPurchaseRow(
  sql: SqlTag,
  row: PostPurchaseRow,
  dryRun: boolean
): Promise<EngineResult> {
  const email = normalizeEmail(row.email);
  const step = row.step;
  const def = postPurchaseEmailForStep(step);
  if (!def) {
    return { email, step, status: "skipped-no-email" };
  }
  if (!def.approved) {
    return {
      email,
      step,
      status: "skipped-not-approved",
      detail: "Post-purchase step not approved yet — left due.",
    };
  }

  // Send gate (Gavin 2026-11-23): while ON, only the allowlist
  // receives marketing email. A gated skip is terminal — the row
  // advances to finished, it does not sit due for the day the gate
  // lifts. No suppression or other side effect here: this is a
  // blackout, not a re-engage outcome.
  if (!marketingSendAllowed(email)) {
    if (!dryRun) {
      await logEmailSend(sql, {
        email,
        kind: `post-purchase-${step}`,
        subject: def.subject,
        status: "skipped-not-allowlisted",
      });
      await sql`
        UPDATE post_purchase_sequences
        SET step = 5, next_send_at = NULL
        WHERE email = ${email}
      `;
    }
    return {
      email,
      step,
      status: "skipped-not-allowlisted",
      detail: "Send gate is ON — only the allowlist receives marketing email.",
    };
  }

  // Step 3 only — the nudge goes to buyers whose NEXT rung on the
  // ladder is the product this email pitches (def.pitchProduct,
  // "self-study" — the approved copy names Self-Study). Checked
  // against BOTH the stored product and purchase_emails at send time
  // (not just enrollment), so a buyer who upgrades after enrolling
  // still skips it. A buyer already past the pitch, at the top, or
  // holding an unrecognised product skips — the ladder decides, the
  // engine never hardcodes a rank.
  if (step === 3) {
    // lower() on the stored side: purchase_emails is written by the
    // Stripe webhook, whose addresses arrive as the customer typed
    // them — a mixed-case stored email must still match.
    const bought = (await sql`
      SELECT product FROM purchase_emails
      WHERE lower(email) = ${email} AND status = 'sent'
    `) as unknown as Array<{ product: string }>;
    const nextRung = nextRungAfterProducts([
      row.product ?? "",
      ...bought.map((b) => b.product),
    ]);
    if (!nextRung || nextRung.product !== def.pitchProduct) {
      if (!dryRun) {
        await logEmailSend(sql, {
          email,
          kind: "post-purchase-3",
          subject: def.subject,
          status: "skipped-not-starter",
        });
        const gapDays = postPurchaseGapDays(3, 4);
        await sql`
          UPDATE post_purchase_sequences
          SET step = 4, next_send_at = now() + make_interval(days => ${gapDays})
          WHERE email = ${email}
        `;
      }
      return {
        email,
        step,
        status: "skipped-not-starter",
        detail:
          "Next rung is not the pitched product — nudge skipped, referral ask still due Day 14.",
      };
    }
  }

  if (dryRun) {
    return {
      email,
      step,
      status: "would-send",
      detail: `Subject: ${def.subject}`,
    };
  }

  const info = await subscriberInfo(sql, email);
  try {
    await sendMarketingEmail(sql, {
      to: email,
      firstName: info?.first_name ?? undefined,
      subject: def.subject,
      bodyHtml: def.html,
      kind: `post-purchase-${step}`,
      campaign: def.campaign,
      cta: def.cta,
      ps: def.ps,
      headline: def.headline,
      preheader: def.preheader,
      eyebrow: def.eyebrow,
      showReview: def.showReview,
      source: "purchase",
    });
  } catch (err) {
    // Logged as 'failed' inside sendMarketingEmail. Leave due —
    // tomorrow's run retries.
    console.error(
      `[post-purchase] send failed for ${email} step ${step}:`,
      err
    );
    return {
      email,
      step,
      status: "failed",
      detail: err instanceof Error ? err.message : "Send failed",
    };
  }

  // Advance — gaps come from the defs' sendAfterDays (the defs are
  // the timing config), never literals: step 1 -> Day 2, step 2 ->
  // Day 7, step 3 -> Day 14, step 4 -> finished (step 5).
  if (step === 1) {
    const gapDays = postPurchaseGapDays(1, 2);
    await sql`
      UPDATE post_purchase_sequences
      SET step = 2, next_send_at = now() + make_interval(days => ${gapDays})
      WHERE email = ${email}
    `;
  } else if (step === 2) {
    const gapDays = postPurchaseGapDays(2, 3);
    await sql`
      UPDATE post_purchase_sequences
      SET step = 3, next_send_at = now() + make_interval(days => ${gapDays})
      WHERE email = ${email}
    `;
  } else if (step === 3) {
    const gapDays = postPurchaseGapDays(3, 4);
    await sql`
      UPDATE post_purchase_sequences
      SET step = 4, next_send_at = now() + make_interval(days => ${gapDays})
      WHERE email = ${email}
    `;
  } else {
    await sql`
      UPDATE post_purchase_sequences
      SET step = 5, next_send_at = NULL
      WHERE email = ${email}
    `;
  }
  return { email, step, status: "sent" };
}

export interface WinbackRow {
  email: string;
  step: number;
  next_send_at?: string | null;
}

// Enrolls a 90-day-silent subscriber in the winback sequence.
// Step 1 due now, then ~5 days apart. Idempotent: an existing row is
// left alone — a subscriber is enrolled once per silence, and a
// second enrollment would restart the re-engage emails.
export async function enrollWinback(
  sql: SqlTag,
  email: string
): Promise<WinbackRow> {
  const normalized = normalizeEmail(email);
  const existing = (await sql`
    SELECT email, step FROM winback_sequences
    WHERE email = ${normalized} LIMIT 1
  `) as unknown as WinbackRow[];
  if (existing.length > 0) return existing[0];
  const rows = (await sql`
    INSERT INTO winback_sequences (email, step, next_send_at)
    VALUES (${normalized}, 1, now())
    RETURNING email, step
  `) as unknown as WinbackRow[];
  return rows[0];
}

// One due winback row, end to end. After step 3 the subscriber is
// suppressed (logged as 'suppressed', sequence_step 0) — suppression
// happens only after the third email, per the sunset policy. See the
// limit note in lib/winbackEmails.ts: replies are not tracked in the
// database yet, so suppression follows the send, and a reply is
// caught by the manual inbox process.
export async function processWinbackRow(
  sql: SqlTag,
  row: WinbackRow,
  dryRun: boolean
): Promise<EngineResult> {
  const email = normalizeEmail(row.email);
  const step = row.step;
  const def = winbackEmailForStep(step);
  if (!def) {
    return { email, step, status: "skipped-no-email" };
  }
  if (!def.approved) {
    return {
      email,
      step,
      status: "skipped-not-approved",
      detail: "Winback step not approved yet — left due.",
    };
  }

  // Send gate (Gavin 2026-11-23): while ON, only the allowlist
  // receives marketing email. A gated skip is terminal — the row
  // advances to done, it does not sit due for the day the gate
  // lifts. NO suppression here: suppression follows a completed
  // winback that got no reply, and a gated skip is a blackout, not
  // a completed re-engage.
  if (!marketingSendAllowed(email)) {
    if (!dryRun) {
      await logEmailSend(sql, {
        email,
        kind: `winback-${step}`,
        subject: def.subject,
        status: "skipped-not-allowlisted",
      });
      await sql`
        UPDATE winback_sequences
        SET step = 4, next_send_at = NULL
        WHERE email = ${email}
      `;
    }
    return {
      email,
      step,
      status: "skipped-not-allowlisted",
      detail: "Send gate is ON — only the allowlist receives marketing email.",
    };
  }

  if (dryRun) {
    return {
      email,
      step,
      status: "would-send",
      detail: `Subject: ${def.subject}`,
    };
  }

  const info = await subscriberInfo(sql, email);
  try {
    await sendMarketingEmail(sql, {
      to: email,
      firstName: info?.first_name ?? undefined,
      subject: def.subject,
      bodyHtml: def.html,
      kind: `winback-${step}`,
      campaign: def.campaign,
      cta: def.cta,
      ps: def.ps,
      headline: def.headline,
      preheader: def.preheader,
      eyebrow: def.eyebrow,
      showReview: def.showReview,
      source: info?.source ?? "guide",
    });
  } catch (err) {
    console.error(
      `[winback] send failed for ${email} step ${step}:`,
      err
    );
    return {
      email,
      step,
      status: "failed",
      detail: err instanceof Error ? err.message : "Send failed",
    };
  }

  // Advance — gaps come from the defs' sendAfterDays (the defs are
  // the timing config), never literals: step 1 -> +5d, step 2 -> +5d,
  // step 3 -> done AND suppressed (the re-engage got no reply — see
  // the limit note).
  if (step === 1) {
    const gapDays = winbackGapDays(1, 2);
    await sql`
      UPDATE winback_sequences
      SET step = 2, next_send_at = now() + make_interval(days => ${gapDays})
      WHERE email = ${email}
    `;
  } else if (step === 2) {
    const gapDays = winbackGapDays(2, 3);
    await sql`
      UPDATE winback_sequences
      SET step = 3, next_send_at = now() + make_interval(days => ${gapDays})
      WHERE email = ${email}
    `;
  } else {
    await sql`
      UPDATE winback_sequences
      SET step = 4, next_send_at = NULL
      WHERE email = ${email}
    `;
    await logEmailSend(sql, {
      email,
      kind: "sunset-suppress",
      subject: "(suppressed — winback got no reply)",
      status: "suppressed",
    });
    await sql`
      UPDATE newsletter_subscribers
      SET sequence_step = 0, next_send_at = NULL
      WHERE email = ${email}
    `;
  }
  return { email, step, status: "sent" };
}
