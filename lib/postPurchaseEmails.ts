// Post-purchase sequence — what a buyer gets instead of the Starter
// pitch (research B7, design doc). Four emails, transcribed from the
// approved draft file in the goal workspace
// (post-purchase-sequence.md).
//
// APPROVED by Gavin 2026-11-23 ~14:32 ("email 1 post purchase
// sequence email 2 email 3 email 4 all good"). These defs are approved
// copy — no separate gate here, unlike the guide sequence. The trigger
// is a real purchase (the webhook enrolls the buyer), so nothing sends
// until someone actually buys.
//
// The ladder rule, in one line: a buyer never gets pitched the thing
// they already bought, or anything below it. Starter buyers get the
// Self-Study nudge at Day 7 (step 3); Self-Study and monthly buyers
// NEVER get it — the send checks purchase_emails again at step 3, so
// a buyer who upgrades after enrolling still skips it. Everyone gets
// the referral ask at Day 14 (step 4).
//
// This sequence does NOT reuse `sequence_step` (a buyer may also be
// mid-sequence; the two run side by side, and the sequence cron's
// buyer check keeps them from colliding). Its own send state lives in
// the `post_purchase_sequences` table (lib/newsletter.ts).
//
// Water-bottle line (Gavin 2026-11-23 ~14:32): email 1 reads "water
// bottles or your preferred dumbbell weight". Email 1's guarantee is
// the sales page's exact words, same as sequence email 3.
//
// Review ask: none of these four show the footer review button
// (showReview false). Email 4's PS carries the review ask itself in
// the body — a footer button on top of it would ask twice.

export interface PostPurchaseEmail {
  step: 1 | 2 | 3 | 4;
  subject: string;
  campaign: string;
  // Days after the purchase when this step is due.
  sendAfterDays: number;
  approved: boolean;
  // Email 2 and 4 have no button (their links sit inline in the body
  // or PS). One primary button per email either way.
  cta?: { label: string; url: string };
  ps?: string;
  headline?: string;
  preheader: string;
  eyebrow?: string;
  showReview: boolean;
  html: string;
}

export const POST_PURCHASE_EMAILS: PostPurchaseEmail[] = [
  {
    step: 1,
    subject: "You're in. Here's what to do first.",
    campaign: "post-purchase-1",
    sendAfterDays: 0,
    approved: true,
    cta: {
      label: "Open your Starter plan",
      url: "https://flbesttrainer.com/starter",
    },
    ps: "If anything in the plan is confusing, hit reply and tell me what. I would rather fix it now than have you stuck on Day 3.",
    preheader: "You did the hard part — you started.",
    showReview: false,
    html: `
<p>Hi {first_name},</p>
<p>You are in. Thank you — I mean that. You just did the hard part, which is starting.</p>
<p>Here is what to do first. Open the Starter plan and do Day 1. Not all of it if you are tired — just Day 1, slow. A chair, a wall, water bottles or your preferred dumbbell weight. That is the whole setup.</p>
<p>Your plan, your movement library, and your tracker are all in your account. The exercise videos are still being filmed — every buyer gets them free as each one publishes.</p>
<p>And remember the guarantee. Finish all 12 sessions and retest on Day 28. If your numbers didn't improve, email me for a full $37 refund.</p>
`,
  },
  {
    step: 2,
    subject: "Day 2 — the one thing to get right",
    campaign: "post-purchase-2",
    sendAfterDays: 2,
    approved: true,
    // No button: the PS carries the blog link (rendered as a link by
    // the template's PS linkifier — see lib/emailTemplate.ts).
    ps: "I wrote more about it here, if you want the full version: [Why Slowing Down Gets You Stronger After 50](https://flbesttrainer.com/blog/slow-down-form-first-after-50).",
    preheader: "Slow down. That is the whole trick.",
    showReview: false,
    html: `
<p>Hi {first_name},</p>
<p>You started. Good. Here is the one thing to get right in Week 1.</p>
<p>Slow down. Take two to three seconds on the way down of every rep. If you can not control it on the way down, it is too heavy. Drop the weight. There is no shame in a lighter dumbbell.</p>
<p>A lighter weight, lifted with control, builds more strength than a heavy one you have to heave around. That is the whole trick, and it is the reason the plan works.</p>
<p>Do Day 2 slow. That is all I ask this week.</p>
`,
  },
  {
    step: 3,
    subject: "Finished Week 1? Here's what comes after Starter",
    campaign: "post-purchase-3",
    sendAfterDays: 7,
    approved: true,
    cta: {
      label: "See Self-Study — $197",
      url: "https://flbesttrainer.com/self-study",
    },
    ps: "If you are not sure, finish Starter first. The Day 28 retest will tell you more than I can.",
    preheader: "Starter is complete on its own. This is for when you want more.",
    showReview: false,
    html: `
<p>Hi {first_name},</p>
<p>You are a week in. You proved you can do this. That was the hard part.</p>
<p>Starter is 4 weeks, and it will carry you a long way. But if you are the kind of person who wants the whole system — the full program, the deeper library, everything in one place — that is what Self-Study is for.</p>
<p>It is $197, one time. Same idea as Starter, just the full version. No monthly anything.</p>
<p>You do not need it to finish Starter. Starter is complete on its own. This is for when you want more.</p>
`,
  },
  {
    step: 4,
    subject: "Know someone who needs this?",
    campaign: "post-purchase-4",
    sendAfterDays: 14,
    approved: true,
    // No button: the guide link sits inline in the body, and the PS
    // carries the Google review link (template PS linkifier).
    ps: "If the guide helped you, a quick Google review helps more people over 50 find us. [Leave a review on Google](https://www.google.com/maps/search/?api=1&query=FL+Best+Trainer)",
    preheader: "Send them the same 7 days you started with.",
    showReview: false,
    html: `
<p>Hi {first_name},</p>
<p>Two weeks in. You know what this is now — not a gym, not a bootcamp. Slow, a little at a time, and it adds up.</p>
<p>Do you know someone over 50 who is getting weaker and more afraid of moving? A parent, a neighbor, someone at church? Send them the free guide. It is the same 7 days you started with, and it costs them nothing.</p>
<p><a href="https://flbesttrainer.com/start">https://flbesttrainer.com/start</a></p>
<p>That is it. No ask for you, just for them.</p>
`,
  },
];

export function postPurchaseEmailForStep(
  step: number
): PostPurchaseEmail | null {
  return POST_PURCHASE_EMAILS.find((e) => e.step === step) ?? null;
}
