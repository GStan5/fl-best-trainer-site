import Layout from "@/components/shared/Layout";
import SEO from "@/components/shared/SEO";
import { AMAZON_DISCLOSURE } from "@/lib/gearConfig";

// Affiliate disclosure, plain and short. How the site makes money, what
// it will never do, and Amazon's required wording in full.
export default function DisclosurePage() {
  return (
    <Layout>
      <SEO
        title="Affiliate Disclosure | FL Best Trainer"
        description="How FL Best Trainer makes money: affiliate links and brand programs. Brands never pay for placement, and free products never buy coverage."
        keywords="affiliate disclosure, FL Best Trainer"
        url="/disclosure"
      />

      <main>
        <section className="pt-32 pb-20 bg-gradient-to-b from-black to-navy relative">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto max-w-3xl">
            <h1 className="text-3xl sm:text-4xl font-bold text-white mb-6">
              Affiliate disclosure
            </h1>

            <p className="text-white/85 text-lg leading-relaxed mb-6">
              Some links on this site are affiliate links. If you buy
              through my link, I earn a small commission. It doesn&apos;t
              cost you anything, and I only pick gear I&apos;d hand to my
              own clients.
            </p>

            <p className="text-white/85 text-lg leading-relaxed mb-6">
              The main program is Amazon Associates, the gear links on the{" "}
              <a href="/gear" className="text-royal-light hover:text-white underline">
                gear page
              </a>{" "}
              go through Amazon. I also work with a small number of brand
              programs directly, and those are named on the page where they
              appear.
            </p>

            <p className="text-white/85 text-lg leading-relaxed mb-6">
              Brands never pay for placement. A brand can send me a product
              to try, and the page will say so, but a free product never
              buys a good verdict. If I don&apos;t recommend something, the
              page says that too.
            </p>

            <p className="text-white/85 text-lg leading-relaxed mb-6">
              Prices are live on the retailer&apos;s site. I never quote a
              price on this site, because prices move — the link carries the
              current price.
            </p>

            <p className="text-white/85 text-lg leading-relaxed mb-6">
              {AMAZON_DISCLOSURE}
            </p>

            <p className="text-white/60 leading-relaxed">
              Questions about any of this? Email me at{" "}
              <a
                href="mailto:flbesttrainer@gmail.com"
                className="text-royal-light hover:text-white underline"
              >
                flbesttrainer@gmail.com
              </a>
              .
            </p>
          </div>
        </section>
      </main>
    </Layout>
  );
}
