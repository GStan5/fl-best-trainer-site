// Gear system config — the single source of truth for affiliate links and
// disclosure wording. Prices are never written anywhere in pick or post
// text; the link carries the live price. Change the tag here and every
// Check Price button follows it (they all go through /go/[slug]).
import { LADDER } from "./ladder";

export const AMAZON_TAG = "flbesttrainer-20";

export const AMAZON_DP_BASE = "https://www.amazon.com/dp/";

export function amazonUrl(asin) {
  return `${AMAZON_DP_BASE}${asin}?tag=${AMAZON_TAG}`;
}

// Short disclosure line, in Gavin's voice. Same words on every gear page,
// under the first group of affiliate links, and in the footer.
export const DISCLOSURE_SHORT_LINE =
  "If you buy through my link, I earn a small commission. It doesn't cost you anything, and I only pick gear I'd hand to my own clients.";

// Amazon's required wording. Exact, not paraphrased. On every page with
// Amazon links, beside the short line.
export const AMAZON_DISCLOSURE =
  "As an Amazon Associate I earn from qualifying purchases.";

// "Last updated" date on /gear. Change it every time anything on the page
// changes (a pick added, a score changed, a link fixed).
export const GEAR_PAGE_LAST_UPDATED = "November 23, 2026";

// Form check: linked from gear picks WITHOUT a price — the price is
// undecided (Gavin's call; $29 proposed). When it is set, anchor it
// against the $160 one-on-one session, not the $55 group class.
export const FORM_CHECK_URL = "/form-check";

// The plan beside a pick, resolved from the ladder — the single source
// of truth for plan names and prices. Pick data names the ladder
// product slug ("starter-plan", "self-study", ...), or null for the
// free guide; the name and price come from LADDER, never from the pick
// file. Display price: the guide shows "Free", never "$0".
export function gearPlanDetails(product: string | null) {
  const rung = LADDER.find((r) => r.product === product);
  if (!rung) return { name: "Free guide", price: "Free", url: "/start" };
  return {
    name: rung.name,
    price: rung.priceLabel === "$0" ? "Free" : rung.priceLabel,
    url: rung.url,
  };
}
