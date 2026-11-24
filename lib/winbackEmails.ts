// Winback sequence — the re-engage step of the sunset policy
// (research B9, design doc B6). Three emails, transcribed from the
// approved draft file in the goal workspace (winback-sequence.md).
//
// APPROVED by Gavin 2026-11-23 ~14:32 ("windback all good excellent
// job") — that approval covered the OLD reply-based copy. The copy
// below was REBUILT click-based 2026-11-24 under the zero-contact
// rule (Gavin 2026-11-24) and is NOT approved until Gavin says so
// from the exact renders. These defs are approved: true in code
// (the winback engine has no separate gate — the send gate is the
// only backstop), so do NOT merge this branch until he re-approves.
// The trigger is 90 days of silence (no opens or clicks in
// email_events), found by the sequence cron's sunset check; the
// subscriber is enrolled in this sequence instead of being
// suppressed in place, and suppression happens only after email 3
// is sent.
//
// Hormozi's shape, adapted to zero contact: value first, no pitch
// until the last email, and the last email asks them to choose —
// click to stay on the blog, or do nothing and we stop. None of the
// three is a pitch, and none shows the footer review button
// (showReview false — a review ask in a re-engage email would be
// noise; email 3's body points at the blog instead).
//
// Own send state in the `winback_sequences` table (lib/newsletter.ts),
// never `sequence_step`. Suppression is a state, never a delete;
// resubscribing restarts everything at step 1.
//
// LIMIT, stated plainly: the "stay" click cannot yet stop
// suppression. Click tracking (email_events) is Phase 2 and does not
// exist — so after email 3 the cron suppresses on the send, and the
// step 3 copy must NOT promise the click keeps them subscribed: it
// frames the start-here hub link as where the ideas live without
// the emails. When click tracking lands, wire the click to cancel
// suppression and reword step 3 to say so. The trigger itself is
// also dormant until the email_events table exists: without it the
// sunset check throws and is skipped, exactly as it does today.

export interface WinbackEmail {
  step: 1 | 2 | 3;
  subject: string;
  campaign: string;
  // Days after enrollment (the 90-day silence finding) when this
  // step is due. ~5 days apart: 0, 5, 10.
  sendAfterDays: number;
  approved: boolean;
  // No buttons anywhere in this sequence — the only links are inline
  // in the body (email 2) or the PS (email 3).
  cta?: { label: string; url: string };
  ps?: string;
  headline?: string;
  preheader: string;
  eyebrow?: string;
  showReview: boolean;
  html: string;
}

export const WINBACK_EMAILS: WinbackEmail[] = [
  {
    step: 1,
    subject: "Still looking to stay independent for life?",
    campaign: "winback-1",
    sendAfterDays: 0,
    approved: true,
    // No CTA button: the link is inline in the body (a question
    // with a link to /start, not a reply ask).
    headline: "Still looking to stay independent for life?",
    preheader: "It's been a while. The guide is still yours.",
    showReview: false,
    html: `
<p>Hi {first_name},</p>
<p>It's been a while since you got the guide. Are you still looking to stay independent for life?</p>
<p>If you are, the guide is still yours. Start again from Day 1: <a href="https://www.flbesttrainer.com/start">the free 7-day guide</a>.</p>
<p>Seven days. Twelve minutes a day. A chair, a wall, and water bottles or your preferred dumbbell weight. That is all it takes to start.</p>
`,
  },
  {
    step: 2,
    subject: "The one thing I'd tell you if we met today",
    campaign: "winback-2",
    sendAfterDays: 5,
    approved: true,
    preheader: "Slow down. That one change does more than any program.",
    showReview: false,
    html: `
<p>Hi {first_name},</p>
<p>If we met today and you asked me for the one thing that matters most after 50, it would be this.</p>
<p>Slow down. Take two to three seconds on the way down of every rep. If you can not control it on the way down, it is too heavy. Drop the weight.</p>
<p>That one change does more than any program, any gym, any piece of equipment. It is the difference between an exercise that makes you stronger and one that hurts you.</p>
<p>I wrote the full version here: <a href="https://www.flbesttrainer.com/blog/slow-down-form-first-after-50">Why Slowing Down Gets You Stronger After 50</a>.</p>
<p>No ask in this one either. Just the thing that works.</p>
`,
  },
  {
    step: 3,
    subject: "This is the last one",
    campaign: "winback-3",
    sendAfterDays: 10,
    approved: true,
    // No CTA button, no PS: the link is inline in the body (the
    // start-here hub). No reply ask. See the LIMIT note at the top
    // of this file: the copy does not promise the click keeps them
    // subscribed, because the engine still suppresses after this
    // send until Phase 2 click tracking exists.
    headline: "This is the last one.",
    preheader: "One last email, then I'll stop.",
    showReview: false,
    html: `
<p>Hi {first_name},</p>
<p>This is the last one. After this, I will stop emailing you.</p>
<p>If you want the ideas without the emails, they are all on the blog: <a href="https://www.flbesttrainer.com/blog/start-here">start here</a>. The guide is there too, free, whenever you want it.</p>
<p>Thanks for reading.</p>
`,
  },
];

export function winbackEmailForStep(step: number): WinbackEmail | null {
  return WINBACK_EMAILS.find((e) => e.step === step) ?? null;
}

// Timing helpers — the defs ARE the timing config (no hardcoding,
// Principle 25): the engine derives every gap from sendAfterDays
// instead of repeating the numbers as literals. Throws on an unknown
// step — a missing def is a broken sequence, and failing loud beats
// silently sending on the wrong day.
export function winbackDueInDays(step: number): number {
  const def = winbackEmailForStep(step);
  if (!def) throw new Error(`No winback def for step ${step}`);
  return def.sendAfterDays;
}

export function winbackGapDays(fromStep: number, toStep: number): number {
  return winbackDueInDays(toStep) - winbackDueInDays(fromStep);
}
