// Independent for Life — niche focused plans (Phase 5 addition, Gavin
// 2026-10-08). These programs are IN PRODUCTION, not for sale: each page
// runs a founding-list signup (firstName + email → /api/guide-signup
// with the per-plan source below; members get the free 7-day guide
// today). No prices and no guarantee claims anywhere on these pages —
// copy is the claims-safe text approved for this system. Editorial
// rule: programs ship one at a time on member pull (founding-list size
// + reply themes), never on a calendar promise.

export interface NicheProgram {
  slug: string;
  name: string;
  shortName: string;
  headline: string;
  subhead: string;
  whoFor: string;
  outcomes: string[];
  source: string;
}

export const NICHE_PROGRAMS: NicheProgram[] = [
  {
    slug: "back-pain",
    name: "Back-Friendly Strength — Independent for Life",
    shortName: "Back-Friendly Strength",
    headline: "Strength training that respects your back",
    subhead:
      "For adults 50+ whose back complains when they lift, bend, or garden. Stronger hips, a braced core, and hinges dosed for sensitive backs — so daily life stops feeling risky. This is exercise instruction, not a diagnosis or treatment; get your doctor's OK first.",
    whoFor:
      "Adults 50+ with a sensitive back who still want to lift, carry, and garden without fear.",
    outcomes: [
      "Hip hinge without dreading it",
      "Groceries and laundry carried with a core that braces for you",
      "Bend, reach, and get up off the floor with strength to spare",
    ],
    source: "niche-back-pain",
  },
  {
    slug: "balance",
    name: "Steady & Strong: Balance Training",
    shortName: "Steady & Strong",
    headline: "Better balance isn't luck. It's trained.",
    subhead:
      "For adults 50+ who feel less sure on stairs, curbs, and uneven ground. Progressive balance and leg strength, always with support within reach.",
    whoFor:
      "Anyone who has grabbed a rail a little harder lately — and wants to need it less.",
    outcomes: [
      "Work toward the 30-second single-leg stand",
      "Heel-to-toe control, forward and back",
      "Stairs and curbs handled with confidence, not hope",
    ],
    source: "niche-balance",
  },
  {
    slug: "bone-density",
    name: "Bone Builder: Strength for Bone Health",
    shortName: "Bone Builder",
    headline: "Load is the signal your bones listen for",
    subhead:
      "Progressive strength training designed to support bone health, posture, and the muscle that protects you in a fall. Doctor clearance first — especially with osteoporosis or joint replacements.",
    whoFor:
      "Adults told to 'be careful' who would rather get stronger, carefully.",
    outcomes: [
      "Progressive resistance, loaded safely week to week",
      "Posture and upper-back strength that holds you tall",
      "Legs strong enough to catch you — before a stumble becomes a fall",
    ],
    source: "niche-bone-density",
  },
  {
    slug: "knee-friendly",
    name: "Knee-Friendly Strength",
    shortName: "Knee-Friendly Strength",
    headline: "Strong legs. Quieter knees.",
    subhead:
      "Leg strength without grinding through painful ranges: sit-to-stands, step-ups, and tempo work that builds muscle while respecting cranky knees.",
    whoFor:
      "Adults 50+ whose knees argue with stairs, chairs, and long walks.",
    outcomes: [
      "Stand up from low chairs without pushing off",
      "Stairs one at a time — then, one day, normally",
      "Walk farther before your knees call it a day",
    ],
    source: "niche-knee-friendly",
  },
  {
    slug: "chair-based",
    name: "Strong From the Chair",
    shortName: "Strong From the Chair",
    headline: "Start exactly where you are",
    subhead:
      "Every movement from — or with — a sturdy chair. The lowest-barrier way to begin strength training, and the on-ramp to everything else here.",
    whoFor:
      "True beginners, anyone returning after a long layoff, and anyone who feels safer starting seated.",
    outcomes: [
      "Seated-to-standing strength, progressed at your pace",
      "Circulation, posture, and energy from day one",
      "A first plan you can actually finish",
    ],
    source: "niche-chair-based",
  },
  {
    slug: "push-pull-legs",
    name: "Advanced: Push · Pull · Legs",
    shortName: "Push · Pull · Legs",
    headline: "For lifters who want a real split",
    subhead:
      "The classic 3-day push/pull/legs structure with progressive overload tracking — for experienced trainees who have outgrown the basics.",
    whoFor: "Experienced lifters wanting structure, progression, and coaching standards.",
    outcomes: [
      "Push, pull, and legs days that build on each other",
      "Progressive overload, tracked session to session",
      "No junk volume — every set earns its place",
    ],
    source: "niche-push-pull-legs",
  },
];
