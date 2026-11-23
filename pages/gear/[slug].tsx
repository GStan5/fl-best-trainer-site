import Head from "next/head";
import Link from "next/link";
import Layout from "@/components/shared/Layout";
import SEO from "@/components/shared/SEO";
import GearDisclosure from "@/components/gear/GearDisclosure";
import { gearPicks, getPickBySlug, getGroupById } from "@/components/gear/data/gearPicks";
import { FORM_CHECK_URL, gearPlanDetails } from "@/lib/gearConfig";

const SITE = "https://flbesttrainer.com";

// One page per pick, same template every time — the 14 sections from the
// plan (§4.2), in order: title + slot, Gavin's Pick, verdict, score,
// method, outcome, product card, highlights, pros/cons, spec table,
// experience, choose/avoid, trust, links out.
export default function GearPickPage({ pick }) {
  const group = getGroupById(pick.group);
  const pickUrl = `${SITE}/gear/${pick.slug}`;
  const plan = gearPlanDetails(pick.plan.product);
  const planSecondary = pick.planSecondary
    ? gearPlanDetails(pick.planSecondary.product)
    : null;

  return (
    <Layout>
      <SEO
        title={`${pick.title} — Gavin's Pick | FL Best Trainer`}
        description={pick.oneLine}
        keywords={`${pick.brand}, ${pick.title}, gear over 50, FL Best Trainer`}
        url={`/gear/${pick.slug}`}
      />
      <Head>
        <link rel="canonical" href={pickUrl} />
      </Head>

      <main>
        <section className="pt-32 pb-20 bg-gradient-to-b from-black to-navy relative">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl">
            <p className="text-sm text-white/50 mb-2">
              <Link href="/gear" className="text-royal-light hover:text-white">
                ← Gear I use
              </Link>{" "}
              · {group ? group.name : ""}
            </p>

            {/* 1. Title + slot */}
            <h1 className="text-3xl sm:text-4xl font-bold text-white leading-tight">
              {pick.brand} — {pick.title}
            </h1>
            <p className="text-royal-light font-semibold mt-2">
              {pick.slot} — {group ? group.name : ""}
            </p>

            {/* 2. Gavin's Pick label — or Proposed Pick. A proposed pick
                is a Garage Gym Reviews roundup winner put here for Gavin
                to confirm; he has not tested it in class yet, and the
                page says so instead of pretending otherwise. A pick with
                slotSource: "none" holds no GGR slot (the Ice Barrel 300:
                the cold plunge roundup is retired), so the page must not
                print the GGR sentence for it. */}
            <p className="text-white/80 mt-6 mb-2">
              {pick.proposed ? (
                pick.slotSource === "none" ? (
                  <>
                    <span className="font-bold text-white">Proposed Pick.</span>{" "}
                    This one is proposed here for me to confirm. It is not
                    a Garage Gym Reviews roundup winner, and I have not
                    tested this one in class yet.
                  </>
                ) : (
                  <>
                    <span className="font-bold text-white">Proposed Pick.</span>{" "}
                    This is Garage Gym Reviews&apos; top pick in this category,
                    proposed here for me to confirm. I have not tested this one
                    in class yet.
                  </>
                )
              ) : (
                <>
                  <span className="font-bold text-white">Gavin&apos;s Pick.</span>{" "}
                  I tested this myself, with my clients, in class.
                </>
              )}
            </p>

            {/* 3. The verdict, first */}
            <p className="text-white/85 text-lg leading-relaxed mb-8">
              {pick.verdict}
            </p>

            {/* The honest weight note — only where the pick has one. */}
            {pick.weightNote && (
              <p className="text-white/85 text-lg leading-relaxed mb-8 bg-white/[0.04] border border-royal/40 rounded-xl p-5">
                {pick.weightNote}
              </p>
            )}

            {/* 4. Gavin's Score */}
            <h2 className="font-heading text-2xl font-bold text-white mb-3">
              Gavin&apos;s Score: {pick.score.average.toFixed(1)} / 5
            </h2>
            <p className="text-white/60 text-sm mb-4">
              {pick.proposed
                ? "Five things, scored 1 to 5. These numbers are proposed, not from use. I set the final numbers once I have tested it in class."
                : "Five things, scored 1 to 5. The numbers are mine, I set them from using it, not from reading about it."}
            </p>
            <table className="w-full text-left mb-8 border border-white/10 rounded-xl overflow-hidden">
              <tbody>
                {pick.score.factors.map((factor) => (
                  <tr
                    key={factor.name}
                    className="border-b border-white/10 last:border-b-0"
                  >
                    <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                      {factor.name}
                    </td>
                    <td className="py-3 px-4 text-royal-light font-bold whitespace-nowrap">
                      {factor.score} / 5
                    </td>
                    <td className="py-3 px-4 text-white/70 text-sm">
                      {factor.note}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 5. The method paragraph */}
            <h2 className="font-heading text-2xl font-bold text-white mb-3">
              How I tested it
            </h2>
            <p className="text-white/85 text-lg leading-relaxed mb-2">
              {pick.method}
            </p>
            <p className="text-white/50 text-sm mb-8">
              Tested {pick.methodDate}.
            </p>

            {/* 6. The outcome it supports */}
            <h2 className="font-heading text-2xl font-bold text-white mb-3">
              What it helps with
            </h2>
            <p className="text-white/85 text-lg leading-relaxed mb-8">
              {pick.outcome}
            </p>

            {/* 7. Product card — the two doors */}
            <div className="bg-white/[0.04] border border-white/10 rounded-2xl p-6 mb-3">
              <p className="font-heading text-xl font-bold text-white mb-1">
                {pick.brand} — {pick.title}
              </p>
              <p className="text-white/60 text-sm mb-5">
                Price is live on Amazon — the link carries it. I never quote
                a price here, because prices move.
              </p>
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={`/go/${pick.slug}`}
                  rel="sponsored nofollow"
                  className="inline-flex items-center justify-center bg-royal hover:bg-royal-dark text-white font-bold py-3 px-6 rounded-xl transition text-center"
                >
                  Check Price
                </a>
                <Link
                  href={plan.url}
                  className="inline-flex items-center justify-center border border-royal-light text-royal-light hover:bg-royal-light hover:text-royal-dark font-bold py-3 px-6 rounded-xl transition text-center"
                >
                  {pick.plan.label} — {plan.name}
                  {plan.price !== "Free" ? ` ${plan.price}` : ""}
                </Link>
              </div>
              {planSecondary && (
                <p className="mt-4 text-sm">
                  <Link
                    href={planSecondary.url}
                    className="text-royal-light hover:text-white underline"
                  >
                    {pick.planSecondary.label} — {planSecondary.name}{" "}
                    {planSecondary.price}
                  </Link>
                </p>
              )}
            </div>
            <GearDisclosure className="mb-8" />

            {/* 8. Highlights */}
            <h2 className="font-heading text-2xl font-bold text-white mb-3">
              What stands out
            </h2>
            <ul className="space-y-2 mb-8">
              {pick.highlights.map((item) => (
                <li key={item} className="flex items-start text-white/85">
                  <span className="text-royal-light mr-3">•</span>
                  {item}
                </li>
              ))}
            </ul>

            {/* 9. Pros / Cons */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white mb-3">
                  Pros
                </h2>
                <ul className="space-y-2">
                  {pick.pros.map((item) => (
                    <li key={item} className="flex items-start text-white/85">
                      <span className="text-royal-light mr-3">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-white mb-3">
                  Cons
                </h2>
                <ul className="space-y-2">
                  {pick.cons.map((item) => (
                    <li key={item} className="flex items-start text-white/85">
                      <span className="text-royal-light mr-3">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 10. At a glance spec table */}
            <h2 className="font-heading text-2xl font-bold text-white mb-3">
              At a glance
            </h2>
            <table className="w-full text-left mb-8 border border-white/10 rounded-xl overflow-hidden">
              <tbody>
                {pick.specs.map((spec) => (
                  <tr
                    key={spec.label}
                    className="border-b border-white/10 last:border-b-0"
                  >
                    <td className="py-3 px-4 font-semibold text-white whitespace-nowrap">
                      {spec.label}
                    </td>
                    <td className="py-3 px-4 text-white/80">{spec.value}</td>
                  </tr>
                ))}
              </tbody>
            </table>

            {/* 11. Our experience / Gavin's voice */}
            <h2 className="font-heading text-2xl font-bold text-white mb-3">
              My experience
            </h2>
            <p className="text-white/85 text-lg leading-relaxed mb-8">
              {pick.experience}
            </p>

            {/* 12. Choose if / Avoid if */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
              <div>
                <h2 className="font-heading text-2xl font-bold text-white mb-3">
                  Choose it if
                </h2>
                <ul className="space-y-2">
                  {pick.chooseIf.map((item) => (
                    <li key={item} className="flex items-start text-white/85">
                      <span className="text-royal-light mr-3">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
              <div>
                <h2 className="font-heading text-2xl font-bold text-white mb-3">
                  Avoid it if
                </h2>
                <ul className="space-y-2">
                  {pick.avoidIf.map((item) => (
                    <li key={item} className="flex items-start text-white/85">
                      <span className="text-royal-light mr-3">•</span>
                      {item}
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            {/* 13. Why you should trust this pick */}
            <h2 className="font-heading text-2xl font-bold text-white mb-3">
              Why you should trust this pick
            </h2>
            <p className="text-white/85 leading-relaxed mb-2">
              I&apos;m Gavin Stanifer, NASM-CPT. I train adults 50+ every day,
              in-home and in small-group form classes, three times a week.{" "}
              {pick.proposed ? (
                pick.slotSource === "none" ? (
                  <>
                    I have not used this one in class yet. This pick is
                    proposed here for me to confirm, and the scores are my
                    starting point, not a verdict from use.
                  </>
                ) : (
                  <>
                    I have not used this one in class yet. This pick comes from
                    Garage Gym Reviews&apos; testing, proposed here for me to
                    confirm, and the scores are my starting point, not a verdict
                    from use.
                  </>
                )
              ) : (
                <>
                  I bought this gear myself and I use it in class.
                </>
              )}{" "}
              If a brand ever sends me something free, the page will say so,
              and the verdict won&apos;t change. Free products never buy
              coverage.
            </p>
            <p className="text-white/85 leading-relaxed mb-8">
              Not sure about your form?{" "}
              <Link
                href={FORM_CHECK_URL}
                className="text-royal-light hover:text-white underline"
              >
                Get a form check
              </Link>{" "}
              — film one set from the side, and I&apos;ll review it.
            </p>

            {/* 14. Links out */}
            <div className="border-t border-white/10 pt-8">
              <p className="text-white/80 leading-relaxed">
                {pick.teachingPost ? (
                  <>
                    Learn the move first:{" "}
                    <Link
                      href={`/blog/${pick.teachingPost.id}`}
                      className="text-royal-light hover:text-white underline"
                    >
                      {pick.teachingPost.title}
                    </Link>
                    {" · "}
                  </>
                ) : null}
                <Link
                  href="/gear"
                  className="text-royal-light hover:text-white underline"
                >
                  See all the gear I use
                </Link>
              </p>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export async function getStaticPaths() {
  const paths = gearPicks.map((pick) => ({
    params: { slug: pick.slug },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const pick = getPickBySlug(params.slug);

  if (!pick) {
    return { notFound: true };
  }

  return {
    props: { pick },
  };
}
