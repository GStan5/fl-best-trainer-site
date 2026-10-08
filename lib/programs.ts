// Independent for Life — program catalog (Phase 5).
// Single source of truth for what the online business sells: used by the
// admin Online hub (programs section, signups-per-program) and safe to
// import from client components — pure data, no env, no secrets.
// Status strings describe the CURRENT go-live gates honestly:
// checkout-online refuses live-stripe unless ONLINE_SALES_LIVE=true (or a
// test key), the flagship is waitlist-only until the cohort opens, and
// the library stays closed until the videos are filmed.

export interface Program {
  slug: string;
  name: string;
  price: string;
  page: string;
  status: string;
  description: string;
}

export const PROGRAMS: Program[] = [
  {
    slug: "guide",
    name: "Free 7-Day Guide",
    price: "Free",
    page: "/start",
    status: "live-ready",
    description: "The free 7-day starter guide — the front door of the funnel.",
  },
  {
    slug: "starter",
    name: "4-Week Starter Plan",
    price: "$37",
    page: "/starter",
    status: "guarded-off until sales approval",
    description: "12 sessions, 30 minutes, 3x a week — the low-friction first purchase.",
  },
  {
    slug: "self-study",
    name: "Self-Study",
    price: "$197",
    page: "/self-study",
    status: "guarded-off until sales approval",
    description: "The full 6-week program — same sessions, no coaching.",
  },
  {
    slug: "flagship",
    name: "Independent for Life — 6-Week Flagship",
    price: "$497",
    page: "/flagship",
    status: "waitlist",
    description: "The coached flagship. Waitlist mode until the founding cohort opens.",
  },
  {
    slug: "monthly",
    name: "Monthly Continuity",
    price: "$97–$197/mo",
    page: "/monthly",
    status: "guarded-off until sales approval",
    description: "Monthly training blocks, the weekly Steady Letter, member continuity.",
  },
  // Niche focused plans (Phase 5 addition): in production, founding
  // lists open. Per-plan admin counts (lead source niche-<slug>) are
  // the demand signal that picks which plan gets written first. Copy
  // lives in lib/nichePrograms.ts; keep names in sync with it.
  {
    slug: "niche-back-pain",
    name: "Back-Friendly Strength — Independent for Life",
    price: "Founding list",
    page: "/plans/back-pain",
    status: "In production — founding list open",
    description:
      "Adults 50+ with a sensitive back who still want to lift, carry, and garden without fear.",
  },
  {
    slug: "niche-balance",
    name: "Steady & Strong: Balance Training",
    price: "Founding list",
    page: "/plans/balance",
    status: "In production — founding list open",
    description:
      "Anyone who has grabbed a rail a little harder lately — and wants to need it less.",
  },
  {
    slug: "niche-bone-density",
    name: "Bone Builder: Strength for Bone Health",
    price: "Founding list",
    page: "/plans/bone-density",
    status: "In production — founding list open",
    description:
      "Adults told to 'be careful' who would rather get stronger, carefully.",
  },
  {
    slug: "niche-knee-friendly",
    name: "Knee-Friendly Strength",
    price: "Founding list",
    page: "/plans/knee-friendly",
    status: "In production — founding list open",
    description: "Adults 50+ whose knees argue with stairs, chairs, and long walks.",
  },
  {
    slug: "niche-chair-based",
    name: "Strong From the Chair",
    price: "Founding list",
    page: "/plans/chair-based",
    status: "In production — founding list open",
    description:
      "True beginners, anyone returning after a long layoff, and anyone who feels safer starting seated.",
  },
  {
    slug: "niche-push-pull-legs",
    name: "Advanced: Push · Pull · Legs",
    price: "Founding list",
    page: "/plans/push-pull-legs",
    status: "In production — founding list open",
    description: "Experienced lifters wanting structure, progression, and coaching standards.",
  },
];

// Pages covered by first-party funnel tracking (components/FunnelTracker
// posts views; pages/api/track.ts accepts exactly these).
export const TRACKED_PAGES: string[] = [
  "/start",
  "/starter",
  "/flagship",
  "/self-study",
  "/monthly",
  "/plans",
  "/thank-you-starter",
  "/library",
  "/form-check",
];
