// REP QuickDraw adjustable dumbbell : GGR Best Budget adjustable
// dumbbell, proposed pick. Added at Gavin's direction 2026-11-23
// ("add the rep quickdraw") after the Amazon double-check found it on
// Amazon (ASIN B0CQ8WCGR6) while the dropped PÉPIN stays direct-only.
// Scores + method are PROPOSED (Grim drafts, Gavin corrects, plan §7).
// ASIN identity is from search-index records, NOT yet SiteStripe-verified
// Confirm in SiteStripe before treating the link as settled.
// Specs grounded in GGR's QuickDraw review and REP's own guide
// (2026-11-23): 5-60 lb per dumbbell, 5 lb steps, 2.5 lb add-on
// plates, Lock-N-Load steel switches, 32 mm volcano-knurl handle,
// 18.5 in long at 60 lb, cradle 20.6 x 8.45 in, replaces 12 sets.
// No warranty printed (unverified here) and no prices anywhere.

export const repQuickDrawAdjustableDumbbell = {
  slug: "rep-quickdraw-adjustable-dumbbell",
  brand: "REP Fitness",
  title: "REP Fitness QuickDraw Adjustable Dumbbell, 5–60 lb",
  group: "strength-at-home",
  slot: "Best Budget",
  oneLine:
    "One dumbbell that starts at 5 lb and grows to 60 lb with a flip of a switch. Steel switches, no dial, no rack of dumbbells to buy.",
  verdict:
    "One dumbbell that starts at 5 lb and grows to 60 lb with a flip of a steel switch. No dial to turn, no plates to swap, no rack of dumbbells to buy. One pair takes the place of twelve sets, and it starts light enough for a real beginner.",
  // The honest weight note: this is the part that makes the pick
  // trustworthy. It starts at 5 lb, so a beginner can start here, and
  // it tops out at 60 lb per hand. Buy the ceiling you need (30, 40,
  // 50, or 60 lb) and expand with add-on plates later.
  weightNote:
    "The honest weight note: this one starts at 5 lb, so it is a real first dumbbell, not just a goal weight. It tops out at 60 lb per hand. When 60 lb gets light, you need a heavier dumbbell. And it is long at full weight, 18.5 in, so check it clears your knees on carries.",
  score: {
    // Proposed scores: Gavin sets the numbers.
    factors: [
      {
        name: "Grip",
        score: 5,
        note: "32 mm nickel-plated handle with volcano knurling. Holds with sweaty hands and does not cut the hand.",
      },
      {
        name: "Safety at Home",
        score: 4,
        note: "Steel switches lock the plates in, no plastic dial to break. Long at full weight, so mind your knees on carries.",
      },
      {
        name: "Storage",
        score: 5,
        note: "One pair replaces twelve sets. The cradles live in one corner, 20.6 by 8.45 in each.",
      },
      {
        name: "Right Weight to Start",
        score: 5,
        note: "Starts at 5 lb, the lightest start of any adjustable here, with 2.5 lb add-on plates for small jumps. A beginner can start here and stay here for years.",
      },
      {
        name: "Value",
        score: 4,
        note: "One pair instead of twelve sets. Costs more than a fixed pair, less than a rack of dumbbells.",
      },
    ],
    average: 4.6,
  },
  method:
    "I have not tested these in class yet. This is Garage Gym Reviews' Best Budget pick for adjustable dumbbells, proposed here for me to confirm. They tested how fast the weight changes, whether the switches hold, and whether it feels like a real dumbbell. The scores are a starting point. I set the numbers once I have used them with clients.",
  methodDate: "November 2026",
  outcome:
    "Press, row, and carry with a weight that goes up 5 lb at a time, starting at 5 lb. The same pair carries a client from their first week to farmer carries at real weight.",
  plan: {
    product: "starter-plan",
    label: "Get the plan that uses it",
  },
  planSecondary: null,
  highlights: [
    "5 to 60 lb in one dumbbell, 5 lb steps",
    "Flip a steel switch to change weight, no dial to turn",
    "2.5 lb add-on plates for small jumps",
    "32 mm handle with volcano knurling, holds with sweaty hands",
    "One pair replaces twelve sets of dumbbells",
  ],
  pros: [
    "Starts at 5 lb, so a real beginner can start here",
    "Weight changes in seconds, flip a switch",
    "Steel switches and plates, no plastic dial to break",
    "Buy the ceiling you need and expand later with add-on plates",
  ],
  cons: [
    "18.5 in long at full weight, longer than a fixed dumbbell",
    "Tops out at 60 lb per hand",
    "The add-on plates are slower to put on and take off than the switches",
    "Two dumbbells plus cradles still take floor space, just less than a rack",
  ],
  specs: [
    { label: "Weight range", value: "5–60 lb per dumbbell" },
    { label: "Weight increments", value: "5 lb, with 2.5 lb add-on plates" },
    { label: "Change mechanism", value: "Lock-N-Load steel switches" },
    { label: "Handle", value: "32 mm, nickel-plated steel, volcano-style knurling" },
    { label: "Dumbbell length", value: "18.5 in at 60 lb" },
    { label: "Cradle", value: "20.6 in x 8.45 in" },
    { label: "Dumbbells replaced", value: "12 sets" },
    { label: "Material", value: "Steel plates, nylon composite" },
  ],
  experience:
    "I have not used these in class yet. What fits my clients: one pair, five pounds to start, and the same pair still works when they are carrying real weight. No rack to buy, no floor full of dumbbells. I would try them with a client who is ready to move past water bottles and wants one pair that lasts years.",
  chooseIf: [
    "You want one pair that starts light and grows with you",
    "You are short on space and a rack of dumbbells is out of the question",
    "You want weight changes fast between sets",
  ],
  avoidIf: [
    "You already press or row more than 60 lb per hand",
    "You want the shortest dumbbell possible, this one is long at full weight",
    "You want the simplest tool, a fixed dumbbell has no moving parts",
  ],
  teachingPost: null,
  amazon: { asin: "B0CQ8WCGR6" },
  date: "November 23, 2026",
  proposed: true,
};
