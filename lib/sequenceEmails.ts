// The follow-up sequence — "Your First Week" (proposed sequence name).
// Four emails after the free guide: Day 2, Day 4, Day 7 (the Starter
// pitch), Day 14 (a check-in, no pitch). Content is transcribed from
// the approved draft files in the goal workspace
// (sequence-email-1/2/3.md, day-14-checkin.md) — Gavin's voice, short
// and plain, one idea per email, no selling until email 3.
//
// APPROVED by Gavin 2026-11-23 ~14:32 ("day 2 looks good", "day 4
// good", "day 7 good", "day 14 good") and wired into `html` here.
// The restructured bodies (Hormozi structure: immediate reward →
// problem → solution → bullets → CTA → PS → PPS) ARE the approved
// bodies now — there is no separate draft copy in this file anymore.
//
// GATE: SEQUENCE_APPROVED stays false until the post-merge test sends
// pass (Gavin's launch plan: merge → test send to the two test
// addresses → verify rendering → flip this → cron sends). The cron
// refuses to send an unapproved step and leaves the subscriber due.
// It is a human gate, not an automatic one — flip it in this file
// when Gavin says yes in chat, after the test sends.
//
// State machine (day-14-checkin.md): step 1 → step 2 (due Day 4) →
// step 3 (due Day 7) → step 4 (due Day 14) → step 5 = finished.
// A buyer who skips the step-3 pitch advances to step 4, not to
// finished — the Day-14 check-in is not a pitch, buyers get it too.
// NOTE: under the old 3-step scheme "finished" was step 4 with
// next_send_at NULL. The due query requires next_send_at <= now(),
// so an old step-4 row is never picked up as a Day-14 send — no
// migration needed.
//
// Email 3's guarantee is the sales page's exact words — no second
// version of the guarantee anywhere ("email me" in Gavin's voice,
// where the page says "email us").
//
// Water-bottle line (Gavin 2026-11-23 ~14:32): wherever the copy says
// the setup is a chair, a wall and water bottles, it reads "water
// bottles or your preferred dumbbell weight" — email 3 and the guide
// email. The /starter page carries the same line.

export interface SequenceEmail {
  step: 1 | 2 | 3 | 4;
  subject: string;
  campaign: string;
  // Days after the guide signup when this step is due.
  sendAfterDays: number;
  approved: boolean;
  // The email's one primary button — the email's existing link, rendered
  // as a visual button by the template (UTM tags added at send time).
  // Step 4 has no button: it is a check-in, reply only.
  cta?: { label: string; url: string };
  // Repeat the button once (research F8 — long email 3 only): renders
  // after the <!--cta--> marker in the body AND at the end.
  ctaRepeat?: boolean;
  // Headline (research F1) — the email's one idea, bold 20px above
  // the first paragraph. Step 4 has none: it opens with the question.
  headline?: string;
  // Optional postscript, rendered between the signature and the
  // button. Email 3's PS restates the OFFER, never the guarantee —
  // the guarantee lives in the body only, in the page's exact words
  // (audit S11: no second version of the guarantee anywhere).
  ps?: string;
  // Optional second postscript (research F5 — email 3 only, the
  // third most-read line).
  pps?: string;
  // Inbox preview line (audit S4), progress eyebrow, and whether the
  // footer review ask shows (audit S1: value first — the review ask
  // starts at email 2, never in email 1). Step 4 has no eyebrow
  // ("Tip N of 3" counts tips; the check-in is not a tip) and no
  // review ask (the only ask is "hit reply").
  preheader: string;
  eyebrow?: string;
  showReview: boolean;
  // The APPROVED body — what sends when the gate is flipped.
  html: string;
}

export const SEQUENCE_NAME = "Your First Week";

// Flip to true when the post-merge test sends pass and Gavin says yes.
// See the header note — the copy is approved, the gate is the launch.
export const SEQUENCE_APPROVED = false;

