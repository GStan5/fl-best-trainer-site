// Email template — one shared HTML template for every marketing email
// (guide email 0, sequence 1–3, weekly later). All marketing sends go
// through lib/newsletter.ts buildMarketingEmail(), which renders through
// here — so the header, the button, and the footer asks are identical
// on every send, and the body text (Gavin's voice) is never rewritten,
// only wrapped.
//
// HORMOZI-FIRST, plain-letter format (research Part B, Gavin's call:
// Hormozi's material is the authority we agree with most). The email
// looks like a normal person's email, not a designed flyer: single
// column, system fonts, no layout blocks, no images except the small
// headshot in the signature block. NO hero photo — Hormozi's rule is
// explicit (no images for service / high-ticket / B2B) and the
// research agrees for coaches (HubSpot/Leadoom: simpler wins). The
// one face that stays is the 64px headshot in the signature — a small
// photo in the sign-off of an otherwise plain personal email, not a
// designed image email. The palette is the site's own
// (tailwind.config.js): navy #0A1A3F header band, royal #4169E1
// accent. One primary button per email (repeated once in the long
// email 3); the footer asks (review + follow) are soft text lines and
// a small outlined button, never competing with the email's one CTA.
//
// Hierarchy, not decoration, is what makes it feel like a newsletter
// (research §0): a headline line, one bold takeaway, bullets, a
// signature block with a photo, a PS on every email, a fixed weekly
// container. Type is 17px body / 1.7 line-height for a 50+ audience.
//
// The plain-text version is built alongside the HTML in
// buildMarketingEmail() — same asks, as plain lines — so the text
// version is never a lesser email.

// ---------------------------------------------------------------------------
// Links — config constants, one-line swaps.
// ---------------------------------------------------------------------------

// Google review link — the short g.page review link from the Google
// Business Profile (Gavin 2026-11-23 ~15:17). This was the one-line
// swap the template was built for: the Maps search URL fallback is
// gone.
export const GOOGLE_REVIEW_URL =
  "https://g.page/r/CaACepEsFdx0EBM/review";

// Socials — real URLs (Gavin 2026-11-23). A link renders only when its
// URL is set; an empty string means it is left out entirely, so there
// are never dead links in a footer.
export const SOCIAL_FACEBOOK_URL = "https://www.facebook.com/FLBestTrainer/";
export const SOCIAL_INSTAGRAM_URL =
  "https://www.instagram.com/flbesttrainer/";
export const SOCIAL_YOUTUBE_URL = "https://www.youtube.com/@FLBestTrainer";

// Signature headshot — the homepage hero photo (brandphoto11.jpg),
// Gavin's pick 2026-11-23: the same picture as the hero on the home
// page. The old one (brandphoto12.jpg) never showed: the template
// pointed at the apex domain, which 404s for everything — the site
// lives on www. All email URLs use www.flbesttrainer.com.
export const SIGNATURE_PHOTO_URL =
  "https://www.flbesttrainer.com/images/brandphoto11.jpg";

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

// A PS / PPS line with its links live: escape first, then turn
// [label](url) and bare https URLs into links (same shape as the
// linkifier in lib/newsletter.ts textToHtml). Plain-text PS lines
// have no links and render exactly as before — this only matters for
// the post-purchase PS lines, which carry a blog link (email 2) and a
// Google review link (email 4) inside the PS itself. Links to our
// own site get the same UTM tags as body links (campaign passed in
// by buildMarketingEmail) — an untagged link in the PS would read as
// direct traffic instead of email.
function psLinkUrl(url: string, campaign?: string): string {
  const clean = url.replace(/&amp;/g, "&");
  if (!campaign) return clean;
  if (!clean.startsWith("https://www.flbesttrainer.com")) return clean;
  if (clean.includes("utm_source=")) return clean;
  const sep = clean.includes("?") ? "&" : "?";
  return `${clean}${sep}utm_source=email&utm_medium=email&utm_campaign=${campaign}`;
}

function psHtml(s: string, campaign?: string): string {
  const escaped = escapeHtml(s);
  const linked = escaped.replace(
    /\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)/g,
    (_match, label: string, url: string) =>
      `<a href="${psLinkUrl(url, campaign)}" style="color: #1D4ED8; text-decoration: underline;">${label}</a>`
  );
  return linked.replace(
    /(?<!href=")(https?:\/\/[^\s<"]+)/g,
    (url: string) =>
      `<a href="${psLinkUrl(url, campaign)}" style="color: #1D4ED8; text-decoration: underline;">${url}</a>`
  );
}

