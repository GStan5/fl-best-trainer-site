// Resistance bands, pick 2. Scores + method are PROPOSED (Grim drafts,
// Gavin corrects, plan §7). ASIN identity is from search-index records,
// NOT yet SiteStripe-verified, confirm in SiteStripe before treating the
// link as settled.
//
// Note: the plan (§6.1) says a dedicated Daily Rep teaching post on bands
// is written BEFORE this pick goes live. That post does not exist yet —
// the pick links the farmer-carries post as its related teaching post
// (same movement family: carries, grip, the bridge from water bottles),
// and the dedicated bands post is a follow-up before this pick is
// promoted.

export const resistanceBands = {
  slug: "resistance-bands",
  brand: "ROSAPOAR",
  title: "ROSAPOAR Resistance Bands, Pull Up Assist Bands Set",
  group: "strength-at-home",
  slot: "Best Value",
  oneLine:
    "The next step up from water bottles, and the travel version of the dumbbell. Same muscles, no weight to carry, fits in a drawer.",
  verdict:
    "The next step up from water bottles, and the travel version of the dumbbell. Same muscles, no weight to carry, fits in a drawer. Five strengths in one set, so you start where you are and work up.",
  score: {
    // Proposed scores, Gavin sets the numbers.
    factors: [
      {
        name: "Grip",
        score: 4,
        note: "Loop bands, no handle, easier than a dumbbell for hands that can't grip yet, harder to hold than a handle once it gets heavy.",
      },
      {
        name: "Safety at Home",
        score: 4,
        note: "No weight to drop. Check the band for nicks before every use, a nicked band snaps.",
      },
      {
        name: "Storage",
        score: 5,
        note: "The whole set fits in a drawer, with the carry bag it comes with.",
      },
      {
        name: "Right Weight to Start",
        score: 5,
        note: "Five bands, 5 to 125 lb. The lightest band is a real starting point.",
      },
      {
        name: "Value",
        score: 5,
        note: "One set covers five strengths, the cheapest way into real resistance.",
      },
    ],
    average: 4.6,
  },
  method:
    "I use these in class for assisted work and for clients who can't grip a dumbbell comfortably yet. I looked at whether the band stays put, whether it helps or fights the movement, and whether a client can set it up alone. The test is the same as everything else: can my client use it, in a living room, without me standing next to them.",
  methodDate: "November 2026",
  outcome:
    "The bridge, water bottles to bands to dumbbells. Grip and strength without a weight to hold, and the first step for hands that aren't ready for a handle yet.",
  plan: {
    product: "starter-plan",
    label: "Get the plan that uses it",
  },
  planSecondary: null,
  highlights: [
    "Five color-coded bands, 5 to 125 lb, one set, five strengths",
    "Carry bag and workout guide included",
    "Fits in a drawer or a suitcase, the travel version of the dumbbell",
    "Natural latex loop bands, no handles to grip",
  ],
  pros: [
    "Start where you are and work up, five strengths in one box",
    "No weight to drop on a foot or a floor",
    "Goes anywhere, the whole set weighs almost nothing",
  ],
  cons: [
    "Natural latex, if you have a latex allergy, do not use these",
    "Resistance changes through the range, lighter at the bottom, heavier at the top",
    "No fixed number to track progress the way a dumbbell gives you",
  ],
  specs: [
    { label: "Bands", value: "5 loop bands: 5–15 / 15–35 / 25–65 / 35–85 / 50–125 lb" },
    { label: "Material", value: "Natural latex" },
    { label: "What's included", value: "5 bands, carry bag, workout guide" },
    { label: "Storage", value: "Fits in a drawer" },
  ],
  experience:
    "Some clients can't grip a dumbbell comfortably yet. The bands are how they start, same muscles, no handle to hold, and the lightest band is light enough for anyone. When the lightest band gets easy, there's a heavier one in the same set. That's the whole point of a set.",
  chooseIf: [
    "You want the next step up from water bottles",
    "Your hands can't grip a dumbbell comfortably yet",
    "You travel and want something that fits in a bag",
  ],
  avoidIf: [
    "You have a latex allergy, these are natural latex",
    "You want one fixed weight to track, a dumbbell gives you a number, a band doesn't",
  ],
  teachingPost: {
    id: "farmer-carries-every-class",
    title: "Why I Make Every Class Do Farmer Carries",
  },
  amazon: { asin: "B0CGX2256B" },
  date: "November 23, 2026",
};
