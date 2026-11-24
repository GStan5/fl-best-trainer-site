// The Value Ladder — ONE config table, the single source of truth for
// what the newsletter system sells, in what order, and for how much.
//
// ONLINE PROGRAMS ONLY (Gavin 2026-11-23): the point of this system
// is to sell online programs, GGR-style. In-person happening is fine
// but is NEVER what the weekly deal pitches — classes and in-home do
// not appear anywhere in this table. The old table steered the best
// buyers to in-home training and the 10-class pack; that was
// backwards and is gone.
//
// NO HARDCODING (Principle 25, re-affirmed 2026-11-23 — the rule
// covers all of Gavin's systems, not just the game): adding a plan
// past Monthly is ONE ROW here — no code change anywhere. The weekly
// deal resolver, the post-purchase nudge check, and the sequence
// buyer checks all read this file. Nothing else in the newsletter
// code names a rung, a price, or a deal.
//
// A rung is pitched to the reader exactly one rung below it, so each
// rung's deal line is written for that reader ("You finished
// Starter..." on the Self-Study rung, and so on). The top rung has no
// next rung — a buyer who owns everything gets the referral ask
// instead of a pitch, and so does a buyer of a product we don't
// recognise (an unknown product must never cause a pitch DOWN the
// ladder — no pitch at all is the safe side).

export const SITE = "https://www.flbesttrainer.com";

export interface LadderRung {
  /** Rank on the ladder, ascending. 0 = the free guide (owns nothing yet). */
  rank: number;
  /** Product slug in purchase_emails that counts as owning this rung. null = the free guide (no purchase). */
  product: string | null;
  /** Extra slugs that count as the same rung (the monthly tiers). */
  productAliases?: string[];
  name: string;
  /** Price as shown in a deal button, e.g. "$37", "$97/mo". */
  priceLabel: string;
  /**
   * Price in cents for the revenue math (analytics, 2026-11-24).
   * One-time price for Starter / Self-Study / Flagship; for Monthly
   * it is the first month's payment — a monthly buyer pays this once
   * inside the first 30 days. The Flagship rung is waitlist-only
   * today (no Stripe product), so no flagship rows exist yet; the
   * figure is the real one-time price for when it opens.
   */
  priceCents: number;
  /**
   * Per-alias prices in cents, for rungs with productAliases whose
   * tiers cost differently (Monthly 147 / 197). A product not listed
   * here falls back to priceCents.
   */
  aliasPriceCents?: Record<string, number>;
  /** Where the deal button goes. */
  url: string;
  /** Button label for the weekly deal pitching THIS rung. Absent on the guide rung — it is the base, never a pitch. */
  dealLabel?: string;
  /** One-line why for the weekly deal pitching THIS rung. Written for the reader exactly one rung below. */
  dealLine?: string;
}

