import Link from "next/link";
import Head from "next/head";
import type { GetServerSidePropsContext } from "next";
import { getSession } from "next-auth/react";
import Layout from "../components/shared/Layout";
import SEO from "@/components/shared/SEO";
import { FaLock, FaPlayCircle } from "react-icons/fa";

// Independent for Life — exercise video library (Phase 3; access model
// changed by Gavin 2026-10-08: no emailed passwords — members sign in
// with their free site account, Google sign-in, created when they need
// it). Copy: PAGE_COPY.md PAGE 6. Customer-only, account-gated,
// noindexed. The gate is enforced server-side: the exercise list is
// only sent to the browser for signed-in members, and each video slot
// is an honest placeholder until the October filming day — no fake
// players, no stock footage. Until the videos exist, the page shows
// its "not open yet" state to everyone.

interface Exercise {
  id: string;
  name: string;
  cue: string;
}

// V01–V24 in the exact order of PAGE_COPY PAGE 6 (matches the filming map
// in TRAINER_SIGNOFF_PACKET.md). Key cues condensed from the movement
// libraries in INDEPENDENT_FOR_LIFE_6_WEEK_PLAN.md / FOUR_WEEK_STARTER_PLAN.md.
const EXERCISES: Exercise[] = [
  { id: "V01", name: "Chair squat (assisted)", cue: "Sit back like you're finding the chair behind you; knees track over toes." },
  { id: "V02", name: "Sit-to-stand (unassisted)", cue: "Chest proud, knees out — stand without your hands." },
  { id: "V03", name: "Goblet squat", cue: "Hold the weight at your chest; chest proud, knees out." },
  { id: "V04", name: "Standing hip abduction", cue: "Stand tall — don't lean away from the lifting leg." },
  { id: "V05", name: "Standing march", cue: "Stand tall — no leaning back as the knee rises." },
  { id: "V06", name: "Single-leg stand", cue: "Pick one spot on the wall and stare at it. Keep breathing." },
  { id: "V07", name: "Calf raise", cue: "Full range, no bouncing — pause at the bottom every rep." },
  { id: "V08", name: "Wall push-up", cue: "Body in one straight line; elbows at 45°, not flared." },
  { id: "V09", name: "Countertop push-up", cue: "Straight line from head to heels — squeeze glutes and belly." },
  { id: "V10", name: "Low-incline push-up", cue: "Straight line — squeeze glutes and belly so the hips don't sag." },
  { id: "V11", name: "Weight shift", cue: "Feel the weight arrive fully before shifting back. Slow is the point." },
  { id: "V12", name: "Heel-to-toe stand", cue: "Eyes forward, not down — balance follows your gaze." },
  { id: "V13", name: "Heel-to-toe walk", cue: "Eyes forward, not down — balance follows your gaze." },
  { id: "V14", name: "Dowel hip hinge", cue: "The dowel never leaves your back — head, upper back, tailbone." },
  { id: "V15", name: "Glute bridge", cue: "Squeeze your glutes at the top like you're holding a coin." },
  { id: "V16", name: "Dead bug", cue: "Back glued to the floor the entire set." },
  { id: "V17", name: "Bird dog", cue: "Long spine — imagine balancing a glass of water on your lower back." },
  { id: "V18", name: "Water-bottle row", cue: "Pinch a pencil between your shoulder blades at the top." },
  { id: "V19", name: "Dumbbell bent row", cue: "Pinch the pencil between your shoulder blades; back flat like a tabletop." },
  { id: "V20", name: "Overhead press", cue: "Ribs down — don't arch to get the weight up." },
  { id: "V21", name: "Romanian deadlift", cue: "Push your hips straight back, back long and flat." },
  { id: "V22", name: "Farmer's carry (+ suitcase)", cue: "Tall posture the whole walk — don't let the weights pull you forward." },
  { id: "V23", name: "Step-up", cue: "Push through the heel of the working leg — don't push off the back foot." },
  { id: "V24", name: "Reverse step-back", cue: "Tall torso, front knee over the ankle — take a long step back." },
];

interface LibraryProps {
  signedIn: boolean;
  // The videos don't exist until the October filming day, so the
  // library is closed to everyone until then — this flag is the
  // single switch to flip (per-video) as the clips land.
  libraryOpen: boolean;
  exercises: Exercise[];
}

