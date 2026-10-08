import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/shared/Layout";
import SEO from "@/components/shared/SEO";
import {
  FaCheckCircle,
  FaTimesCircle,
  FaShieldAlt,
  FaCreditCard,
} from "react-icons/fa";

// Independent for Life — $37 4-Week Starter Plan sales page (Phase 1).
// Copy: PAGE_COPY.md PAGE 2, verbatim. Buy button → /api/stripe/checkout-online
// (guest checkout, new sibling route; refuses non-test keys unless
// ONLINE_SALES_LIVE=true). Full purchase delivery arrives in Phase 2.

const howItWorks = [
  "3 sessions a week, 30 minutes each, on your schedule",
  "A sturdy chair, a wall, water bottles — that's the equipment list",
  "Every exercise has a setup, one key cue, and an easier + harder version",
  "Safety rules built in: pain is a stop sign, load is earned, balance work is always protected",
];

const whatsInside = [
  "The full 12-session program (Weeks 1–4, progressive)",
  "The complete movement library — 14 exercises, every one with setup, key cue, common mistake, and easier/harder versions",
  "Exercise video demos are being filmed now — every buyer gets them free as each one publishes",
  "Your one-page tracker — print it, stick it on the fridge",
  "The Week 4 retest — prove to yourself it worked",
];

const faqs = [
  {
    q: "I've never exercised. Can I do this?",
    a: "Yes — Week 1 starts with chair-assisted versions of everything. The program meets you where you are.",
  },
  {
    q: "What if something hurts?",
    a: 'Pain is a stop sign. Every exercise has a "skip or modify if" note. Muscle effort is fine; joint pain is not.',
  },
  {
    q: "What equipment do I need?",
    a: "A sturdy chair, a wall or counter, water bottles. That's it for the full 4 weeks.",
  },
  {
    q: "How is this different from the free guide?",
    a: "The guide is 7 days to prove you can do this. This is the full 4-week system that actually changes your strength.",
  },
];