export const LADDER: LadderRung[] = [
  {
    rank: 0,
    product: null,
    name: "Free guide",
    priceLabel: "$0",
    priceCents: 0,
    url: `${SITE}/start`,
    // No dealLabel / dealLine: the guide is the base of the ladder,
    // never something the weekly pitches.
  },
  {
    rank: 1,
    product: "starter-plan",
    name: "Starter",
    priceLabel: "$37",
    priceCents: 3700,
    url: `${SITE}/starter`,
    dealLabel: "Start the Starter plan — $37",
    dealLine:
      "The Starter plan is $37, one time, less than one session with me ($160). Four weeks, 12 sessions. Finish all 12, retest on Day 28, and if your numbers didn't improve, email me for a full $37 refund.",
  },
  {
    rank: 2,
    product: "self-study",
    name: "Self-Study",
    priceLabel: "$197",
    priceCents: 19700,
    url: `${SITE}/self-study`,
    dealLabel: "Get the Self-Study plan — $197",
    dealLine:
      "You finished Starter. Self-Study is the full 6 weeks — the same sessions, on your own schedule, $197 once.",
  },
  {
    rank: 3,
    product: "flagship",
    name: "Flagship",
    priceLabel: "$497",
    priceCents: 49700,
    url: `${SITE}/flagship`,
    // WAITLIST, not a purchase (verified 2026-11-23 in
    // pages/flagship.tsx): the founding cohort is not yet enrolling,
    // the Enroll buttons are a waitlist form, and there is no Stripe
    // product for flagship. Gavin (2026-11-23) has NOT decided how
    // to build the program system yet — for now people can only sign
    // up to reserve spots, probably run in groups with limited spots.
    // The price is real ($497 one time, 3x$185 on the page as the
    // offer description) — so the deal names the price and the action
    // is joining the waitlist, never a buy that doesn't exist. And
    // joining the waitlist costs nothing today: reserve only, pay
    // nothing until the cohort opens (Gavin's words, confirmed
    // 2026-11-23 ~15:15). When the cohort opens, this label becomes
    // a buy label; the rung, price, and link stay the same.
    dealLabel: "Join the Flagship waitlist — $497",
    dealLine: "Reserve your spot for FREE today.",
  },
  {
    rank: 4,
    product: "monthly-97",
    productAliases: ["monthly-147", "monthly-197"],
    name: "Monthly",
    priceLabel: "$97/mo",
    priceCents: 9700,
    aliasPriceCents: { "monthly-147": 14700, "monthly-197": 19700 },
    url: `${SITE}/monthly`,
    dealLabel: "Keep going with Monthly — $97/mo",
    dealLine:
      "The 6 weeks got you strong. Monthly keeps you strong — a new training block every month, weekly group Q&A, and a coach in your corner. $97 a month.",
  },
];

// The top slot: a buyer who owns everything, or owns a product we
// don't recognise, gets the referral ask instead of a pitch. The line
// is the approved post-purchase email 4 copy (Gavin 2026-11-23
// ~14:32), reused word for word — no new copy invented here.
export interface WeeklyDeal {
  key: "starter-plan" | "self-study" | "flagship" | "monthly-97" | "referral";
  label: string;
  url: string;
  line: string;
}

export const REFERRAL_ASK: WeeklyDeal = {
  key: "referral",
  label: "Send them the free guide",
  url: `${SITE}/start`,
  line: "Do you know someone over 50 who is getting weaker and more afraid of moving? A parent, a neighbor, someone at church? Send them the free guide. It is the same 7 days you started with, and it costs them nothing.",
};

const TOP_RANK = LADDER[LADDER.length - 1].rank;

/** The rung a product slug counts as owning, or null for an unrecognised product. */
export function rungForProduct(product: string): LadderRung | null {
  return (
    LADDER.find(
      (r) =>
        r.product === product || (r.productAliases ?? []).includes(product)
    ) ?? null
  );
}

/**
 * Revenue value of one purchase of a product, in cents (analytics,
 * 2026-11-24). Reads the ladder config — no price is a literal here.
 * An unrecognised product is worth 0: unknown revenue must never
 * inflate the number.
 */
export function priceCentsForProduct(product: string): number {
  const rung = rungForProduct(product);
  if (!rung) return 0;
  return rung.aliasPriceCents?.[product] ?? rung.priceCents;
}

/**
 * Rank of a product on the ladder. An unrecognised product ranks
 * ABOVE the top rung — it must never cause a pitch down the ladder,
 * and the safe side of "we don't know what they own" is no pitch at
 * all (the referral ask).
 */
export function ladderRank(product: string): number {
  const rung = rungForProduct(product);
  return rung ? rung.rank : TOP_RANK + 1;
}

/** Highest rank owned. No products = the guide rung (rank 0). */
export function highestOwnedRank(products: string[]): number {
  let best = 0;
  for (const p of products) best = Math.max(best, ladderRank(p));
  return best;
}

/**
 * The next rung after the buyer's highest owned rung — the deal they
 * get. Null when there is no next rung: they own the top rung, or
 * they own something unrecognised. Either way the answer is the
 * referral ask, never a pitch.
 */
