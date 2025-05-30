import Layout from "../components/shared/Layout";
import Head from "next/head";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <Head>
        <title>Privacy Policy | FL Best Trainer</title>
        <meta
          name="description"
          content="FL Best Trainer's privacy policy - how we collect, use, and protect your personal information."
        />
      </Head>

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Privacy Policy
              </h1>
              <div className="h-1 w-20 bg-royal rounded-full mb-6"></div>
              <p className="text-white/70">Last updated: May 29, 2025</p>
            </div>

            {/* Content */}
            <div className="space-y-8 text-white/80">
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Introduction
                </h2>
                <p>
                  FL Best Trainer ("we," "our," or "us") respects your privacy
                  and is committed to protecting your personal data. This
                  privacy policy will inform you about how we look after your
                  personal data when you visit our website and tell you about
                  your privacy rights and how the law protects you.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Information We Collect
                </h2>
                <p>
                  We may collect, use, store, and transfer different kinds of
                  personal data about you, including:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    <span className="text-royal-light">Identity Data</span>:
                    Includes first name, last name, username or similar
                    identifier.
                  </li>
                  <li>
                    <span className="text-royal-light">Contact Data</span>:
                    Includes email address, telephone number, and physical
                    address.
                  </li>
                  <li>
                    <span className="text-royal-light">Health Data</span>:
                    Includes fitness goals, current health status, physical
                    limitations, and other health-related information you
                    provide to us for personal training purposes.
                  </li>
                  <li>
                    <span className="text-royal-light">Technical Data</span>:
                    Includes internet protocol (IP) address, browser type and
                    version, time zone setting, browser plug-in types and
                    versions, operating system and platform.
                  </li>
                  <li>
                    <span className="text-royal-light">Usage Data</span>:
                    Includes information about how you use our website.
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  How We Use Your Information
                </h2>
                <p>
                  We will only use your personal data when the law allows us to.
                  Most commonly, we will use your personal data in the following
                  circumstances:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    To provide and improve our personal training services to
                    you.
                  </li>
                  <li>To manage our relationship with you.</li>
                  <li>
                    To send you information about our services, promotions, and
                    events.
                  </li>
                  <li>
                    To respond to your inquiries and provide customer support.
                  </li>
                  <li>To improve our website and services.</li>
                  <li>To comply with legal obligations.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">Cookies</h2>
                <p>
                  We use cookies and similar tracking technologies to track the
                  activity on our website and hold certain information. Cookies
                  are files with small amount of data which may include a unique
                  identifier.
                </p>
                <p>
                  You can instruct your browser to refuse all cookies or to
                  indicate when a cookie is being sent. However, if you do not
                  accept cookies, you may not be able to use some portions of
                  our website.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Data Security
                </h2>
                <p>
                  We have implemented appropriate security measures to prevent
                  your personal data from being accidentally lost, used, or
                  accessed in an unauthorized way, altered, or disclosed.
                  Additionally, we limit access to your personal data to those
                  employees, agents, contractors, and other third parties who
                  have a business need to know.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Data Retention
                </h2>
                <p>
                  We will only retain your personal data for as long as
                  necessary to fulfill the purposes we collected it for,
                  including for the purposes of satisfying any legal,
                  accounting, or reporting requirements.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Your Legal Rights
                </h2>
                <p>
                  Under certain circumstances, you have rights under data
                  protection laws in relation to your personal data, including
                  the right to:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Request access to your personal data.</li>
                  <li>Request correction of your personal data.</li>
                  <li>Request erasure of your personal data.</li>
                  <li>Object to processing of your personal data.</li>
                  <li>Request restriction of processing your personal data.</li>
                  <li>Request transfer of your personal data.</li>
                  <li>Right to withdraw consent.</li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Changes to This Privacy Policy
                </h2>
                <p>
                  We may update our Privacy Policy from time to time. We will
                  notify you of any changes by posting the new Privacy Policy on
                  this page and updating the "Last updated" date at the top of
                  this page.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  Contact Us
                </h2>
                <p>
                  If you have any questions about this Privacy Policy, please
                  contact us at:
                </p>
                <div className="bg-black/20 p-6 rounded-lg border border-white/10 mt-4">
                  <p className="mb-2">FL Best Trainer</p>
                  <p className="mb-2">
                    Email:{" "}
                    <a
                      href="mailto:FLBestTrainer@outlook.com"
                      className="text-royal-light hover:underline"
                    >
                      FLBestTrainer@outlook.com
                    </a>
                  </p>
                  <p>
                    Phone:{" "}
                    <a
                      href="tel:+19285871309"
                      className="text-royal-light hover:underline"
                    >
                      (928) 587-1309
                    </a>
                  </p>
                </div>
              </section>
            </div>

            <div className="mt-12 flex justify-center">
              <Link
                href="/"
                className="inline-flex items-center px-6 py-3 bg-royal/20 hover:bg-royal/30 transition-colors rounded-lg text-white text-sm font-medium"
              >
                Return to Home Page
              </Link>
            </div>
          </div>
        </div>
      </main>
    </Layout>
  );
}
