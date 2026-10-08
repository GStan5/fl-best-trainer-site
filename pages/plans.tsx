import { useState } from "react";
import Link from "next/link";
import Layout from "../components/shared/Layout";
import SEO from "@/components/shared/SEO";
import {
  FaCheckCircle,
  FaDownload,
  FaEnvelope,
  FaArrowRight,
  FaBookOpen,
  FaDumbbell,
  FaLaptop,
  FaSyncAlt,
  FaHammer,
} from "react-icons/fa";
import { NICHE_PROGRAMS } from "@/lib/nichePrograms";

// Independent for Life — program lineup (Phase 4).
// This page retires the old hand-made Basic/Premium custom plans
// (Gavin's decision, 2026-10-08). The hand-designed-plan offer is gone;
// the same expertise now sells as fixed programs that work for the 50th
// buyer like the 1st. In-person training keeps selling through
// /training, /classes, and /booking — untouched.

interface Program {
  icon: React.ReactNode;
  step: string;
  name: string;
  price: string;
  priceNote?: string;
  blurb: string;
  points: string[];
  cta: string;
  href: string;
  highlight?: boolean;
}

const PROGRAMS: Program[] = [
  {
    icon: <FaBookOpen />,
    step: "Start here — free",
    name: "Free 7-Day Guide",
    price: "$0",
    blurb:
      "A free 7-day starter program from a NASM-certified personal trainer who works with adults 50+ every day.",
    points: [
      "7 days of guided sessions — just a chair, a wall, and water bottles",
      "A Day 1 baseline test so you can measure exactly what changes",
      "10–15 minutes a day. No gym. No getting hurt.",
    ],
    cta: "Get the Free Guide",
    href: "/start",
  },
  {
    icon: <FaDumbbell />,
    step: "Step 1",
    name: "Independent for Life — 4-Week Starter Plan",
    price: "$37",
    priceNote: "one time",
    blurb:
      "Four weeks of trainer-written sessions that build the strength, balance, and bone density real life runs on.",
    points: [
      "12 sessions, 30 minutes, 3 times a week — at home",
      "Chair, wall, and water bottles are all you need",
      "Your $37 counts toward the flagship program if you continue",
    ],
    cta: "See the Starter Plan",
    href: "/starter",
  },
  {
    icon: <FaDumbbell />,
    step: "Step 2 — the full program",
    name: "Independent for Life: 6-Week Strength Foundations for Adults 50+",
    price: "$497",
    priceNote: "or 3 payments of $185",
    blurb:
      "The complete coached program: 18 sessions, a coach watching your form, and three abilities guaranteed — or your money back.",
    points: [
      "5 unassisted chair stands, a 20-lb carry, a 30-second single-leg stand — tested Day 1 vs Day 42",
      "Form checks and personal coaching every week",
      "Founding cohort — waitlist open",
    ],
    cta: "Join the Waitlist",
    href: "/flagship",
    highlight: true,
  },
  {
    icon: <FaLaptop />,
    step: "Step 2 — on your own",
    name: "Independent for Life — Self-Study",
    price: "$197",
    priceNote: "one time",
    blurb:
      "The same 18 sessions, the same three tests, the same video library. The only thing missing is the coach looking over your shoulder.",
    points: [
      "The full 6-week progression, self-paced",
      "Every movement demonstrated in the video library",
      "For self-starters who finished the Starter Plan",
    ],
    cta: "See Self-Study",
    href: "/self-study",
  },
  {
    icon: <FaSyncAlt />,
    step: "Keep going",
    name: "Independent for Life Monthly",
    price: "$97–$197",
    priceNote: "per month",
    blurb:
      "The 6 weeks got you strong. Monthly keeps you strong. New training every month, a coach in your corner, and a community doing it with you.",
    points: [
      "A new training block every month",
      "Quarterly retesting — your numbers, tracked over time",
      "Three tiers, from community support to 1:1 text access",
    ],
    cta: "See Monthly",
    href: "/monthly",
  },
];

