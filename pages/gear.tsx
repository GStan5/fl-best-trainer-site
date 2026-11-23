import Layout from "@/components/shared/Layout";
import SEO from "@/components/shared/SEO";
import PickCard from "@/components/gear/PickCard";
import GearDisclosure from "@/components/gear/GearDisclosure";
import { GEAR_GROUPS, getPicksByGroup } from "@/components/gear/data/gearPicks";
import { GEAR_PAGE_LAST_UPDATED } from "@/lib/gearConfig";

// Gear I use — grouped by job, not brand. One card per pick, same shape
// every time. This is the front door: a reader lands here from a blog
// post, finds the gear for their job, and leaves through one of two
// doors — Check Price, or the plan that uses it.
export default function GearPage({ groups }) {
  return (
    <Layout>
      <SEO
        title="Gear I Use | FL Best Trainer"
        description="The gear I use with my clients, and the picks I'm proposing for them. Tested picks were used in class with people your age; proposed picks are marked as such."
        keywords="home gym gear over 50, hex dumbbells, resistance bands, kettlebells, treadmill, exercise bike, rower, elliptical, sauna, cold plunge, massage gun, foam roller, garmin watch walking, travel backpack trainer"
        url="/gear"
      />

      <main>
        <section className="pt-32 pb-20 bg-gradient-to-b from-black to-navy relative">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-[1100px]">
            <h1 className="text-3xl sm:text-4xl font-bold text-white">
              Gear I use
            </h1>
            <p className="text-white/75 text-lg leading-relaxed mt-3 mb-2 max-w-2xl">
              This is the gear I use with my clients, plus the picks
              I&apos;m proposing for them. Not a store, not sponsored picks,
              the things I&apos;d hand to my own clients. Picks I&apos;ve
              tested in class say so. Picks I haven&apos;t tested yet are
              marked Proposed, and the scores on those are a starting point
              for me to correct.
            </p>
            <p className="text-white/50 text-sm mb-10">
              Last updated {GEAR_PAGE_LAST_UPDATED}
            </p>

            {groups.map((group, groupIndex) => (
              <div key={group.id} className="mb-12">
                <h2 className="text-2xl font-bold text-white">
                  {group.name}
                </h2>
                <p className="text-white/60 mt-1 mb-5">{group.blurb}</p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {group.picks.map((pick) => (
                    <PickCard key={pick.slug} pick={pick} />
                  ))}
                </div>
                {groupIndex === 0 && (
                  <GearDisclosure className="mt-6" />
                )}
              </div>
            ))}

            <div className="border-t border-white/10 pt-10 text-center">
              <h2 className="font-heading text-2xl font-bold text-white mb-3">
                Not sure where to start?
              </h2>
              <p className="text-white/75 text-lg leading-relaxed mb-6 max-w-xl mx-auto">
                Start with the free 7-day guide. Ten minutes a day, a chair,
                a wall, and water bottles, no gear needed.
              </p>
              <a
                href="/start"
                className="inline-flex items-center justify-center bg-royal hover:bg-royal-dark text-white font-bold text-lg py-4 px-8 rounded-xl transition"
              >
                Get the free 7-day guide
              </a>
            </div>
          </div>
        </section>
      </main>
    </Layout>
  );
}

export async function getStaticProps() {
  const groups = GEAR_GROUPS.map((group) => ({
    ...group,
    picks: getPicksByGroup(group.id),
  }));

  return {
    props: { groups },
  };
}
