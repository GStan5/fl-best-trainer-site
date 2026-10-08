import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/shared/Layout";
import SEO from "@/components/shared/SEO";
import {
  FaCheckCircle,
  FaShieldAlt,
  FaCreditCard,
  FaArrowUp,
} from "react-icons/fa";

// Independent for Life — Self-Study $197 (Phase 2).
// Copy: PAGE_COPY.md PAGE 5, verbatim. Buy button → /api/stripe/checkout-online
// with { product: "self-study" } (guest checkout, new sibling route; refuses
// non-test keys unless ONLINE_SALES_LIVE=true).

const whatsInside = [
  "the complete 18-session manual",
  "the full movement library",
  "the three-ability tracker (Day 1 / Week 4 / Day 42)",
  "video demos added free as they're filmed and published",
];

export default function SelfStudyPage() {
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
        body: JSON.stringify({ product: "self-study" }),
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
        title="The 6-Week Program, Do-It-Yourself — $197 | Independent for Life | FL Best Trainer"
        description="The same 18 sessions. The same three tests. The only thing missing is the coach looking over your shoulder."
        keywords="6 week strength program self study over 50, diy home workout program seniors, independent for life, FL Best Trainer"
        url="/self-study"
      />

      {banner === "success" && (
        <div className="bg-emerald-900/80 border-b border-emerald-500/40 text-center px-4 py-4 pt-24">
          <p className="text-emerald-100 text-lg">
            You're in — payment received. Your Self-Study program is on its
            way to your email. Start with Session 1 whenever you're ready.
          </p>
        </div>
      )}
      {banner === "cancelled" && (
        <div className="bg-white/5 border-b border-white/10 text-center px-4 py-4 pt-24">
          <p className="text-white/80 text-lg">
            No charge was made. The program is still here whenever you're ready.
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
              The 6-Week Program, Do-It-Yourself —{" "}
              <span className="text-royal">$197</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed">
              The same 18 sessions. The same three tests. The same video
              library. The only thing missing is the coach looking over your
              shoulder.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-5">
              Who it's for
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-12">
              Self-starters who finished the Starter Plan, know the movements,
              and want the full 6-week progression without the concierge
              coaching.
            </p>

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

            {/* Price box */}
            <div className="bg-gradient-to-b from-navy to-[#0A0A0A] border border-royal/40 rounded-2xl p-8 text-center shadow-xl shadow-black/50">
              <p className="font-heading text-xl md:text-2xl font-bold text-white mb-2">
                Independent for Life — Self-Study
              </p>
              <p className="text-royal font-heading text-5xl font-bold mb-3">
                $197
              </p>
              <p className="text-white/75 text-base md:text-lg mb-6">
                $197 one time. Yours forever, including future updates.
              </p>
              <div className="flex items-start text-left bg-white/[0.04] border border-white/10 rounded-xl p-5 mb-8 max-w-xl mx-auto">
                <FaShieldAlt className="text-royal text-2xl mr-4 mt-1 flex-shrink-0" />
                <p className="text-white/85 text-base md:text-lg leading-relaxed">
                  <span className="font-semibold text-white">The guarantee:</span>{" "}
                  Complete all 18 sessions. If your Day 42 numbers don't beat
                  your Day 1 numbers, email your tracker for a full refund. The
                  numbers don't lie.
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
                {buying ? "Taking you to checkout…" : "Get the Self-Study — $197"}
              </button>
              <p className="text-white/50 text-sm mt-5">
                Secure checkout by Stripe.
              </p>
            </div>

            {/* Upgrade note */}
            <div className="flex items-start bg-white/[0.04] border border-white/10 rounded-xl p-5 mt-10 max-w-3xl mx-auto">
              <FaArrowUp className="text-royal text-2xl mr-4 mt-1 flex-shrink-0" />
              <p className="text-white/85 text-base md:text-lg leading-relaxed">
                Finish and want coaching next time? Your $197 credits toward a
                future flagship cohort.
              </p>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