// The "why you get this" line, by signup source (audit M5). A homepage
// box subscriber never downloaded the guide — telling them they did is
// a lie. Every source gets its own true line.
export function whyYouGetThisLine(source?: string | null): string {
  switch ((source ?? "guide").toLowerCase()) {
    case "newsletter":
      return "You're getting this because you joined the newsletter on flbesttrainer.com.";
    case "flagship":
      return "You're getting this because you joined the Strong After 50 waitlist.";
    case "starter":
    case "plans":
      return "You're getting this because you signed up on flbesttrainer.com.";
    case "purchase":
      return "You're getting this because you bought a program on flbesttrainer.com.";
    default:
      if ((source ?? "").toLowerCase().startsWith("niche-")) {
        return "You're getting this because you joined the list on flbesttrainer.com.";
      }
      return "You're getting this because you downloaded the free guide.";
  }
}

function socialLinksHtml(): string {
  const links: Array<{ label: string; url: string }> = [];
  if (SOCIAL_FACEBOOK_URL) {
    links.push({ label: "Facebook", url: SOCIAL_FACEBOOK_URL });
  }
  if (SOCIAL_INSTAGRAM_URL) {
    links.push({ label: "Instagram", url: SOCIAL_INSTAGRAM_URL });
  }
  if (SOCIAL_YOUTUBE_URL) {
    links.push({ label: "YouTube", url: SOCIAL_YOUTUBE_URL });
  }
  if (links.length === 0) return "";
  const items = links
    .map(
      (l) =>
        `<a href="${l.url}" style="color: #1D4ED8; text-decoration: underline;">${l.label}</a>`
    )
    .join(" &middot; ");
  return `<p style="margin: 0 0 10px;">Follow along: ${items}</p>`;
}

function socialLinksText(): string {
  const links: Array<{ label: string; url: string }> = [];
  if (SOCIAL_FACEBOOK_URL) {
    links.push({ label: "Facebook", url: SOCIAL_FACEBOOK_URL });
  }
  if (SOCIAL_INSTAGRAM_URL) {
    links.push({ label: "Instagram", url: SOCIAL_INSTAGRAM_URL });
  }
  if (SOCIAL_YOUTUBE_URL) {
    links.push({ label: "YouTube", url: SOCIAL_YOUTUBE_URL });
  }
  if (links.length === 0) return "";
  return `Follow along: ${links.map((l) => `${l.label} ${l.url}`).join(" | ")}`;
}

// The forward line (research B10) — weekly only, zero-infrastructure
// referral: one line, no per-subscriber links, no tracking, no
// rewards. The real referral program waits for Phase 2 tracking.
export const FORWARD_LINE =
  "Know someone over 50 who'd like this? Forward it, or send them to www.flbesttrainer.com/start.";

// The footer block — review ask (gated: only once value has been
// delivered — audit S1), follow-along, forward line (weekly only),
// why-you-get-this, address, unsubscribe. Same content in HTML and
// text; the HTML version is the only place the review link is a
// button, and it is a small outlined one so the email's primary button
// stays primary. Footer type is 15px minimum (research F10) — the
// readers are 50+.
export function renderEmailFooterHtml(opts: {
  unsubscribeUrl: string;
  footerBusiness: string;
  footerAddress: string;
  showReview?: boolean;
  source?: string | null;
  forwardLine?: boolean;
}): string {
  const showReview = opts.showReview !== false;
  const review = showReview
    ? `
    <p style="margin: 0 0 10px;">If this helped you, a quick Google review helps more people over 50 find us.</p>
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 0 0 16px;">
      <tr>
        <td align="center" style="border: 1px solid #4169E1; border-radius: 6px;">
          <a href="${GOOGLE_REVIEW_URL}" style="display: inline-block; padding: 12px 20px; font-family: ${FONT_STACK}; font-size: 14px; font-weight: 700; color: #4169E1; text-decoration: none;">Leave a review on Google</a>
        </td>
      </tr>
    </table>`
    : "";
  const forward = opts.forwardLine
    ? `<p style="margin: 0 0 10px;">${FORWARD_LINE}</p>`
    : "";
  return `
    <hr class="email-hr" style="border: none; border-top: 1px solid #ddd; margin: 8px 0 16px;" />
    ${review}
    ${socialLinksHtml()}
    ${forward}
    <p style="margin: 0 0 10px;">${escapeHtml(whyYouGetThisLine(opts.source))}</p>
    <p style="margin: 0 0 10px;">${opts.footerBusiness}<br />${opts.footerAddress}</p>
    <p style="margin: 0;"><a href="${opts.unsubscribeUrl}" style="color: #1D4ED8; text-decoration: underline;">Unsubscribe</a> any time. One click, no questions.</p>
  `;
}

