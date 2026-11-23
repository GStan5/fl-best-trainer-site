// The follow-up sequence — "Your First Week" (proposed sequence name).
// Three short emails after the free guide, over a week, ending at
// Starter. Content is transcribed from the draft files in the goal
// workspace (sequence-email-1/2/3.md) — Gavin's voice, short and plain,
// one idea per email, no selling until email 3.
//
// NOTHING SENDS UNTIL GAVIN APPROVES. Each step carries `approved:
// false` by default; the sequence cron refuses to send a step that is
// not approved, and leaves the subscriber due. Approval is flipped
// here, in this file, when Gavin says yes in chat — it is a human
// gate, not an automatic one.
//
// Email 3's guarantee is the sales page's exact words — no second
// version of the guarantee anywhere ("email me" in Gavin's voice,
// where the page says "email us").

export interface SequenceEmail {
  step: 1 | 2 | 3;
  subject: string;
  campaign: string;
  // Days after the guide signup when this step is due.
  sendAfterDays: number;
  approved: boolean;
  html: string;
}

export const SEQUENCE_NAME = "Your First Week";

// Flip to true when Gavin approves the three drafts in chat.
export const SEQUENCE_APPROVED = false;

export const SEQUENCE_EMAILS: SequenceEmail[] = [
  {
    step: 1,
    subject: "Slow down. It works better.",
    campaign: "sequence-1",
    sendAfterDays: 2,
    approved: SEQUENCE_APPROVED,
    html: `
<p>Hi {first_name},</p>
<p>You got the guide. Good. Here is the one thing I want you to take from it first.</p>
<p>The biggest mistake I see people over 50 make is rushing. They try to move the weight and get the workout over with as fast as possible.</p>
<p>When you rush a rep, momentum takes over. The weight moves. Your muscles barely work. And the weight you are rushing through is usually too heavy to control, so your joints and your lower back pick up what your muscles were supposed to do. That is how people get hurt doing exercises that should have been safe.</p>
<p>Slow it down. Take two to three seconds on the way down of every rep. If you can not control it on the way down, it is too heavy. Drop the weight. There is no shame in a lighter dumbbell.</p>
<p>A lighter weight, lifted with control, builds more strength than a heavy one you have to heave around. I wrote more about it here: <a href="https://flbesttrainer.com/blog/slow-down-form-first-after-50">Why Slowing Down Gets You Stronger After 50</a>.</p>
<p>That is it for today. Do the guide slow, and it will work better.</p>
<p>Gavin</p>
`,
  },
  {
    step: 2,
    subject: "Carry the groceries in. That is the test.",
    campaign: "sequence-2",
    sendAfterDays: 4,
    approved: SEQUENCE_APPROVED,
    html: `
<p>Hi {first_name},</p>
<p>If you want to know how strong someone really is, watch them carry groceries in from the car.</p>
<p>Bags in both hands. A door to deal with. Maybe stairs. No warm-up. That is real life, and it is harder than most people admit.</p>
<p>That is why every class I teach does farmer carries. All of them. It uses your whole body at once. Balance, posture, grip, core, legs. And because everything has to work together, one side can not cover for the other when both hands are full.</p>
<p>Two things make it work. Go slow. And squeeze. Squeeze the weight with your hands, and squeeze your back so you stand tall. The grip work alone is worth it. Jars, bags, anything you pick up all day.</p>
<p>Here is something most people do not know. Farmer carries stretch out your shoulders and traps. That can help with neck pain, and neck pain can cause headaches.</p>
<p>So next time you bring the groceries in, pay attention. When the bags do not feel as heavy and your grip does not quit halfway and you are not out of breath at the door, that is your training working.</p>
<p>I wrote the full thing here: <a href="https://flbesttrainer.com/blog/farmer-carries-every-class">Why I Make Every Class Do Farmer Carries</a>.</p>
<p>Gavin</p>
`,
  },
  {
    step: 3,
    subject: "The guide was 7 days. This is the full 4 weeks.",
    campaign: "sequence-3",
    sendAfterDays: 7,
    approved: SEQUENCE_APPROVED,
    html: `
<p>Hi {first_name},</p>
<p>The guide was 7 days. It was meant to prove you can do this. And you can.</p>
<p>But 7 days does not change your strength. A system does. That is what the Starter plan is. Four weeks, 12 sessions, 3 times a week, 30 minutes each. Same setup as the guide. A chair, a wall, water bottles.</p>
<p>Here is what you get.</p>
<p>The full 12-session program, Weeks 1 through 4, progressive. Every session builds on the last one.</p>
<p>The movement library. 14 exercises, every one with the setup, the one key cue, the common mistake, and an easier and a harder version.</p>
<p>The exercise videos as they are filmed. Every buyer gets them free as each one publishes.</p>
<p>Your one-page tracker. Print it, stick it on the fridge.</p>
<p>And the Week 4 retest, so you can prove to yourself it worked. You test yourself on Day 1 and Day 28. Your numbers are the proof.</p>
<p>One session with me is $160. Twelve sessions one-on-one would be $1,920. The Starter plan is $37, one time. Yours forever, including future updates.</p>
<p>And the guarantee. Finish all 12 sessions and retest on Day 28. If your numbers didn't improve, email me for a full $37 refund.</p>
<p>This is the last email in the series. The guide stays yours either way. If you want the full 4 weeks, it is here: <a href="https://flbesttrainer.com/starter">Start the Starter plan</a>.</p>
<p>Gavin</p>
`,
  },
];

export function sequenceEmailForStep(step: number): SequenceEmail | null {
  return SEQUENCE_EMAILS.find((e) => e.step === step) ?? null;
}
