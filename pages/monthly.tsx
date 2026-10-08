import { useEffect, useState } from "react";
import { useRouter } from "next/router";
import Layout from "../components/shared/Layout";
import SEO from "@/components/shared/SEO";
import { FaCheckCircle, FaCreditCard, FaStar } from "react-icons/fa";

// Independent for Life — Monthly continuity tiers (Phase 3).
// Copy: PAGE_COPY.md PAGE 7, verbatim (the internal "may launch at Week 5"
// note is deliberately excluded — it is not customer copy). Subscribe
// buttons POST { product: "monthly-97" | "monthly-147" | "monthly-197" }
// to /api/stripe/checkout-online (subscription mode; refuses non-test
// keys unless ONLINE_SALES_LIVE=true).

type TierKey = "monthly-97" | "monthly-147" | "monthly-197";

interface Tier {
  key: TierKey;
  name: string;
  price: number;
  popular?: boolean;
  features: string[];
  note?: string;
  button: string;
}

const TIERS: Tier[] = [
  {
    key: "monthly-97",
    name: "Monthly",
    price: 97,
    features: [
      "A new training block every month (Build and Maintain tracks)",
      "Weekly group Q&A with Gavin",
      "Quarterly retesting — your numbers, tracked over time",
      "Member community",
      "The Steady Letter — monthly coaching newsletter",
      "Access to the shared form-correction teaching library",
    ],
    button: "Subscribe — $97/mo",
  },
  {
    key: "monthly-147",
    name: "Monthly Plus",
    price: 147,
    popular: true,
    features: ["Everything in Monthly, plus 1:1 text access to Gavin"],
    button: "Subscribe — $147/mo",
  },
  {
    key: "monthly-197",
    name: "Monthly Best",
    price: 197,
    features: [
      "Everything in Plus, plus a personal form-video review every month",
      "Only Best members may submit form videos; all members learn from the teaching breakdowns in The Steady Letter",
    ],
    note: "Submitting a video authorizes its use as teaching content for members (first-name-only or anonymous — your choice).",
    button: "Subscribe — $197/mo",
  },
];

export default function MonthlyPage() {
  const router = useRouter();
  const [banner, setBanner] = useState<"success" | "cancelled" | null>(null);
  const [buying, setBuying] = useState<TierKey | null>(null);
  const [buyError, setBuyError] = useState("");

  useEffect(() => {
    if (!router.isReady) return;
    if (router.query.checkout === "success") setBanner("success");
    else if (router.query.checkout === "cancelled") setBanner("cancelled");
  }, [router.isReady, router.query.checkout]);

  async function handleSubscribe(key: TierKey) {
    setBuying(key);
    setBuyError("");
    try {
      const res = await fetch("/api/stripe/checkout-online", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ product: key }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok || !data.url) {
        setBuyError(
          data.error === "online checkout not enabled"
            ? "Online checkout isn't open yet. Start with the free 7-day guide and we'll let you know the moment this opens."
            : "Something went wrong starting checkout. Please try again in a moment."
        );
        setBuying(null);
        return;
      }
      window.location.href = data.url;
    } catch {
      setBuyError("Something went wrong starting checkout. Please try again in a moment.");
      setBuying(null);
    }
  }

  return (
    <Layout>
      <SEO
        title="Independent for Life Monthly — Keep Building | FL Best Trainer"
        description="The 6 weeks got you strong. Monthly keeps you strong. New training every month, a coach in your corner, and a community doing it with you."
        keywords="monthly strength program over 50, ongoing coaching seniors, independent for life monthly, FL Best Trainer"
        url="/monthly"
      />

      {banner === "success" && (
        <div className="bg-emerald-900/80 border-b border-emerald-500/40 text-center px-4 py-4 pt-24">
          <p className="text-emerald-100 text-lg">
            You're in — subscription started. Your first training block and
            community invite are on the way to your email.
          </p>
        </div>
      )}
      {banner === "cancelled" && (
        <div className="bg-white/5 border-b border-white/10 text-center px-4 py-4 pt-24">
          <p className="text-white/80 text-lg">
            No charge was made. Monthly is still here whenever you're ready.
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
              Independent for Life Monthly —{" "}
              <span className="text-royal">Keep Building</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed">
              The 6 weeks got you strong. Monthly keeps you strong. New
              training every month, a coach in your corner, and a community
              doing it with you.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-5xl mx-auto">
            {buyError && (
              <p className="text-amber-300 text-base mb-8 text-center" role="alert">
                {buyError}{" "}
                <a href="/start" className="underline text-royal-light">
                  Get the free guide
                </a>
              </p>
            )}

            <div className="grid gap-6 lg:grid-cols-3 items-stretch">
              {TIERS.map((tier) => (
                <div
                  key={tier.key}
                  className={`relative flex flex-col rounded-2xl border p-8 shadow-xl shadow-black/50 bg-gradient-to-b from-navy to-[#0A0A0A] ${
                    tier.popular ? "border-royal/60" : "border-white/10"
                  }`}
                >
                  {tier.popular && (
                    <p className="absolute -top-4 left-1/2 -translate-x-1/2 inline-flex items-center bg-royal text-white text-sm font-heading font-bold px-4 py-1.5 rounded-full whitespace-nowrap">
                      <FaStar className="mr-2" /> Most popular
                    </p>
                  )}
                  <h2 className="font-heading text-2xl font-bold text-white mb-2 text-center">
                    {tier.name}
                  </h2>
                  <p className="text-center mb-8">
                    <span className="text-royal font-heading text-5xl font-bold">
                      ${tier.price}
                    </span>
                    <span className="text-white/60 text-lg">/mo</span>
                  </p>
                  <ul className="space-y-4 mb-8 flex-1">
                    {tier.features.map((feature) => (
                      <li
                        key={feature}
                        className="flex items-start text-white/90 text-base"
                      >
                        <FaCheckCircle className="text-royal mr-3 mt-1 flex-shrink-0 text-lg" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  {tier.note && (
                    <p className="text-white/60 text-sm leading-relaxed mb-6">
                      {tier.note}
                    </p>
                  )}
                  <button
                    onClick={() => handleSubscribe(tier.key)}
                    disabled={buying !== null}
                    className="w-full inline-flex items-center justify-center bg-royal hover:bg-royal-dark disabled:opacity-60 text-white font-heading font-bold text-lg py-4 px-6 rounded-xl transition min-h-[56px] mt-auto"
                  >
                    <FaCreditCard className="mr-3" />
                    {buying === tier.key ? "Taking you to checkout…" : tier.button}
                  </button>
                </div>
              ))}
            </div>

            <p className="text-white/60 text-base text-center mt-10">
              Annual billing (2 months free) will be offered when checkout
              opens. Secure checkout by Stripe — cancel anytime.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
