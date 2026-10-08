import { useState } from "react";
import Layout from "../components/shared/Layout";
import SEO from "@/components/shared/SEO";
import {
  FaCheckCircle,
  FaEnvelope,
  FaShieldAlt,
  FaArrowRight,
} from "react-icons/fa";

// Independent for Life — flagship 6-week program (Phase 2, WAITLIST MODE).
// Copy: PAGE_COPY.md PAGE 4, verbatim. Deliberate adaptations while the
// founding cohort is not yet enrolling: the Enroll buttons are replaced by
// a waitlist form (posts to /api/guide-signup with source='flagship';
// members also receive the free 7-day guide), and there is no cohort date
// or enrollment language anywhere on the page. $497 / 3×$185 appear only
// as offer descriptions, exactly as the copy frames them.

const abilities = [
  {
    title: "5 clean chair stands",
    detail: "no hands, no pushing off your knees",
  },
  {
    title: "Carry 20 lbs across the room",
    detail: "steady walk, tall posture",
  },
  {
    title: "A 30-second single-leg stand",
    detail: "on each leg, unassisted",
  },
];

const coaching = [
  "Weekly form-check videos: film one set, Gavin corrects your form personally",
  "1:1 text access: questions answered between sessions, not just during them",
  "Cohort accountability: 12 people starting together, finishing together",
  "Week 4 progress review + Day 42 guarantee test",
];

const faqs = [
  {
    q: "What if I've never lifted weights?",
    a: "The program starts where the Starter Plan ended and loads you gradually. Load is earned — never assigned.",
  },
  {
    q: "What equipment?",
    a: "Chair, wall/counter, bottom stair with rail, dowel or broomstick, light + heavier dumbbells by Week 3.",
  },
  {
    q: "What if I have a bad knee/shoulder?",
    a: 'Every exercise has regressions and "skip or modify" guidance — plus a coach reviewing your form weekly.',
  },
  {
    q: "How much time?",
    a: "30 minutes, 3× a week, 6 weeks. 18 sessions total.",
  },
];

type FormState = "idle" | "submitting" | "success" | "error";