export function nextRungAfterProducts(
  products: string[]
): LadderRung | null {
  const owned = highestOwnedRank(products);
  return LADDER.find((r) => r.rank === owned + 1) ?? null;
}

/** The weekly deal for a buyer: the next rung up, or the referral ask at the top. Pure function, unit-testable without a DB. */
export function weeklyDealForProducts(products: string[]): WeeklyDeal {
  const next = nextRungAfterProducts(products);
  if (!next || !next.dealLabel || !next.dealLine || !next.product) {
    return REFERRAL_ASK;
  }
  return {
    key: next.product as WeeklyDeal["key"],
    label: next.dealLabel,
    url: next.url,
    line: next.dealLine,
  };
}

// ---------------------------------------------------------------------------
// Send gate (Gavin 2026-11-23) — who may receive marketing email at all.
// ---------------------------------------------------------------------------
//
// While the gate is ON, ONLY the allowlist receives marketing email:
// the sequence, the weekly, post-purchase, winback, and live sends
// from the test route. Everyone else is skipped and logged
// (status `skipped-not-allowlisted`), never sent — dry runs report
// the skip the same way. A gated skip is TERMINAL for that email:
// the gate period is a blackout, not a deferral — the skipped step
// advances to finished, it does not sit due waiting for the gate to
// lift. When the gate lifts, new enrollments flow normally.
//
// The gate is ON by default and ONLY Gavin lifts it (flip
// NEWSLETTER_SEND_GATE_ON to false). Nobody else — not a launch
// step, not a test, not a "the list looks clean now" judgement call.
//
// The guide email itself is NOT gated: it is transactional (the PDF
// someone asked for). While the gate is ON, guide-signup also does
// NOT enroll new signups into the sequence — they land on the list
// at step 0 with no sequence and no next_send_at (like the flagship
// lead today), so nobody silently queues up for the day the gate
// lifts. Enrollment becomes a deliberate step when Gavin lifts it.
//
// The allowlist is Gavin's address and Grim's — one spelling each.
// The system treats the two casings of Gavin's address as ONE
// address (emails are normalized — trim + lowercase — at every entry
// point, lib/newsletter.ts normalizeEmail, and the DB enforces
// case-insensitive uniqueness), so the allowlist holds the lowercase
// form only. Matching is still case-insensitive as a belt-and-braces.
export const NEWSLETTER_SEND_GATE_ON = true;

export const NEWSLETTER_ALLOWLIST = [
  "gavinstanifer@live.com",
  "grim1051990@gmail.com",
] as const;

/** Case-insensitive allowlist check. */
export function isAllowlisted(email: string): boolean {
  const normalized = email.trim().toLowerCase();
  return (NEWSLETTER_ALLOWLIST as readonly string[]).some(
    (allowed) => allowed.toLowerCase() === normalized
  );
}

/** The one check every marketing send path calls: may this address receive marketing email right now? */
export function marketingSendAllowed(email: string): boolean {
  return !NEWSLETTER_SEND_GATE_ON || isAllowlisted(email);
}

// ---------------------------------------------------------------------------
// Timing + thresholds the system acts on (Job 2 — no hardcoding).
// These are the numbers the ENGINE uses; the email bodies' own numbers
// (approved copy, prices inside sentences, the guarantee) stay exactly
// as approved and are NOT config — see the sweep note in the design
// doc. Provider facts stay literal too: the 100KB Gmail clipping
// guardrail in buildMarketingEmail is Gmail's limit, not a tunable.
// ---------------------------------------------------------------------------

/** Sunset policy (research B6, winback B9): days of silence (no opens or clicks) before a subscriber is enrolled in the winback sequence. */
export const SUNSET_SILENT_DAYS = 90;

/** Admin stats: the "joined recently" window ("joined7d" on the admin screen). */
export const ADMIN_JOINED_WINDOW_DAYS = 7;
