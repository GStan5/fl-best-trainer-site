import { useState } from "react";
import Layout from "../components/shared/Layout";
import SEO from "@/components/shared/SEO";
import { FaCheckCircle, FaDownload, FaEnvelope } from "react-icons/fa";

// Independent for Life — free 7-day guide opt-in (Phase 1).
// Copy: PAGE_COPY.md PAGE 1, verbatim.

const bullets = [
  "7 days of guided sessions using just a chair, a wall, and water bottles",
  "A Day 1 baseline test so you can measure exactly what changes",
  "The 6 traps that steal independence after 50 — and how to start beating them",
  "A doctor discussion checklist to take to your next appointment",
];

type FormState = "idle" | "submitting" | "success" | "error";

export default function StartPage() {
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
        body: JSON.stringify({ firstName, email }),
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
        title="Free 7-Day Guide | Stay Strong, Steady, and Independent After 50 | FL Best Trainer"
        description="A free 7-day starter program from a NASM-certified personal trainer who works with adults 50+ every day. 10–15 minutes a day. No gym. No getting hurt."
        keywords="free fitness guide over 50, senior strength training, balance exercises at home, independent for life, FL Best Trainer"
        url="/start"
      />

      {/* Hero + form */}
      <section className="pt-28 pb-16 md:pt-36 md:pb-20 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0A0A0A] z-0"></div>
        <div className="absolute inset-0 opacity-20 bg-grid-pattern z-0"></div>

        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Stay Strong, Steady, and{" "}
              <span className="text-royal">Independent After 50</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl mb-10 leading-relaxed">
              A free 7-day starter program from a NASM-certified personal
              trainer who works with adults 50+ every day. 10–15 minutes a
              day. No gym. No getting hurt.
            </p>
          </div>

          <div className="max-w-2xl mx-auto">
            <ul className="space-y-4 mb-10">
              {bullets.map((b) => (
                <li
                  key={b}
                  className="flex items-start text-white/90 text-base md:text-lg"
                >
                  <FaCheckCircle className="text-royal mr-3 mt-1 flex-shrink-0 text-xl" />
                  <span>{b}</span>
                </li>
              ))}
            </ul>

            <p className="text-white/70 text-base md:text-lg mb-12 text-center leading-relaxed">
              Gavin Stanifer is a NASM Certified Personal Trainer in Longboat
              Key, Florida, specializing in strength, balance, and bone density
              for adults 50+.
            </p>

            {/* Form card */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 sm:p-8 shadow-xl shadow-black/40">
              {state === "success" ? (
                <div className="text-center">
                  <FaEnvelope className="text-royal text-4xl mx-auto mb-4" />
                  <h2 className="font-heading text-2xl font-bold text-white mb-3">
                    Your guide is on its way
                  </h2>
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
                  <h2 className="font-heading text-2xl font-bold text-white mb-6 text-center">
                    Send me the free 7-day guide
                  </h2>
                  <form onSubmit={handleSubmit} noValidate>
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
                      className="w-full bg-royal hover:bg-royal-dark disabled:opacity-60 text-white font-heading font-bold text-lg py-4 px-8 rounded-xl transition min-h-[56px]"
                    >
                      {state === "submitting" ? "Sending…" : "Send My Free Guide"}
                    </button>
                  </form>
                </>
              )}
            </div>

            {/* Testimonial strip */}
            <div className="mt-12 text-center">
              <p className="text-royal italic text-lg mb-3">
                What my in-person clients say:
              </p>
              <blockquote className="text-white/85 text-xl md:text-2xl leading-relaxed">
                "improvements in strength, balance, flexibility, and toning."
              </blockquote>
              <p className="text-white/60 text-base mt-3">
                — Jackie Berling, 65, Longboat Key
              </p>
            </div>

            <p className="text-white/50 text-sm text-center mt-10">
              Free forever. No spam, no pressure. Unsubscribe anytime.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
