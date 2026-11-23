// Email template — one shared HTML template for every marketing email
// (guide email 0, sequence 1–3, weekly later). All marketing sends go
// through lib/newsletter.ts buildMarketingEmail(), which renders through
// here — so the header, the button, and the footer asks are identical
// on every send, and the body text (Gavin's voice) is never rewritten,
// only wrapped.
//
// Email-safe: table layout, inline CSS only, max-width 600px, single
// column, system font stack, no external stylesheets. Hero photos are
// the site's own brand photos at absolute https:// URLs (they live on
// the site already, so nothing new is hosted). The palette is the
// site's own (tailwind.config.js): navy #0A1A3F header band, royal
// #4169E1 accent. One primary button per email; the footer asks
// (review + follow) are soft text lines and a small outlined button,
// never competing with the email's one CTA.
//
// The plain-text version is built alongside the HTML in
// buildMarketingEmail() — same asks, as plain lines — so the text
// version is never a lesser email.

// ---------------------------------------------------------------------------
// Links — config constants, one-line swaps.
// ---------------------------------------------------------------------------

// Google review link — DEFAULT is the Google Maps search URL for
// FL Best Trainer. Swap in the short g.page review link from the
// Google Business Profile when Gavin has it — one line.
export const GOOGLE_REVIEW_URL =
  "https://www.google.com/maps/search/?api=1&query=FL+Best+Trainer";

// Socials — real URLs (Gavin 2026-11-23). A link renders only when its
// URL is set; an empty string means it is left out entirely, so there
// are never dead links in a footer.
export const SOCIAL_FACEBOOK_URL = "https://www.facebook.com/FLBestTrainer/";
export const SOCIAL_INSTAGRAM_URL =
  "https://www.instagram.com/flbesttrainer/";
export const SOCIAL_YOUTUBE_URL = "https://www.youtube.com/@FLBestTrainer";

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

// Hero photos — the site's own brand photos, absolute URLs. Each file
// was verified to exist in public/images/ before being wired in; an
// email with no hero set gets no image rather than a broken one.
export const HERO_IMAGE_URLS = {
  guide: "https://flbesttrainer.com/images/brandphoto16.jpg",
  sequence1: "https://flbesttrainer.com/images/brandphoto13.jpg",
  sequence2: "https://flbesttrainer.com/images/brandphoto14.jpg",
  sequence3: "https://flbesttrainer.com/images/brandphoto17.jpg",
} as const;

