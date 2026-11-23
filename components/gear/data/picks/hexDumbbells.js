// Hex dumbbells, the first pick, and the template every later pick copies.
// Scores + method are PROPOSED (Grim drafts, Gavin corrects, plan §7).
// ASIN identity is from search-index records, NOT yet SiteStripe-verified
//, confirm in SiteStripe before treating the link as settled.

export const hexDumbbells = {
  slug: "hex-dumbbells",
  brand: "Amazon Basics",
  title: "Amazon Basics Rubber Hex Dumbbell, 30 lb, Single",
  group: "strength-at-home",
  slot: "Best to Start With",
  oneLine:
    "The dumbbell I hand a client when water bottles get light. Hex so it doesn't roll, rubber so it doesn't wreck the floor.",
  verdict:
    "The dumbbell I hand a client when water bottles get light. Hex so it doesn't roll across the floor, rubber so it doesn't wreck the floor or slip in the hand. Heavy enough to matter for carries, light enough to control.",
  // The honest weight note, this is the part that makes the pick
  // trustworthy. 30 lb is the farmer-carry weight, NOT the starting
  // weight. Shown on the page, in full, under the verdict.
  weightNote:
    "The honest weight note: 30 lb is the farmer-carry weight, not the starting weight. Most people starting out should start lighter, the same Amazon Basics hex line comes in lighter weights. Start lighter, work up to this one.",
  score: {
    // Proposed scores, Gavin sets the numbers.
    factors: [
      {
        name: "Grip",
        score: 5,
        note: "Contoured handle, rubber coating. Holds with sweaty or arthritic hands.",
      },
      {
        name: "Safety at Home",
        score: 5,
        note: "Hex ends, won't roll. Rubber, won't chip the floor.",
      },
      {
        name: "Storage",
        score: 4,
        note: "One dumbbell lives in a corner; a pair lives under a chair.",
      },
      {
        name: "Right Weight to Start",
        score: 3,
        note: "The 30 is the goal weight for carries, not the start. Lighter weights in the same line are the start.",
      },
      {
        name: "Value",
        score: 5,
        note: "Amazon Basics pricing against the average dumbbell.",
      },
    ],
    average: 4.4,
  },
  method:
    "I use these in class. Farmer carries, every class. I looked at whether the handle stays put in the hand, whether it rolls when you set it down, whether it marks the floor, and whether my clients can pick it up and put it down without a second thought.",
  methodDate: "November 2026",
  outcome:
    "Carry 20 lbs, the flagship's measurable. Grip that doesn't quit halfway to the door, and balance under load.",
  plan: {
    product: "starter-plan",
    label: "Get the plan that uses it",
  },
  planSecondary: null,
  highlights: [
    "Hex ends stop it rolling across the floor",
    "Rubber coating protects the floor and won't slip in the hand",
    "Contoured handle, easy to hold",
    "One dumbbell, one weight, no plates, no settings, nothing to learn",
  ],
  pros: [
    "Does carries, rows, and presses, one dumbbell covers the Starter program",
    "Sits still where you set it down",
    "Cheap for what it is, Amazon Basics, not a boutique brand",
  ],
  cons: [
    "It's a single, not a pair, buy two if you want a pair",
    "No rack, no stand, it lives on the floor",
    "30 lb is too heavy to start with for most people, start lighter in the same line",
  ],
  specs: [
    { label: "Weight", value: "30 lb (single)" },
    { label: "Shape", value: "Hex, won't roll" },
    { label: "Handle", value: "Contoured, non-slip" },
    { label: "Coating / material", value: "Rubber-encased cast iron" },
    { label: "What's included", value: "One 30 lb dumbbell" },
  ],
  experience:
    "Farmer carries are in every class I teach, and this is the dumbbell my clients carry. The grip work alone is worth it, jars, bags, anything you pick up all day. And the shoulder and trap stretch helps people with neck pain. When the water bottles get light, this is what replaces them.",
  chooseIf: [
    "You want one dumbbell that does carries, rows, and presses at home",
    "You have a corner to keep it in",
    "Water bottles stopped being enough",
  ],
  avoidIf: [
    "30 lb is too heavy to control on the way down, start lighter in the same line, or start with water bottles and the free guide",
    "You want a matched pair out of the box, this is a single",
  ],
  teachingPost: {
    id: "farmer-carries-every-class",
    title: "Why I Make Every Class Do Farmer Carries",
  },
  amazon: { asin: "B074DYLY5V" },
  date: "November 23, 2026",
};
