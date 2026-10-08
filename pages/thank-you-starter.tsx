import Layout from "../components/shared/Layout";
import SEO from "@/components/shared/SEO";
import { FaCheckCircle, FaDownload, FaArrowRight } from "react-icons/fa";

// Independent for Life — starter purchase thank-you + flagship upsell
// (Phase 2). Copy: PAGE_COPY.md PAGE 3, verbatim for the delivery half.
// Documented adaptation (pending Gavin's review): the "Upgrade Me — $460"
// button links to /flagship instead of a checkout, because flagship
// enrollment is waitlist-only right now; the credit-honored line under it
// is new, written to keep the offer honest. The copy's email line reads
// "video library password" — no password exists in the copy, and the line
// below keeps the wording without asserting a credential was sent.

export default function ThankYouStarterPage() {
  return (
    <Layout>
      <SEO
        title="You're In — Your 4-Week Starter Plan | Independent for Life | FL Best Trainer"
        description="Your Independent for Life 4-Week Starter Plan is ready. Download it and start with Session 1 whenever you're ready."
        keywords="independent for life starter plan download, 4 week strength plan over 50, FL Best Trainer"
        url="/thank-you-starter"
      />

      {/* Delivery */}
      <section className="pt-28 pb-14 md:pt-36 md:pb-16 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0A0A0A] z-0"></div>
        <div className="absolute inset-0 opacity-20 bg-grid-pattern z-0"></div>
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="max-w-3xl mx-auto text-center">
            <FaCheckCircle className="text-royal text-5xl mx-auto mb-6" />
            <h1 className="font-heading text-4xl md:text-5xl font-bold text-white mb-5 leading-tight">
              You're in. Your 4-Week Starter Plan is{" "}
              <span className="text-royal">on its way.</span>
            </h1>
            <p className="text-white/80 text-lg md:text-xl leading-relaxed mb-10">
              Check your email — your download link and video library password
              are there now. Start with Session 1 whenever you're ready.
            </p>
            <a
              href="/downloads/independent-for-life-starter-plan.pdf"
              className="inline-flex items-center justify-center bg-royal hover:bg-royal-dark text-white font-heading font-bold text-lg py-4 px-10 rounded-xl transition min-h-[56px]"
            >
              <FaDownload className="mr-3" />
              Download My Plan
            </a>
          </div>
        </div>
      </section>

      {/* Upsell */}
      <section className="py-14 bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto">
            <div className="bg-gradient-to-b from-navy to-[#0A0A0A] border border-royal/40 rounded-2xl p-8 shadow-xl shadow-black/50">
              <h2 className="font-heading text-3xl md:text-4xl font-bold text-white mb-5 text-center">
                Want the full 6-week coached program instead?
              </h2>
              <p className="text-white/80 text-lg leading-relaxed mb-8 max-w-2xl mx-auto">
                The Starter Plan builds your foundation. The 6-Week Strength
                Foundations program is the next level — the same system, with a
                coach in your corner: weekly form checks, text access to
                Gavin, and a guarantee on three concrete abilities (5
                unassisted chair stands, a 20-lb carry, a 30-second
                single-leg stand).
              </p>
              <p className="text-white/90 text-lg text-center mb-8">
                Your $37 comes off today:{" "}
                <span className="text-white/60 line-through">$497</span>{" "}
                <span className="text-royal font-heading text-3xl font-bold align-middle">
                  $460
                </span>{" "}
                on this page only.
              </p>
              <div className="text-center">
                <a
                  href="/flagship"
                  className="inline-flex items-center justify-center bg-royal hover:bg-royal-dark text-white font-heading font-bold text-lg py-4 px-10 rounded-xl transition min-h-[56px]"
                >
                  Upgrade Me — $460 (was $497)
                </a>
                <p className="text-white/60 text-sm mt-4 max-w-xl mx-auto leading-relaxed">
                  Founding cohort enrollment isn't open yet — join the waitlist
                  and your $37 credit is honored when it opens.
                </p>
                <p className="mt-8">
                  <a
                    href="/downloads/independent-for-life-starter-plan.pdf"
                    className="text-royal-light underline text-base inline-flex items-center"
                  >
                    No thanks, take me to my plan
                    <FaArrowRight className="ml-2" />
                  </a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  );
}