export function renderEmailFooterText(opts: {
  unsubscribeUrl: string;
  footerBusiness: string;
  footerAddress: string;
  showReview?: boolean;
  source?: string | null;
  forwardLine?: boolean;
}): string {
  const showReview = opts.showReview !== false;
  const socials = socialLinksText();
  return [
    "",
    "---",
    ...(showReview
      ? [
          "If this helped you, a quick Google review helps more people over 50 find us.",
          `Leave a review on Google: ${GOOGLE_REVIEW_URL}`,
        ]
      : []),
    ...(socials ? [socials] : []),
    ...(opts.forwardLine ? [FORWARD_LINE] : []),
    whyYouGetThisLine(opts.source),
    opts.footerBusiness,
    opts.footerAddress,
    `Unsubscribe any time: ${opts.unsubscribeUrl}`,
  ].join("\n");
}

// Signature block (research F4) — the person in the email. Renders
// after the body, in place of a one-word "Gavin" sign-off: the
// restructured bodies end without a sign-off line and this block
// closes the letter. Small headshot, name, title, place. No reply
// line — the zero-contact rule (Gavin 2026-11-24): no email invites
// a reply, so the signature does not ask for one either. (The reply
// line was research B1, superseded by that rule.)
export function renderSignatureHtml(): string {
  return `
    <table role="presentation" cellpadding="0" cellspacing="0" style="margin: 20px 0 0;">
      <tr>
        <td style="vertical-align: top; padding-right: 12px;">
          <img src="${SIGNATURE_PHOTO_URL}" alt="Gavin Stanifer" width="64" style="display: block; width: 64px; height: auto; border: 0;" />
        </td>
        <td style="vertical-align: top; font-family: ${FONT_STACK};">
          <div class="email-sig-name" style="font-size: 15px; font-weight: 700; color: #1F2937;">Gavin Stanifer</div>
          <div class="email-sig-line" style="font-size: 14px; color: #4B5563;">NASM-CPT</div>
          <div class="email-sig-line" style="font-size: 14px; color: #4B5563;">FL Best Trainer, Longboat Key, Florida</div>
        </td>
      </tr>
    </table>`;
}

export function renderSignatureText(): string {
  return [
    "Gavin Stanifer",
    "NASM-CPT",
    "FL Best Trainer, Longboat Key, Florida",
  ].join("\n");
}