export const SEQUENCE_EMAILS: SequenceEmail[] = [
  {
    step: 1,
    subject: "Slow down. It works better.",
    campaign: "sequence-1",
    sendAfterDays: 2,
    approved: SEQUENCE_APPROVED,
    cta: {
      label: "Read the full post",
      url: "https://flbesttrainer.com/blog/slow-down-form-first-after-50",
    },
    headline: "Rushing the rep is how people get hurt.",
    ps: "Slow is the whole trick. Do Day 1 that way and you will feel it.",
    preheader: "The one mistake I see people over 50 make.",
    eyebrow: "Tip 1 of 3",
    showReview: false,
    html: `
<p>Hi {first_name},</p>
<p>I'm Gavin. I train people over 50 in their homes and in small classes, and everything I teach is about staying independent for life.</p>
<p>You got the guide. Good. Here is the one thing I want you to take from it first.</p>
<p>The biggest mistake I see people over 50 make is rushing. They try to move the weight and get the workout over with as fast as possible.</p>
<p>When you rush a rep, momentum takes over. The weight moves. Your muscles barely work. And the weight you are rushing through is usually too heavy to control, so your joints and your lower back pick up what your muscles were supposed to do. That is how people get hurt doing exercises that should have been safe.</p>
<p>Slow it down.</p>
<ul>
<li>Take 2–3 seconds on the way down.</li>
<li><strong>If you can not control it on the way down, it is too heavy.</strong> Drop the weight.</li>
</ul>
<p>There is no shame in a lighter dumbbell.</p>
<p>A lighter weight, lifted with control, builds more strength than a heavy one you have to heave around. I wrote more about it here: <a href="https://flbesttrainer.com/blog/slow-down-form-first-after-50">Why Slowing Down Gets You Stronger After 50</a>.</p>
<p>That is it for today. Do the guide slow, and it will work better.</p>
`,
  },
  {
    step: 2,
    subject: "Carry the groceries in. That is the test.",
    campaign: "sequence-2",
    sendAfterDays: 4,
    approved: SEQUENCE_APPROVED,
    cta: {
      label: "Read the full post",
      url: "https://flbesttrainer.com/blog/farmer-carries-every-class",
    },
    headline: "Carry the groceries in. That is the test.",
    ps: "Next time you carry the groceries in, pay attention to your grip. That is your training working.",
    preheader: "Watch them carry the groceries in.",
    eyebrow: "Tip 2 of 3",
    showReview: true,
    html: `
<p>Hi {first_name},</p>
<p>If you want to know how strong someone really is, watch them carry groceries in from the car.</p>
<p>Bags in both hands. A door to deal with. Maybe stairs. No warm-up. That is real life, and it is harder than most people admit.</p>
<p>That is why every class I teach does farmer carries. All of them. It uses your whole body at once. Balance, posture, grip, core, legs. And because everything has to work together, one side can not cover for the other when both hands are full.</p>
<p>Two things make it work. <strong>Go slow. And squeeze.</strong> Squeeze the weight with your hands, and squeeze your back so you stand tall. The grip work alone is worth it. Jars, bags, anything you pick up all day.</p>
<p>Here is something most people do not know. Farmer carries stretch out your shoulders and traps. That can help with neck pain, and neck pain can cause headaches.</p>
<p>If you are thinking you are too old for this, or that lifting will hurt you, you are not the only one. That is the worry almost everyone walks in with. Going slow is what keeps it safe.</p>
<p>So next time you bring the groceries in, pay attention. When the bags do not feel as heavy and your grip does not quit halfway and you are not out of breath at the door, that is your training working.</p>
<p>I wrote the full thing here: <a href="https://flbesttrainer.com/blog/farmer-carries-every-class">Why I Make Every Class Do Farmer Carries</a>.</p>
`,
  },
  {
    step: 3,
    subject: "The guide was 7 days. This is the full 4 weeks.",
    campaign: "sequence-3",
    sendAfterDays: 7,
    approved: SEQUENCE_APPROVED,
    cta: {
      label: "Start the Starter plan — $37",
      url: "https://flbesttrainer.com/starter",
    },
    ctaRepeat: true,
    headline: "Seven days proves you can do it. Four weeks changes your strength.",
    ps: "$37 once, yours forever — the full 4 weeks, the 14-exercise library, and the Day 1 and Day 28 retest.",
    pps: "The guide stays yours either way.",
    preheader: "Four weeks. Twelve sessions. One plan.",
    eyebrow: "Tip 3 of 3",
    showReview: true,
    html: `
<p>Hi {first_name},</p>
<p>The guide was 7 days. It was meant to prove you can do this. And you can.</p>
<p>But 7 days does not change your strength. A system does. That is what the Starter plan is. Four weeks, 12 sessions, 3 times a week, 30 minutes each. Same setup as the guide. A chair, a wall, and water bottles or your preferred dumbbell weight.</p>
<p>Here is what you get.</p>
<ul>
<li>The full 12-session program, Weeks 1 through 4, progressive. Every session builds on the last one.</li>
<li>The movement library. 14 exercises, every one with the setup, the one key cue, the common mistake, and an easier and a harder version.</li>
<li>The exercise videos as they are filmed. Every buyer gets them free as each one publishes.</li>
<li>Your one-page tracker. Print it, stick it on the fridge.</li>
<li>And the Week 4 retest, so you can prove to yourself it worked. You test yourself on Day 1 and Day 28. Your numbers are the proof.</li>
</ul>
<!--cta-->
<p>Starter won't make you 25 again. It'll make the stairs easier.</p>
<p><strong>One session with me is $160. Twelve sessions one-on-one would be $1,920. The Starter plan is $37.</strong> One time. Yours forever, including future updates.</p>
<p>And the guarantee. Finish all 12 sessions and retest on Day 28. If your numbers didn't improve, email me for a full $37 refund.</p>
<p>This is the last email in this first-week series. After this, you'll get one short email a week with one useful idea. If you want the full 4 weeks, it is here: <a href="https://flbesttrainer.com/starter">Start the Starter plan</a>.</p>
`,
  },
  {
    step: 4,
    subject: "How's it going?",
    campaign: "sequence-4",
    sendAfterDays: 14,
    approved: SEQUENCE_APPROVED,
    // No CTA: a check-in, reply only (draft: "Link: none — no CTA
    // button, reply only"). No headline: it opens with the question.
    // No eyebrow, no review ask — the only ask is "hit reply".
    ps: "If you did the Week 1 sessions, the Day 28 retest is where you will see it. Keep going.",
    preheader: "Two weeks in — how's it going?",
    showReview: false,
    html: `
<p>Hi {first_name},</p>
<p>It has been two weeks since you got the guide. How is it going?</p>
<p>Did you start Day 1? Did something hurt, or feel harder than you thought? Hit reply and tell me. I read every reply, and I answer them.</p>
<p>I started doing this because I watched people get weaker and more afraid of moving, year after year, and nobody told them it was fixable. It is fixable. Slow, a little at a time, and it adds up. That is the whole idea behind everything I teach.</p>
<p>If you are stuck on something, tell me what it is. That is what I am here for.</p>
`,
  },
];

export function sequenceEmailForStep(step: number): SequenceEmail | null {
  return SEQUENCE_EMAILS.find((e) => e.step === step) ?? null;
}