type FormState = "idle" | "submitting" | "success" | "error";

export default function PlansPage() {
  const [firstName, setFirstName] = useState("");
  const [email, setEmail] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/guide-signup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ firstName, email, source: "plans" }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(
          data.error || "Something went wrong. Please check your details and try again."
        );
        setState("error");
        return;
      }
      setState("success");
    } catch {
      setErrorMsg("Something went wrong. Please try again in a moment.");
      setState("error");
    }
  }

  return (
    <Layout>
      <SEO
        title="Independent for Life Programs | FL Best Trainer"
        description="Fixed programs for adults 50+ — a free 7-day guide, the $37 4-Week Starter, the $497 Independent for Life flagship, self-study, and monthly coaching. No gym. No getting hurt."
        keywords="strength program over 50, independent for life, senior fitness program, balance training at home, FL Best Trainer"
        url="/plans"
      />

      {/* Hero */}
      <section className="pt-28 pb-14 md:pt-36 md:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0A0A0A] z-0"></div>
        <div className="absolute inset-0 opacity-20 bg-grid-pattern z-0"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Independent for Life{" "}
              <span className="text-royal">Programs</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed">
              One ladder, built for adults 50+: start free, prove it in four
              weeks, then go all the way. Every program is a fixed,
              trainer-written plan — no gym, minimal equipment, and a Day 1
              test so you can see exactly what changed.
            </p>
          </div>
        </div>
      </section>

      {/* Lineup */}
      <section className="pb-16 md:pb-20 bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-8">
            {PROGRAMS.map((p) => (
              <div
                key={p.name}
                className={`rounded-2xl border p-6 sm:p-8 shadow-xl shadow-black/40 ${
                  p.highlight
                    ? "bg-royal/10 border-royal/40"
                    : "bg-white/[0.04] border-white/10"
                }`}
              >
                <p className="text-royal text-sm font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                  <span className="text-base">{p.icon}</span> {p.step}
                </p>
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-3">
                  {p.name}
                </h2>
                <p className="mb-4">
                  <span
                    className={`font-heading font-bold ${
                      p.highlight
                        ? "text-4xl text-royal"
                        : "text-3xl text-white"
                    }`}
                  >
                    {p.price}
                  </span>
                  {p.priceNote && (
                    <span className="text-white/60 text-base ml-2">
                      {p.priceNote}
                    </span>
                  )}
                </p>
                <p className="text-white/80 text-lg leading-relaxed mb-5">
                  {p.blurb}
                </p>
                <ul className="space-y-3 mb-7">
                  {p.points.map((pt) => (
                    <li
                      key={pt}
                      className="flex items-start text-white/90 text-base md:text-lg"
                    >
                      <FaCheckCircle className="text-royal mr-3 mt-1 flex-shrink-0 text-xl" />
                      <span>{pt}</span>
                    </li>
                  ))}
                </ul>
                <Link
                  href={p.href}
                  className="inline-flex items-center justify-center bg-royal hover:bg-royal-dark text-white font-heading font-bold text-lg py-4 px-8 rounded-xl transition min-h-[56px] w-full sm:w-auto"
                >
                  {p.cta}
                  <FaArrowRight className="ml-3" />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* In production — focused niche plans (Phase 5 addition).
          Each card sells the founding list, never the plan: no prices,
          no dates. Per-plan signup counts in the admin hub decide which
          one Gavin writes first. */}
      <section className="pb-16 md:pb-20 bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4 text-center">
              In production — <span className="text-royal">focused plans</span>
            </h2>
            <p className="text-white/80 text-lg text-center leading-relaxed mb-10">
              Focused plans for specific needs, built one at a time and
              released to their founding lists first. Join the list for the
              one that sounds like you — founding members get the free guide
              today and founding pricing when their plan opens.
            </p>
            <div className="grid gap-6 sm:grid-cols-2">
              {NICHE_PROGRAMS.map((p) => (
                <div
                  key={p.slug}
                  className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 flex flex-col"
                >
                  <p className="text-royal text-xs font-semibold uppercase tracking-wide mb-2 flex items-center gap-2">
                    <FaHammer /> In production
                  </p>
                  <h3 className="font-heading text-xl font-bold text-white mb-2">
                    {p.shortName}
                  </h3>
                  <p className="text-white/75 text-base leading-relaxed mb-5 flex-1">
                    {p.headline}
                  </p>
                  <Link
                    href={`/plans/${p.slug}`}
                    className="inline-flex items-center font-heading font-semibold text-royal hover:text-royal-light text-base transition"
                  >
                    Join the founding list
                    <FaArrowRight className="ml-2" />
                  </Link>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Guide signup */}
      <section className="py-16 md:py-20 bg-black">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-4 text-center">
              Not sure where to start?{" "}
              <span className="text-royal">Start free.</span>
            </h2>
            <p className="text-white/80 text-lg text-center leading-relaxed mb-10">
              The free 7-day guide is the front door to everything above:
              10–15 minutes a day, just a chair, a wall, and water bottles —
              plus a Day 1 baseline test so you can measure exactly what
              changes.
            </p>

            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/40">
              {state === "success" ? (
                <div className="text-center">
                  <FaEnvelope className="text-royal text-4xl mx-auto mb-4" />
                  <h3 className="font-heading text-2xl font-bold text-white mb-3">
                    Your guide is on its way
                  </h3>
                  <p className="text-white/80 text-lg mb-6 leading-relaxed">
                    Check your email — we've sent the 7-Day Starter Guide to{" "}
                    <span className="text-white font-semibold">{email}</span>.
                    (If it doesn't show up in a few minutes, look in your spam
                    folder, just in case.)
                  </p>
                  <p className="text-white/70 text-base mb-6">
                    Don't want to wait? Download it right now:
                  </p>
                  <a
                    href="/downloads/independent-for-life-guide.pdf"
                    className="inline-flex items-center justify-center bg-royal hover:bg-royal-dark text-white font-heading font-bold text-lg py-4 px-8 rounded-xl transition min-h-[56px]"
                  >
                    <FaDownload className="mr-3" />
                    Download My Free Guide
                  </a>
                </div>
              ) : (
                <>
                  <h3 className="font-heading text-2xl font-bold text-white mb-6 text-center">
                    Send me the free 7-day guide
                  </h3>
                  <form onSubmit={handleSubmit} noValidate>
                    <label
                      htmlFor="plansFirstName"
                      className="block text-white/80 text-base font-medium mb-2"
                    >
                      First name
                    </label>
                    <input
                      id="plansFirstName"
                      name="firstName"
                      type="text"
                      autoComplete="given-name"
                      required
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      className="w-full mb-5 rounded-xl bg-black/40 border border-white/20 px-4 py-4 text-lg text-white placeholder-white/40 focus:outline-none focus:border-royal min-h-[56px]"
                      placeholder="Your first name"
                    />
                    <label
                      htmlFor="plansEmail"
                      className="block text-white/80 text-base font-medium mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="plansEmail"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="w-full mb-6 rounded-xl bg-black/40 border border-white/20 px-4 py-4 text-lg text-white placeholder-white/40 focus:outline-none focus:border-royal min-h-[56px]"
                      placeholder="you@example.com"
                    />
                    {state === "error" && (
                      <p className="text-red-400 text-base mb-4" role="alert">
                        {errorMsg}
                      </p>
                    )}
                    <button
                      type="submit"
                      disabled={state === "submitting"}
                      className="w-full bg-royal hover:bg-royal-dark disabled:opacity-60 text-white font-heading font-bold text-lg py-4 px-8 rounded-xl transition min-h-[56px]"
                    >
                      {state === "submitting" ? "Sending…" : "Send My Free Guide"}
                    </button>
                  </form>
                </>
              )}
            </div>

            <p className="text-white/50 text-sm text-center mt-8">
              Free forever. No spam, no pressure. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