export async function getServerSideProps(context: GetServerSidePropsContext) {
  // Repo pattern (cf. pages/account.tsx): getSession in
  // getServerSideProps — keeps the auth/DB config out of this page's
  // module graph at build time.
  const session = await getSession(context);
  const signedIn = !!session;
  const libraryOpen = false;
  return {
    props: {
      signedIn,
      libraryOpen,
      // The exercise list only leaves the server for signed-in members
      // once the library is open — never in the closed state.
      exercises: signedIn && libraryOpen ? EXERCISES : [],
    } as LibraryProps,
  };
}

export default function LibraryPage({ signedIn, libraryOpen, exercises }: LibraryProps) {

  return (
    <Layout>
      <Head>
        <meta name="robots" content="noindex, nofollow" />
      </Head>
      <SEO
        title="Exercise Video Library | Independent for Life | FL Best Trainer"
        description="Every movement in your program, demonstrated. Watch, copy, train. Customer-only."
        url="/library"
      />

      {/* Hero */}
      <section className="pt-28 pb-14 md:pt-36 md:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0A0A0A] z-0"></div>
        <div className="absolute inset-0 opacity-20 bg-grid-pattern z-0"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              Exercise <span className="text-royal">Video Library</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed">
              Every movement in your program, demonstrated. Watch, copy, train.
              Filmed silent with on-screen cues — no fluff, just the movement.
            </p>
          </div>
        </div>
      </section>

      <section className="py-12 bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {signedIn && libraryOpen ? (
              <>
                <p className="text-white/70 text-base text-center mb-10">
                  You're in. Videos appear here as they're filmed — every
                  movement below gets its demonstration.
                </p>
                <div className="grid gap-6 sm:grid-cols-2">
                  {exercises.map((ex) => (
                    <article
                      key={ex.id}
                      className="bg-white/[0.04] border border-white/10 rounded-2xl p-6"
                    >
                      {/* Honest placeholder — no fake player until filming. */}
                      <div className="aspect-video rounded-xl bg-black/50 border border-white/10 flex flex-col items-center justify-center mb-5 px-4 text-center">
                        <FaPlayCircle className="text-royal/60 text-4xl mb-3" />
                        <p className="text-white/70 text-base">
                          Video coming — filmed October
                        </p>
                      </div>
                      <h2 className="font-heading text-xl font-bold text-white mb-2">
                        {ex.name}
                      </h2>
                      <p className="text-white/75 text-base leading-relaxed">
                        <span className="text-royal-light font-semibold">
                          Key cue:
                        </span>{" "}
                        {ex.cue}
                      </p>
                    </article>
                  ))}
                </div>
              </>
            ) : !signedIn ? (
              <div className="bg-gradient-to-b from-navy to-[#0A0A0A] border border-royal/40 rounded-2xl p-8 shadow-xl shadow-black/50 max-w-2xl mx-auto text-center">
                <FaLock className="text-royal text-4xl mx-auto mb-4" />
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
                  Members only
                </h2>
                <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-xl mx-auto mb-8">
                  The library is for program members. Sign in with the free
                  account you create on this site — one tap with Google, no
                  password to keep track of.
                </p>
                <Link
                  href="/auth/signin?callbackUrl=/library"
                  className="inline-flex items-center justify-center bg-royal hover:bg-royal-dark text-white font-heading font-bold text-lg py-4 px-8 rounded-xl transition min-h-[56px]"
                >
                  Sign in to the Library
                </Link>
              </div>
            ) : (
              <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-8 text-center max-w-2xl mx-auto">
                <FaLock className="text-royal text-4xl mx-auto mb-4" />
                <h2 className="font-heading text-2xl md:text-3xl font-bold text-white mb-4">
                  Library opens with the program videos
                </h2>
                <p className="text-white/80 text-base md:text-lg leading-relaxed max-w-xl mx-auto">
                  The 24 movement demonstrations are filmed in October.
                  You're signed in, so the moment they're live your library
                  unlocks right here — nothing else to do.
                </p>
              </div>
            )}

            {/* Customer-only note (PAGE_COPY PAGE 6) */}
            <p className="text-center text-white/50 text-base mt-12">
              Customer-only page: sign in with your member account. Please
              don't share your login.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
