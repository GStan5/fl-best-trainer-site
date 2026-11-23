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
// Deal table — the Value Ladder, one rung at a time. Never pitch what
// they already own, never pitch two rungs up (Hormozi). Highest rung
// purchased wins:
//   bought nothing          -> Starter $37 (/starter)
//   bought Starter          -> Self-Study $197 (/self-study)
//   bought Self-Study        -> classes / 10-class pack, $420 online (/classes)
//   bought flagship/monthly  -> in-home training, $160/session (/training)
// An unknown product in purchase_emails ranks top (in-home) — a
// product we don't recognise must never cause a pitch DOWN the
// ladder. A failed purchase lookup falls back to Starter (non-buyer
// default) — never to no deal, never to a wrong-rung pitch.
// Known limit: purchase_emails only sees ONLINE buys. Someone who
// bought classes or training in person (never through Stripe) reads
// as a non-buyer and gets the Starter deal until their purchase is
// recorded online.

export interface WeeklyDeal {
  key: "starter" | "self-study" | "classes" | "in-home";
  label: string;
  url: string;
  line: string;
}

export const WEEKLY_DEALS: Record<WeeklyDeal["key"], WeeklyDeal> = {
  starter: {
    key: "starter",
    label: "Start the Starter plan — $37",
    url: `${SITE}/starter`,
    line: "The Starter plan is $37, one time. Four weeks, 12 sessions, 30 minutes each. A chair, a wall, water bottles — that's all you need.",
  },
  "self-study": {
    key: "self-study",
    label: "Get the Self-Study plan — $197",
    url: `${SITE}/self-study`,
    line: "You finished Starter. Self-Study is the full 6 weeks — the same sessions, on your own schedule, $197 once.",
  },
  classes: {
    key: "classes",
    label: "Get the 10-class pack — $420",
    url: `${SITE}/classes`,
    line: "You know the movements now. The next step is doing them with me watching your form — small-group classes, 5 people max.",
  },
  "in-home": {
    key: "in-home",
    label: "Book in-home training",
    url: `${SITE}/training`,
    line: "The next step is one-on-one — me, in your home, working on exactly what you need. One session is $160.",
  },
};

// Pure function (unit-testable without a DB): highest rung wins.
export function weeklyDealForProducts(products: string[]): WeeklyDeal {
  const rank = (product: string): number => {
    switch (product) {
      case "starter-plan":
        return 1;
      case "self-study":
        return 2;
      case "flagship":
      case "monthly-97":
      case "monthly-147":
      case "monthly-197":
        return 3;
      default:
        return 3; // unknown product — never pitch down the ladder
    }
  };
  let best = 0;
  for (const p of products) best = Math.max(best, rank(p));
  if (best >= 3) return WEEKLY_DEALS["in-home"];
  if (best === 2) return WEEKLY_DEALS.classes;
  if (best === 1) return WEEKLY_DEALS["self-study"];
  return WEEKLY_DEALS.starter;
}

export async function resolveWeeklyDeal(
  sql: SqlTag,
  email: string
): Promise<WeeklyDeal> {
  try {
    const rows = (await sql`
      SELECT product FROM purchase_emails
      WHERE email = ${normalizeEmail(email)} AND status = 'sent'
    `) as unknown as Array<{ product: string }>;
    return weeklyDealForProducts(rows.map((r) => r.product));
  } catch (err) {
    console.error(
      "[newsletter] resolveWeeklyDeal failed (Starter fallback):",
      err
    );
    return WEEKLY_DEALS.starter;
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
  // lesser email.
  const textParts = [
    ...(opts.headline ? [opts.headline, ""] : []),
    stripTags(body),
    ...(deal
      ? [`\nOne deal\n${deal.line}\n${deal.cta.label}: ${deal.cta.url}`]
      : []),
    renderSignatureText(),
  ];
  if (cta) textParts.push(`\n${cta.label}: ${cta.url}`);
  if (opts.ps) textParts.push(`\nP.S. ${opts.ps}`);
  if (opts.pps) textParts.push(`\nP.P.S. ${opts.pps}`);
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
      LEFT JOIN newsletter_subscribers ns ON ns.email = pe.email
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