function escapeHtml(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
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

// The footer block — review ask (gated: only once value has been
// delivered — audit S1), follow-along, why-you-get-this, address,
// unsubscribe. Same content in HTML and text; the HTML version is the
// only place the review link is a button, and it is a small outlined
// one so the email's primary button stays primary. Footer type is
// 14px minimum (audit S12) — the readers are 50+.
export function renderEmailFooterHtml(opts: {
  unsubscribeUrl: string;
  footerBusiness: string;
  footerAddress: string;
  showReview?: boolean;
  source?: string | null;
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
  return `
    <hr style="border: none; border-top: 1px solid #ddd; margin: 8px 0 16px;" />
    ${review}
    ${socialLinksHtml()}
    <p style="margin: 0 0 10px;">${escapeHtml(whyYouGetThisLine(opts.source))}</p>
    <p style="margin: 0 0 10px;">${opts.footerBusiness}<br />${opts.footerAddress}</p>
    <p style="margin: 0;"><a href="${opts.unsubscribeUrl}" style="color: #1D4ED8; text-decoration: underline;">Unsubscribe</a> any time &mdash; one click, no questions.</p>
  `;
}

export function renderEmailFooterText(opts: {
  unsubscribeUrl: string;
  footerBusiness: string;
  footerAddress: string;
  showReview?: boolean;
  source?: string | null;
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
    whyYouGetThisLine(opts.source),
    opts.footerBusiness,
    opts.footerAddress,
    `Unsubscribe any time: ${opts.unsubscribeUrl}`,
  ].join("\n");
}

// Full email HTML: navy header band (wordmark + tagline), optional
// hero photo, optional progress eyebrow ("Tip 1 of 3"), body slot,
// optional PS, optional primary button, footer. Body HTML is the
// email's content as written — paragraphs inherit the font from the
// wrapping cell.
export function renderEmailTemplate(opts: {
  bodyHtml: string;
  cta?: EmailCta;
  ps?: string;
  preheader?: string;
  heroImageUrl?: string;
  heroAlt?: string;
  eyebrow?: string;
  unsubscribeUrl: string;
  footerBusiness: string;
  footerAddress: string;
  showReview?: boolean;
  source?: string | null;
}): string {
  const button = opts.cta
    ? `
    <table class="cta-btn" role="presentation" cellpadding="0" cellspacing="0" style="margin: 24px 0 8px;">
      <tr>
        <td align="center" style="background-color: #4169E1; border-radius: 6px;">
          <a href="${opts.cta.url}" style="display: inline-block; padding: 14px 28px; font-family: ${FONT_STACK}; font-size: 16px; font-weight: 700; color: #ffffff; text-decoration: none;">${opts.cta.label}</a>
        </td>
      </tr>
    </table>`
    : "";
  const ps = opts.ps
    ? `<p style="margin: 16px 0 0;">P.S. ${opts.ps}</p>`
    : "";
  const preheader = opts.preheader
    ? `<div style="display: none; max-height: 0; overflow: hidden; mso-hide: all; font-size: 1px; line-height: 1px; color: #F3F4F6;">${escapeHtml(opts.preheader)}</div>`
    : "";
  const hero = opts.heroImageUrl
    ? `<tr><td style="padding: 0; line-height: 0;"><img src="${opts.heroImageUrl}" alt="${escapeHtml(opts.heroAlt ?? "FL Best Trainer")}" width="600" style="display: block; width: 100%; max-width: 600px; height: auto; border: 0;" /></td></tr>`
    : "";
  const eyebrow = opts.eyebrow
    ? `<div style="font-size: 12px; font-weight: 700; letter-spacing: 1.5px; text-transform: uppercase; color: #4169E1; margin-bottom: 12px;">${escapeHtml(opts.eyebrow)}</div>`
    : "";
  return `<!doctype html>
<html>
<head>
<meta charset="utf-8" />
<meta name="viewport" content="width=device-width, initial-scale=1" />
<meta name="color-scheme" content="light" />
<meta name="supported-color-schemes" content="light" />
<style>
  a { color: #1D4ED8; }
  @media only screen and (max-width: 600px) {
    .email-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .header-pad { padding-left: 20px !important; padding-right: 20px !important; }
    .cta-btn { width: 100% !important; }
    .cta-btn td { width: 100% !important; }
    .cta-btn a { display: block !important; text-align: center !important; }
  }
</style>
</head>
<body style="margin: 0; padding: 0; background-color: #F3F4F6;">
${preheader}
<center>
<table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="background-color: #F3F4F6;">
<tr>
<td align="center" style="padding: 24px 12px;">
<table role="presentation" width="600" cellpadding="0" cellspacing="0" style="width: 100%; max-width: 600px; background-color: #ffffff; border-radius: 8px;">
<tr>
<td class="header-pad" style="padding: 28px 32px; background-color: #0A1A3F; border-radius: 8px 8px 0 0; font-family: ${FONT_STACK};">
<div style="font-size: 24px; font-weight: 800; color: #ffffff; letter-spacing: 0.5px;">FL Best Trainer</div>
<div style="font-size: 13px; color: #C7D2FE; margin-top: 4px;">Independent for Life</div>
</td>
</tr>
${hero}
<tr>
<td class="email-pad" style="padding: 24px 32px; font-family: ${FONT_STACK}; font-size: 16px; line-height: 1.6; color: #1F2937;">
${eyebrow}${opts.bodyHtml}
${ps}
${button}
</td>
</tr>
<tr>
<td class="email-pad" style="padding: 0 32px 32px; font-family: ${FONT_STACK}; font-size: 14px; line-height: 1.6; color: #4B5563;">
${renderEmailFooterHtml({
  unsubscribeUrl: opts.unsubscribeUrl,
  footerBusiness: opts.footerBusiness,
  footerAddress: opts.footerAddress,
  showReview: opts.showReview,
  source: opts.source,
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