export default function StarterPage() {
  const router = useRouter();
  const [banner, setBanner] = useState<"success" | "cancelled" | null>(null);
  const [buying, setBuying] = useState(false);
  const [buyError, setBuyError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.checkout === "success") setBanner("success");
    else if (router.query.checkout === "cancelled") setBanner("cancelled");
  }, [router.isReady, router.query.checkout]);

  async function handleBuy() {
    setBuying(true);
    setBuyError("");
    try {
      const res = await fetch("/api/stripe/checkout-online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setBuyError(
          data.error === "online checkout not enabled"
            ? "Online checkout isn't open yet. Start with the free 7-day guide and we'll let you know the moment this opens."
            : "Something went wrong starting checkout. Please try again in a moment."
        );
        setBuying(false);
        return;
      }
      window.location.href = data.url;
    } catch {
      setBuyError("Something went wrong starting checkout. Please try again in a moment.");
      setBuying(false);
    }
  }

  return (
    <Layout>
      <SEO
        title="The 4-Week Starter Plan — $37 | Independent for Life | FL Best Trainer"
        description="12 sessions. 30 minutes, 3 times a week. At home. A complete, trainer-written program that takes you from 'I should do something' to measurably stronger in 4 weeks."
        keywords="4 week strength program over 50, home workouts for seniors, starter fitness plan, independent for life, FL Best Trainer"
        url="/starter"
      />

      {banner === "success" && (
        <div className="bg-emerald-900/80 border-b border-emerald-500/40 text-center px-4 py-4 pt-24">
          <p className="text-emerald-100 text-lg">
            You're in — payment received. Your 4-Week Starter Plan is on its
            way to your email. Start with Session 1 whenever you're ready.
          </p>
        </div>
      )}
      {banner === "cancelled" && (
        <div className="bg-white/5 border-b border-white/10 text-center px-4 py-4 pt-24">
          <p className="text-white/80 text-lg">
            No charge was made. Your spot is still here whenever you're ready.
          </p>
        </div>
      )}

      {/* Hero */}
      <section className="pt-28 pb-14 md:pt-36 md:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0A0A0A] z-0"></div>
        <div className="absolute inset-0 opacity-20 bg-grid-pattern z-0"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              The 4-Week Starter Plan: Build the Strength That Keeps You{" "}
              <span className="text-royal">Independent</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed">
              12 sessions. 30 minutes, 3 times a week. At home. A complete,
              trainer-written program that takes you from "I should do
              something" to measurably stronger in 4 weeks.
            </p>
          </div>
        </div>
      </section>

      {/* Problem + promise */}
      <section className="py-12 bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-5">
              The problem
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-12">
              After 50, independence isn't lost all at once. It's lost one chair
              you can't get out of, one bag of groceries you can't carry, one
              stumble you can't catch. Strength is the difference — and it's
              trainable at any age.
            </p>

            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-5">
              The promise
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-12">
              In 4 weeks you will: stand from a chair more easily, carry more
              with better posture, and trust your balance again. You'll test
              yourself on Day 1 and Day 28 — your numbers are the proof.
            </p>

            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-5">
              How it works
            </h2>
            <ul className="space-y-4 mb-12">
              {howItWorks.map((item) => (
                <li
                  key={item}
                  className="flex items-start text-white/90 text-base md:text-lg"
                >
                  <FaCheckCircle className="text-royal mr-3 mt-1 flex-shrink-0 text-xl" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-5">
              What's inside
            </h2>
            <ul className="space-y-4 mb-12">
              {whatsInside.map((item) => (
                <li
                  key={item}
                  className="flex items-start text-white/90 text-base md:text-lg"
                >
                  <FaCheckCircle className="text-royal mr-3 mt-1 flex-shrink-0 text-xl" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12">
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                <h3 className="font-heading text-xl font-bold text-white mb-3">
                  Who it's for
                </h3>
                <p className="text-white/80 text-lg leading-relaxed">
                  Adults 50+ who want to get stronger safely at home, with or
                  without prior exercise experience.
                </p>
              </div>
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6">
                <h3 className="font-heading text-xl font-bold text-white mb-3">
                  Who it's not for
                </h3>
                <p className="text-white/80 text-lg leading-relaxed">
                  Anyone with an unmanaged heart condition, uncontrolled blood
                  pressure, or recent joint replacement without clearance — get
                  your doctor's okay first (there's a checklist in the free
                  guide).
                </p>
              </div>
            </div>

            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-6">
              Questions, answered straight
            </h2>
            <div className="space-y-6 mb-14">
              {faqs.map((f) => (
                <div key={f.q}>
                  <h3 className="font-heading text-lg md:text-xl font-semibold text-white mb-2">
                    {f.q}
                  </h3>
                  <p className="text-white/75 text-base md:text-lg leading-relaxed">
                    {f.a}
                  </p>
                </div>
              ))}
            </div>

            {/* Price box */}
            <div className="bg-gradient-to-b from-navy to-[#0A0A0A] border border-royal/40 rounded-2xl p-8 text-center shadow-xl shadow-black/50">
              <p className="font-heading text-xl md:text-2xl font-bold text-white mb-2">
                Independent for Life — 4-Week Starter Plan
              </p>
              <p className="text-royal font-heading text-5xl font-bold mb-3">
                $37
              </p>
              <p className="text-white/75 text-base md:text-lg mb-6">
                $37 one time. Yours forever, including future updates.
              </p>
              <div className="flex items-start text-left bg-white/[0.04] border border-white/10 rounded-xl p-5 mb-8 max-w-xl mx-auto">
                <FaShieldAlt className="text-royal text-2xl mr-4 mt-1 flex-shrink-0" />
                <p className="text-white/85 text-base md:text-lg leading-relaxed">
                  <span className="font-semibold text-white">The guarantee:</span>{" "}
                  Finish all 12 sessions and retest on Day 28. If your numbers
                  didn't improve, email us for a full $37 refund.
                </p>
              </div>
              {buyError && (
                <p className="text-amber-300 text-base mb-4" role="alert">
                  {buyError}{" "}
                  <a href="/start" className="underline text-royal-light">
                    Get the free guide
                  </a>
                </p>
              )}
              <button
                onClick={handleBuy}
                disabled={buying}
                className="inline-flex items-center justify-center bg-royal hover:bg-royal-dark disabled:opacity-60 text-white font-heading font-bold text-lg py-4 px-10 rounded-xl transition min-h-[56px]"
              >
                <FaCreditCard className="mr-3" />
                {buying ? "Taking you to checkout…" : "Start My 4 Weeks — $37"}
              </button>
              <p className="text-white/50 text-sm mt-5">
                Secure checkout by Stripe. Not for you? The{" "}
                <a href="/start" className="underline text-royal-light">
                  free 7-day guide
                </a>{" "}
                is a good place to start.
              </p>
            </div>

            <div className="text-center mt-10">
              <p className="text-white/60 text-base inline-flex items-center">
                <FaTimesCircle className="mr-2 text-white/40" />
                No subscription. No upsells at checkout. Just the program.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
