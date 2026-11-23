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

// Signature headshot — brandphoto12.jpg, verified by looking at it:
// Gavin facing the camera head-on, arms crossed, face clear. The other
// brand photos crop the face out or show him looking away. Gavin picks
// the photo if he disagrees with this one.
export const SIGNATURE_PHOTO_URL =
  "https://flbesttrainer.com/images/brandphoto12.jpg";

const FONT_STACK =
  "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif";

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

// The forward line (research B10) — weekly only, zero-infrastructure
// referral: one line, no per-subscriber links, no tracking, no
// rewards. The real referral program waits for Phase 2 tracking.
export const FORWARD_LINE =
  "Know someone over 50 who'd like this? Forward it — or send them to flbesttrainer.com/start.";

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
    <p style="margin: 0;"><a href="${opts.unsubscribeUrl}" style="color: #1D4ED8; text-decoration: underline;">Unsubscribe</a> any time &mdash; one click, no questions.</p>
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
// closes the letter. Small headshot, name, title, place, and the
// reply line — replies are a deliverability signal (research A2.8)
// and the raw material for the next post.
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
          <div class="email-sig-line" style="font-size: 14px; color: #4B5563;">FL Best Trainer &mdash; Longboat Key, Florida</div>
          <div class="email-sig-line" style="font-size: 14px; color: #4B5563; margin-top: 4px;">Hit reply &mdash; I read every reply.</div>
        </td>
      </tr>
    </table>`;
}

export function renderSignatureText(): string {
  return [
    "Gavin Stanifer",
    "NASM-CPT",
    "FL Best Trainer — Longboat Key, Florida",
    "Hit reply — I read every reply.",
  ].join("\n");
}

// Full email HTML: navy header band (wordmark + tagline), optional
// progress eyebrow ("Tip 1 of 3"), headline, body slot, optional
// "One deal" block (weekly only — the per-recipient deal, resolved
// from purchase_emails; renders as the fourth weekly block with its
// own button, after the body and before the signature), signature,
// optional PS / PPS, optional primary button (repeated once in the
// long email 3 — see ctaRepeat), footer. Body HTML is the email's
// content as written — paragraphs inherit the font from the wrapping
// cell. Body type is 17px / 1.7 (research F10, 50+ audience).
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
  // Weekly only: block 4 — the per-recipient deal (see
  // resolveWeeklyDeal in lib/newsletter.ts). One primary button per
  // email: a weekly has a deal and no cta; a sequence email has a
  // cta and no deal.
  deal?: { line: string; cta: EmailCta };
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
    ? `<p style="margin: 16px 0 0;">P.S. ${escapeHtml(opts.ps)}</p>`
    : "";
  const pps = opts.pps
    ? `<p style="margin: 8px 0 0;">P.P.S. ${escapeHtml(opts.pps)}</p>`
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
  // The deal block (weekly only): the fourth block of the weekly
  // container — "One deal", the one-line why, and its button. It
  // renders after the body (blocks 1–3) and before the signature, so
  // the pitch sits last, after the teaching.
  const dealBlock = opts.deal
    ? `
    <p style="margin: 16px 0 4px; font-size: 14px; font-weight: 800; letter-spacing: 1px; text-transform: uppercase; color: #4169E1;">One deal</p>
    <p>${escapeHtml(opts.deal.line)}</p>
    ${button(opts.deal.cta)}`
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
${dealBlock}
${renderSignatureHtml()}
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
