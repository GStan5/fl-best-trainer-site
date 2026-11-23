// Winback sequence — the re-engage step of the sunset policy
// (research B9, design doc B6). Three emails, transcribed from the
// approved draft file in the goal workspace (winback-sequence.md).
//
// APPROVED by Gavin 2026-11-23 ~14:32 ("windback all good excellent
// job"). These defs are approved copy — no separate gate here. The
// trigger is 90 days of silence (no opens or clicks in email_events),
// found by the sequence cron's sunset check; the subscriber is
// enrolled in this sequence instead of being suppressed in place, and
// suppression happens only after email 3 gets no reply.
//
// Hormozi's shape: value first, no pitch until the last email, and
// the last email asks them to choose — reply Y to stay, or do nothing
// and we stop. None of the three is a pitch, and none shows the
// footer review button (showReview false — a review ask in a
// re-engage email would be noise; email 3's PS points at the blog
// instead).
//
// Own send state in the `winback_sequences` table (lib/newsletter.ts),
// never `sequence_step`. Suppression is a state, never a delete;
// resubscribing restarts everything at step 1.
//
// LIMIT, stated plainly: "no reply" is judged by the absence of a
// reply we can see. Replies are not tracked in the database yet
// (no email_events / reply tracking until Phase 2) — so after email 3
// the cron suppresses on the send, and a reply that comes in is
// caught by the manual inbox process (research B1: Grim checks
// replies) and re-adds the person. The trigger itself is also dormant
// until the email_events table exists: without it the sunset check
// throws and is skipped, exactly as it does today.

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
    subject: "It's been a while",
    campaign: "winback-1",
    sendAfterDays: 0,
    approved: true,
    preheader: "No pitch in this one — just checking in.",
    showReview: false,
    html: `
<p>Hi {first_name},</p>
<p>It has been a while since you heard from me. No pitch in this one — I just wanted to check in.</p>
<p>Are you still lifting? Still moving? If you stopped, that is fine. Most people do. The guide is still yours, and Day 1 is still there whenever you want it.</p>
<p>Hit reply and tell me where you are with it. I read every reply.</p>
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
<p>I wrote the full version here: <a href="https://flbesttrainer.com/blog/slow-down-form-first-after-50">Why Slowing Down Gets You Stronger After 50</a>.</p>
<p>No ask in this one either. Just the thing that works.</p>
`,
  },
  {
    step: 3,
    subject: "Should I stop sending these?",
    campaign: "winback-3",
    sendAfterDays: 10,
    approved: true,
    ps: "If you want to stay but email is not the way, the blog is at flbesttrainer.com/blog. Same ideas, no inbox needed.",
    preheader: "Reply Y to stay, or do nothing and I'll stop.",
    showReview: false,
    html: `
<p>Hi {first_name},</p>
<p>I have sent you a couple of emails and I have not heard back. That is fine — inboxes are full, and life gets in the way.</p>
<p>But I do not want to keep sending emails nobody reads. So here is the deal.</p>
<p>If you want to keep getting one useful idea a week, hit reply and type Y. That is all. I will keep you on the list.</p>
<p>If I do not hear from you, I will stop sending. No hard feelings, and you can come back any time — the guide is still yours.</p>
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