export default function FlagshipPage() {
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
        body: JSON.stringify({ firstName, email, source: "flagship" }),
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
        title="Independent for Life: The 6-Week Strength Foundations for Adults 50+ | FL Best Trainer"
        description="18 sessions. A coach watching your form. Three abilities guaranteed — or your money back. Join the founding waitlist."
        keywords="strength program over 50, coached home workouts seniors, chair stands balance strength, independent for life, FL Best Trainer"
        url="/flagship"
      />

      {/* Hero */}
      <section className="pt-28 pb-14 md:pt-36 md:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0A0A0A] z-0"></div>
        <div className="absolute inset-0 opacity-20 bg-grid-pattern z-0"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Independent for Life: The 6-Week Strength Foundations for{" "}
              <span className="text-royal">Adults 50+</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed">
              18 sessions. A coach watching your form. Three abilities
              guaranteed — or your money back.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            {/* The three abilities */}
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-6">
              The three abilities
            </h2>
            <div className="space-y-4 mb-8">
              {abilities.map((a, i) => (
                <div
                  key={a.title}
                  className="flex items-start bg-white/[0.04] border border-white/10 rounded-2xl p-6"
                >
                  <span className="font-heading text-royal text-2xl font-bold mr-4 flex-shrink-0">
                    {i + 1}
                  </span>
                  <p className="text-white/90 text-lg leading-relaxed">
                    <span className="font-semibold text-white">{a.title}</span>{" "}
                    — {a.detail}
                  </p>
                </div>
              ))}
            </div>
            <div className="flex items-start bg-white/[0.04] border border-white/10 rounded-xl p-5 mb-12 max-w-3xl">
              <FaShieldAlt className="text-royal text-2xl mr-4 mt-1 flex-shrink-0" />
              <p className="text-white/85 text-base md:text-lg leading-relaxed">
                Test on Day 1. Test on Day 42. If you complete all 18 sessions,
                submit your weekly form checks, and don't hit all three — full
                refund.
              </p>
            </div>

            {/* How coaching works */}
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-5">
              How coaching works
            </h2>
            <ul className="space-y-4 mb-12">
              {coaching.map((item) => (
                <li
                  key={item}
                  className="flex items-start text-white/90 text-base md:text-lg"
                >
                  <FaCheckCircle className="text-royal mr-3 mt-1 flex-shrink-0 text-xl" />
                  <span>{item}</span>
                </li>
              ))}
            </ul>

            {/* The 6-week arc */}
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-5">
              The 6-week arc
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-12">
              Weeks 1–2 baseline and build · Weeks 3–4 progressive loading ·
              Weeks 5–6 peak and taper · Day 42: the test.
            </p>

            {/* Coach proof — labeled honestly as in-person clients */}
            <div className="text-center mb-14">
              <p className="text-royal italic text-lg mb-3">
                Gavin's in-person clients, Longboat Key, FL:
              </p>
              <blockquote className="text-white/85 text-xl md:text-2xl leading-relaxed">
                "improvements in strength, balance, flexibility, and toning."
              </blockquote>
              <p className="text-white/60 text-base mt-3">
                — Jackie Berling, 65, Longboat Key
              </p>
            </div>

            {/* FAQ */}
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

            {/* Waitlist box (replaces the Enroll price box while enrolling is closed) */}
            <div className="bg-gradient-to-b from-navy to-[#0A0A0A] border border-royal/40 rounded-2xl p-8 shadow-xl shadow-black/50">
              <p className="text-white/60 text-sm text-center mb-2">
                Gavin Stanifer, NASM Certified Personal Trainer
              </p>
              <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4 text-center">
                Join the founding waitlist
              </h2>
              <p className="text-white/80 text-base md:text-lg leading-relaxed text-center mb-4 max-w-2xl mx-auto">
                The first coached cohort is being formed now. When it opens,
                the program is <span className="text-white font-semibold">$497 one time</span>,
                or <span className="text-white font-semibold">3 payments of $185</span>.
                Waitlist members hear first — and start with the free 7-day
                guide while they wait.
              </p>
              <p className="text-white/70 text-base text-center mb-8">
                Join the list and we'll send your free 7-day guide right away.
              </p>

              {state === "success" ? (
                <div className="text-center">
                  <FaEnvelope className="text-royal text-4xl mx-auto mb-4" />
                  <h3 className="font-heading text-2xl font-bold text-white mb-3">
                    You're on the list
                  </h3>
                  <p className="text-white/80 text-lg leading-relaxed max-w-xl mx-auto">
                    Welcome aboard, {firstName}. Your free 7-day guide is on
                    its way to{" "}
                    <span className="text-white font-semibold">{email}</span>,
                    and you're on the founding waitlist — watch your inbox for
                    news about the first cohort.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleSubmit} noValidate className="max-w-xl mx-auto">
                  <label
                    htmlFor="firstName"
                    className="block text-white/80 text-base font-medium mb-2"
                  >
                    First name
                  </label>
                  <input
                    id="firstName"
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
                    htmlFor="email"
                    className="block text-white/80 text-base font-medium mb-2"
                  >
                    Email
                  </label>
                  <input
                    id="email"
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
                    className="w-full inline-flex items-center justify-center bg-royal hover:bg-royal-dark disabled:opacity-60 text-white font-heading font-bold text-lg py-4 px-8 rounded-xl transition min-h-[56px]"
                  >
                    {state === "submitting" ? "Joining…" : "Join the Founding Waitlist"}
                    <FaArrowRight className="ml-3" />
                  </button>
                </form>
              )}
            </div>

            {/* Decline path */}
            <p className="text-center text-white/70 text-base md:text-lg mt-10">
              Not ready for coaching?{" "}
              <a href="/self-study" className="underline text-royal-light">
                Get the same 6-week program, do-it-yourself, for $197 →
              </a>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