// Full email HTML: navy header band (wordmark + tagline), optional
// progress eyebrow ("Tip 1 of 3"), headline, body slot, optional
// deal P.S. (weekly only — the per-recipient deal, resolved from
// purchase_emails; renders as one short P.S. line after the
// signature), signature, optional PS / PPS, optional primary button
// (repeated once in the long email 3 — see ctaRepeat), footer. Body
// HTML is the email's content as written — paragraphs inherit the
// font from the wrapping cell. Body type is 17px / 1.7 (research
// F10, 50+ audience).
export function renderEmailTemplate(opts: {
  bodyHtml: string;
  cta?: EmailCta;
  // Repeat the primary button once: when true AND the body contains a
  // <!--cta--> marker, the button renders after the marker AND at the
  // end (research F8 — long email 3 only). Without the marker it
  // renders once at the end, like every other email.
  ctaRepeat?: boolean;
  ps?: string;
  pps?: string;
  headline?: string;
  preheader?: string;
  eyebrow?: string;
  // Header tagline under the wordmark. Default "Independent for Life";
  // the weekly ("The Daily Rep", research F7) passes its own name.
  headerTagline?: string;
  unsubscribeUrl: string;
  footerBusiness: string;
  footerAddress: string;
  showReview?: boolean;
  source?: string | null;
  forwardLine?: boolean;
  // Weekly only: the per-recipient deal (see resolveWeeklyDeal in
  // lib/newsletter.ts). It renders as a short P.S. line after the
  // signature (Gavin 2026-11-24 — was the fourth weekly block with
  // its own button; the deal is still resolved per recipient, only
  // its rendering changed). A weekly has a deal and no cta; a
  // sequence email has a cta and no deal — one primary button per
  // email either way.
  deal?: { line: string; cta: EmailCta };
  // Campaign name for UTM tags on PS / PPS links (the body links are
  // tagged by buildMarketingEmail before they reach the template).
  utmCampaign?: string;
}): string {
  const button = (cta: EmailCta) => `
    <table class="cta-btn" role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0 8px;">
      <tr>
        <td align="center" style="background-color: #4169E1; border-radius: 6px;">
          <a href="${cta.url}" style="display: inline-block; padding: 14px 28px; font-family: ${FONT_STACK}; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none;">${cta.label}</a>
        </td>
      </tr>
    </table>`;
  const ps = opts.ps
    ? `<p style="margin: 16px 0 0;">P.S. ${psHtml(opts.ps, opts.utmCampaign)}</p>`
    : "";
  const pps = opts.pps
    ? `<p style="margin: 8px 0 0;">P.P.S. ${psHtml(opts.pps, opts.utmCampaign)}</p>`
    : "";
  const preheader = opts.preheader
    ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #F3F4F6;">${escapeHtml(opts.preheader)}</div>`
    : "";
  const eyebrow = opts.eyebrow
    ? `<div class="email-eyebrow" style="font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #4169E1; margin-bottom: 12px;">${escapeHtml(opts.eyebrow)}</div>`
    : "";
  // Headline (research F1): the email's one idea, bold 20px, above
  // the first paragraph — skimmers get it in 2 seconds, and the AI
  // inbox summaries chew on it instead of the greeting.
  const headline = opts.headline
    ? `<div class="email-headline" style="font-size: 20px; font-weight: 800; line-height: 1.3; color: #1F2937; margin: 0 0 16px;">${escapeHtml(opts.headline)}</div>`
    : "";
  // Split the body on the <!--cta--> marker for the repeated button
  // (F8). The marker is an HTML comment, so the plain-text version
  // never sees it.
  const CTA_MARKER = "<!--cta-->";
  const hasMarker = Boolean(opts.cta && opts.ctaRepeat && opts.bodyHtml.includes(CTA_MARKER));
  const [bodyBefore, bodyAfter] = hasMarker
    ? (opts.bodyHtml.split(CTA_MARKER) as [string, string])
    : [opts.bodyHtml, ""];
  const firstButton = hasMarker && opts.cta ? button(opts.cta) : "";
  const endButton = opts.cta ? button(opts.cta) : "";
  // The deal as a P.S. (weekly only — Gavin 2026-11-24, reverses
  // the 2026-11-23 four-block weekly): the per-recipient deal is no
  // longer a fourth block with its own button. It renders as one
  // short P.S. line after the signature, with the deal link inline —
  // a smaller ask than a full block. It sits after the signature
  // like every other P.S., so the teaching ends the body.
  const dealPs = opts.deal
    ? `<p style="margin: 16px 0 0;">P.S. ${escapeHtml(opts.deal.line)} <a href="${opts.deal.cta.url}" style="color: #1D4ED8; text-decoration: underline;">${escapeHtml(opts.deal.cta.label)}</a></p>`
    : "";
  const tagline = opts.headerTagline ?? "Independent for Life";
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light dark" />
<meta name="supported-color-schemes" content="light dark" />
<style>
  a { color: #1D4ED8; }
  @media only screen and (max-width: 600px) {
    .email-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .header-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .cta-btn { width: 100% !important; }
    .cta-btn td { width: 100% !important; }
    .cta-btn a { display: block !important; text-align: center !important; }
  }
  /* Dark mode (research F9): off-black / off-white, never pure
     #000000 / #FFFFFF. Apple Mail honors this; Gmail Android inverts
     aggressively regardless — the light version is the fallback. */
  @media (prefers-color-scheme: dark) {
    body { background-color: #121212 !important; }
    .email-outer { background-color: #121212 !important; }
    .email-card { background-color: #1B1B1B !important; }
    .email-body { color: #EDEDEA !important; }
    .email-headline { color: #EDEDEA !important; }
    .email-eyebrow { color: #93B4F5 !important; }
    .email-footer { color: #B0B0B0 !important; }
    .email-sig-name { color: #EDEDEA !important; }
    .email-sig-line { color: #B0B0B0 !important; }
    .email-hr { border-top-color: #374151 !important; }
  }
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6;">
${preheader}
<center>
<table class="email-outer" role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F4F6;">
<tr>
<td align="center" style="padding: 24px 12px;">
<table class="email-card" role="presentation" width="600" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px;">
<tr>
<td class="header-pad" style="padding: 28px 32px; background-color: #0A1A3F; border-radius: 8px 8px 0 0; font-family: ${FONT_STACK};">
<div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">FL Best Trainer</div>
<div style="font-size: 13px; color: #C7D2FE; margin-top: 4px;">${escapeHtml(tagline)}</div>
</td>
</tr>
<tr>
<td class="email-pad email-body" style="padding: 24px 32px; font-family: ${FONT_STACK}; font-size: 17px; line-height: 1.7; color: #1F2937;">
${eyebrow}${headline}${bodyBefore}
${firstButton}
${bodyAfter}
${renderSignatureHtml()}
${dealPs}
${ps}
${pps}
${endButton}
</td>
</tr>
<tr>
<td class="email-pad email-footer" style="padding: 0 32px 32px; font-family: ${FONT_STACK}; font-size: 15px; line-height: 1.6; color: #4B5563;">
${renderEmailFooterHtml({
  unsubscribeUrl: opts.unsubscribeUrl,
  footerBusiness: opts.footerBusiness,
  footerAddress: opts.footerAddress,
  showReview: opts.showReview,
  source: opts.source,
  forwardLine: opts.forwardLine,
})}
</td>
</tr>
</table>
</td>
</tr>
</table>
</center>
</body>
</html>`;
}

export interface EmailCta {
  label: string;
  url: string;
}
