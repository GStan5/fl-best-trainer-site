import { useState } from "react";
import Link from "next/link";
import Head from "next/head";
import type { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import Layout from "../components/shared/Layout";
import SEO from "@/components/shared/SEO";
import { FaLock, FaVideo, FaCheckCircle } from "react-icons/fa";

// Independent for Life — member form-check submission (Phase 5).
// Account gate mirrors /library: SSR session check, exercise content
// never leaks to signed-out visitors. Members paste a video link;
// submissions land in the `form_checks` table (pages/api/form-check.ts)
// and Gavin reviews them in the weekly Steady Letter.
// Go-live tightening (monthly-members-only entitlement) comes with the
// purchase-confirmation wiring, same as the library.

interface FormCheckProps {
  signedIn: boolean;
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Repo pattern (cf. pages/account.tsx): getSession in
  // getServerSideProps — keeps the auth/DB config out of this page's
  // module graph at build time.
  const session = await getSession(context);
  return {
    props: {
      signedIn: !!session,
    } as FormCheckProps,
  };
}

type FormState = "idle" | "submitting" | "success" | "error";

export default function FormCheckPage({ signedIn }: FormCheckProps) {
  const [videoUrl, setVideoUrl] = useState("");
  const [note, setNote] = useState("");
  const [state, setState] = useState<FormState>("idle");
  const [errorMsg, setErrorMsg] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setState("submitting");
    setErrorMsg("");
    try {
      const res = await fetch("/api/form-check", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl, note }),
      });
      if (res.ok) {
        setState("success");
        return;
      }
      const data = await res.json().catch(() => ({}));
      setErrorMsg(
        typeof data.error === "string"
          ? data.error
          : "Something went wrong. Please try again in a moment."
      );
      setState("error");
    } catch {
      setErrorMsg("Something went wrong. Please try again in a moment.");
      setState("error");
    }
  }

  return (
    <Layout>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <SEO
        title="Submit a Form Check | Independent for Life | FL Best Trainer"
        description="Members: send Gavin a video of your lift and get it reviewed in the weekly Steady Letter. Customer-only."
        url="/form-check"
      />

      {/* Hero */}
      <section className="pt-28 pb-14 md:pt-36 md:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0A0A0A] z-0"></div>
        <div className="absolute inset-0 opacity-20 bg-grid-pattern z-0"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Submit a <span className="text-royal">Form Check</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed">
              Film one set, paste the link, and Gavin will break down your
              form — so you lift safer and stronger.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {!signedIn ? (
              <div className="bg-gradient-to-b from-navy to-[#0A0A0A] border border-royal/40 rounded-2xl p-8 shadow-xl shadow-black/50 max-w-2xl mx-auto text-center">
                <FaLock className="text-royal text-4xl mx-auto mb-4" />
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
                  Members only
                </h2>
                <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-8">
                  Form checks are for program members. Sign in with the free
                  account you create on this site — one tap with Google, no
                  password to keep track of.
                </p>
                <Link
                  href="/auth/signin?callbackUrl=/form-check"
                  className="inline-flex items-center justify-center bg-royal hover:bg-royal-dark text-white font-heading font-bold text-lg py-4 px-8 rounded-xl transition min-h-[56px]"
                >
                  Sign in to Submit a Video
                </Link>
              </div>
            ) : state === "success" ? (
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 text-center max-w-2xl mx-auto">
                <FaCheckCircle className="text-royal text-5xl mx-auto mb-5" />
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
                  Got it
                </h2>
                <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-8">
                  Gavin reviews member videos in the weekly Steady Letter —
                  keep an eye on your inbox for your breakdown.
                </p>
                <button
                  type="button"
                  onClick={() => {
                    setVideoUrl("");
                    setNote("");
                    setState("idle");
                  }}
                  className="inline-flex items-center justify-center bg-royal hover:bg-royal-dark text-white font-heading font-bold text-lg py-4 px-8 rounded-xl transition min-h-[56px]"
                >
                  Submit another video
                </button>
              </div>
            ) : (
              <div className="bg-gradient-to-b from-navy to-[#0A0A0A] border border-royal/40 rounded-2xl p-8 shadow-xl shadow-black/50 max-w-2xl mx-auto">
                <FaVideo className="text-royal text-4xl mx-auto mb-4 block text-center" />
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4 text-center">
                  Send Gavin your lift
                </h2>
                <p className="text-white/80 text-base md:text-lg leading-relaxed text-center mb-8">
                  Upload your video anywhere (YouTube, Google Drive,
                  iCloud…) and paste the share link here. One set is plenty.
                </p>
                <form
                  onSubmit={handleSubmit}
                  noValidate
                  className="max-w-md mx-auto"
                >
                  <label
                    htmlFor="videoUrl"
                    className="block text-white/80 text-base font-medium mb-2"
                  >
                    Video link
                  </label>
                  <input
                    id="videoUrl"
                    name="videoUrl"
                    type="url"
                    required
                    value={videoUrl}
                    onChange={(e) => setVideoUrl(e.target.value)}
                    className="w-full mb-6 rounded-xl bg-black/40 border border-white/20 px-4 py-4 text-lg text-white placeholder-white/40 focus:outline-none focus:border-royal min-h-[56px]"
                    placeholder="https://…"
                  />
                  <label
                    htmlFor="note"
                    className="block text-white/80 text-base font-medium mb-2"
                  >
                    What should Gavin look at?{" "}
                    <span className="text-white/50">(optional)</span>
                  </label>
                  <textarea
                    id="note"
                    name="note"
                    rows={3}
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="w-full mb-6 rounded-xl bg-black/40 border border-white/20 px-4 py-4 text-lg text-white placeholder-white/40 focus:outline-none focus:border-royal"
                    placeholder="e.g. My knees cave in on the way up"
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
                    <FaVideo className="mr-3" />
                    {state === "submitting" ? "Sending…" : "Send My Video"}
                  </button>
                </form>
              </div>
            )}

            <p className="text-center text-white/50 text-base mt-12">
              Form checks open to members; reviews land in the weekly letter.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
