import { useState } from "react";
import Link from "next/link";
import type { GetStaticPaths, GetStaticProps } from "next";
import Layout from "../../components/shared/Layout";
import SEO from "@/components/shared/SEO";
import {
  FaCheckCircle,
  FaDownload,
  FaEnvelope,
  FaArrowRight,
  FaHammer,
} from "react-icons/fa";
import { NICHE_PROGRAMS, type NicheProgram } from "../../lib/nichePrograms";

// Independent for Life — niche focused plan pages (Phase 5 addition,
// Gavin 2026-10-08). Each plan is IN PRODUCTION, not for sale: the page
// sells the founding list, never the plan — no price, no guarantee
// claims. Founding-list signups join through /api/guide-signup with the
// plan's own source (niche-<slug>) and receive the free 7-day guide
// today, so demand is measured per plan before Gavin writes a single
// session. Copy: lib/nichePrograms.ts (claims-safe, verbatim).

interface Props {
  program: NicheProgram;
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: NICHE_PROGRAMS.map((p) => ({ params: { slug: p.slug } })),
    fallback: false,
  };
};

export const getStaticProps: GetStaticProps<Props> = async ({ params }) => {
  const program = NICHE_PROGRAMS.find((p) => p.slug === params?.slug);
  if (!program) return { notFound: true };
  return { props: { program } };
};

type FormState = "idle" | "submitting" | "success" | "error";

export default function NicheProgramPage({ program }: Props) {
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
        body: JSON.stringify({ firstName, email, source: program.source }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok) {
        setErrorMsg(
          data.error ||
            "Something went wrong. Please check your details and try again."
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
        title={`${program.name} | FL Best Trainer`}
        description={program.subhead}
        keywords={`${program.shortName}, strength training over 50, independent for life, FL Best Trainer`}
        url={`/plans/${program.slug}`}
      />

      {/* Hero */}
      <section className="pt-28 pb-14 md:pt-36 md:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0A0A0A] z-0"></div>
        <div className="absolute inset-0 opacity-20 bg-grid-pattern z-0"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <p className="text-royal text-sm font-semibold uppercase tracking-wide mb-4">
              Independent for Life — Focused Plan
            </p>
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              {program.headline}
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed">
              {program.subhead}
            </p>
          </div>
        </div>
      </section>

      {/* Who it's for + what you'll build */}
      <section className="pb-14 md:pb-16 bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
              Who it's for
            </h2>
            <p className="text-white/80 text-lg leading-relaxed mb-10">
              {program.whoFor}
            </p>

            <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-5">
              What you'll build
            </h2>
            <ul className="space-y-4 mb-4">
              {program.outcomes.map((o) => (
                <li
                  key={o}
                  className="flex items-start text-white/90 text-base md:text-lg"
                >
                  <FaCheckCircle className="text-royal mr-3 mt-1 flex-shrink-0 text-xl" />
                  <span>{o}</span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      {/* In production — founding list */}
      <section className="pb-16 md:pb-20 bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-2xl mx-auto">
            <div className="bg-royal/10 border border-royal/40 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/40">
              <p className="text-royal text-sm font-semibold uppercase tracking-wide mb-3 flex items-center gap-2">
                <FaHammer /> In production
              </p>
              <p className="text-white/85 text-lg leading-relaxed mb-8">
                This plan is in production now. Join the founding list:
                you'll get the free 7-Day Independent for Life Guide today,
                first access when {program.shortName} opens, and founding
                pricing before it goes public.
              </p>

              {state === "success" ? (
                <div className="text-center">
                  <FaEnvelope className="text-royal text-4xl mx-auto mb-4" />
                  <h3 className="font-heading text-2xl font-bold text-white mb-3">
                    You're on the founding list
                  </h3>
                  <p className="text-white/80 text-lg mb-6 leading-relaxed">
                    We've sent the free 7-Day Independent for Life Guide to{" "}
                    <span className="text-white font-semibold">{email}</span>{" "}
                    — and you're first in line when {program.shortName}{" "}
                    opens. (If the guide doesn't show up in a few minutes,
                    look in your spam folder, just in case.)
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
                    Join the founding list
                  </h3>
                  <form onSubmit={handleSubmit} noValidate>
                    <label
                      htmlFor="nicheFirstName"
                      className="block text-white/80 text-base font-medium mb-2"
                    >
                      First name
                    </label>
                    <input
                      id="nicheFirstName"
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
                      htmlFor="nicheEmail"
                      className="block text-white/80 text-base font-medium mb-2"
                    >
                      Email
                    </label>
                    <input
                      id="nicheEmail"
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
                      {state === "submitting"
                        ? "Joining…"
                        : "Join the Founding List"}
                    </button>
                  </form>
                  <p className="text-white/50 text-sm text-center mt-6">
                    Free forever. No spam, no pressure. Unsubscribe anytime.
                  </p>
                </>
              )}
            </div>

            <p className="text-center mt-10">
              <Link
                href="/start"
                className="inline-flex items-center text-royal hover:text-royal-light font-heading font-semibold text-lg transition"
              >
                Not sure where to start? Start with the free guide
                <FaArrowRight className="ml-2" />
              </Link>
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
