// REP kettlebell set : GGR Best Overall kettlebell, proposed pick.
// Scores + method are PROPOSED (Grim drafts, Gavin corrects, plan §7).
// ASIN identity is from search-index records, NOT yet SiteStripe-verified
// Confirm in SiteStripe before treating the link as settled.

export const repKettlebellSet = {
  slug: "rep-kettlebell-set",
  brand: "REP Fitness",
  title: "REP Fitness Kettlebell Set, 8–24 kg (1 of Each)",
  group: "strength-at-home",
  slot: "Best Overall",
  oneLine:
    "Five bells in one buy, light to heavy. Cast iron, flat base, color coded so you can see the weight at a glance.",
  verdict:
    "Five bells in one buy, from light to heavy. Cast iron with a textured coat, flat base so each bell sits still, color coded so you can see the weight at a glance. One set covers swings, squats, and carries for a long time.",
  // The honest weight note: this is the part that makes the pick
  // trustworthy. The set tops out at 53 lb, and you buy all five at once.
  weightNote:
    "The honest weight note: the set runs 8 to 24 kg, about 18 to 53 lb. Start with the 8 kg bell. The heavier bells are the goal, not the start. And the set tops out at 53 lb, so a strong client will need a heavier bell bought on its own later.",
  score: {
    // Proposed scores: Gavin sets the numbers.
    factors: [
      {
        name: "Grip",
        score: 5,
        note: "Textured powder coat and a handle that fits the hand. Holds with sweaty hands.",
      },
      {
        name: "Safety at Home",
        score: 4,
        note: "Flat base, sits still on the floor. Still cast iron, so a drop can mark the floor.",
      },
      {
        name: "Storage",
        score: 3,
        note: "Five bells take a corner of the room. They line up in a row, but they are five separate pieces.",
      },
      {
        name: "Right Weight to Start",
        score: 4,
        note: "The 8 kg bell is a fair start. But you buy all five at once, even if you only need the lightest one today.",
      },
      {
        name: "Value",
        score: 4,
        note: "One buy covers five weights, light to heavy. No piecing a set together over time.",
      },
    ],
    average: 4.0,
  },
  method:
    "I have not tested this set in class yet. This is Garage Gym Reviews' top pick for kettlebells, proposed here for me to confirm. They tested the build, the handle, the base, and the weight range. The scores are a starting point. I set the numbers once I have used it with clients.",
  methodDate: "November 2026",
  outcome:
    "Swing, goblet squat, and carry with a bell that fits the hand and sits flat when you set it down.",
  plan: {
    product: "starter-plan",
    label: "Get the plan that uses it",
  },
  planSecondary: null,
  highlights: [
    "Five bells in one set, 8 to 24 kg",
    "Gravity die-cast iron, built to last",
    "Flat base, each bell sits still on the floor",
    "Color-coded handles with kg and lb markings",
    "Textured powder coat for grip",
  ],
  pros: [
    "One buy covers the full beginner to intermediate range",
    "Real cast iron bells, not plastic shells",
    "Color coding makes it easy to grab the right weight",
  ],
  cons: [
    "Five bells take up floor space",
    "Tops out at 53 lb, so strong clients outgrow the set",
    "Some owners report the powder coat chips with heavy use",
    "Buying five at once is a big first buy if you only need one bell",
  ],
  specs: [
    { label: "Weight range", value: "8–24 kg (about 18–53 lb), five bells" },
    { label: "Material", value: "Gravity die-cast iron, textured black powder coat" },
    { label: "Handle diameter", value: "32–39 mm, depending on the bell" },
    { label: "Weight markings", value: "Kilograms and pounds, color-coded" },
    { label: "Base", value: "Flat machined base" },
    { label: "What's included", value: "Five kettlebells: 8, 12, 16, 20, 24 kg" },
  ],
  experience:
    "I have not used this set in class yet. Kettlebells are the next step after dumbbells for my clients. Swings build hips and grip, goblet squats build legs, carries build everything at once. This is the set I would start with when a client is ready for bells.",
  chooseIf: [
    "You want one buy that covers light to heavy bells",
    "You have a corner to keep five bells in",
    "Dumbbells stopped being enough for swings and carries",
  ],
  avoidIf: [
    "You only need one bell right now, start with a single light bell instead",
    "You already swing heavier than 53 lb, this set tops out there",
  ],
  teachingPost: null,
  amazon: { asin: "B00NUIWMF0" },
  date: "November 23, 2026",
  proposed: true,
};
