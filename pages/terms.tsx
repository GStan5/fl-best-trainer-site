import Layout from "../components/shared/Layout";
import Head from "next/head";
import Link from "next/link";

export default function TermsOfService() {
  return (
    <Layout>
      <Head>
        <title>Terms of Service | FL Best Trainer</title>
        <meta
          name="description"
          content="FL Best Trainer's terms of service - the rules, guidelines, and agreements for using our services."
        />
      </Head>

      <main className="pt-28 pb-20">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-4xl mx-auto">
            {/* Header */}
            <div className="mb-10">
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-4">
                Terms of Service
              </h1>
              <div className="h-1 w-20 bg-royal rounded-full mb-6"></div>
              <p className="text-white/70">Last updated: May 29, 2025</p>
            </div>

            {/* Content */}
            <div className="space-y-8 text-white/80">
              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  1. Introduction
                </h2>
                <p>
                  Welcome to FL Best Trainer. These Terms of Service govern your
                  use of our website and services. By accessing or using our
                  website, or by receiving our personal training services, you
                  agree to be bound by these Terms.
                </p>
                <p>
                  Please read these Terms carefully before using our services.
                  If you do not agree with any part of these Terms, you must not
                  use our services.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  2. Services
                </h2>
                <p>
                  FL Best Trainer provides personal training services, including
                  in-home personal training, custom workout plans, nutrition
                  coaching, and fitness assessments. The specific services
                  available to you depend on the package or plan you select.
                </p>
                <p>
                  We reserve the right to modify, suspend, or discontinue any
                  part of our services at any time without notice or liability.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  3. User Responsibilities
                </h2>
                <p>When using our services, you agree to:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    Provide accurate, complete, and up-to-date information about
                    your health and fitness status.
                  </li>
                  <li>
                    Follow all safety instructions provided by your trainer.
                  </li>
                  <li>
                    Use our services at your own risk and within your physical
                    capabilities.
                  </li>
                  <li>
                    Notify us of any changes to your health or fitness that
                    might affect your ability to participate in training.
                  </li>
                  <li>
                    Respect the scheduling policies outlined in your service
                    agreement.
                  </li>
                  <li>
                    Not reproduce, duplicate, copy, sell, or resell any portion
                    of our services without express permission.
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  4. Health and Medical Disclaimer
                </h2>
                <p>
                  Our services are not a substitute for professional medical
                  advice, diagnosis, or treatment. Always seek the advice of
                  your physician or other qualified health provider before
                  starting any new fitness program, especially if you have any
                  health concerns.
                </p>
                <p>
                  By using our services, you confirm that you have no medical
                  conditions that would prevent you from safely participating in
                  personal training activities. If you have any health concerns,
                  you agree to discuss them with your trainer before beginning
                  any exercise program.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  5. Payment and Cancellation
                </h2>
                <p>
                  Payment for our services is due according to the terms
                  specified in your service agreement. We accept various payment
                  methods as indicated on our website or in your agreement.
                </p>
                <p>Cancellation policies:</p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>
                    For individual sessions, cancellations must be made at least
                    72 hours in advance to avoid being charged for the session.
                  </li>
                  <li>
                    For package or subscription services, please refer to the
                    specific cancellation terms in your service agreement.
                  </li>
                  <li>
                    No refunds will be provided for services already rendered or
                    for no-shows.
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  6. Limitation of Liability
                </h2>
                <p>
                  To the maximum extent permitted by law, FL Best Trainer will
                  not be liable for any indirect, incidental, special,
                  consequential, or punitive damages, or any loss of profits or
                  revenues, whether incurred directly or indirectly, or any loss
                  of data, use, goodwill, or other intangible losses resulting
                  from:
                </p>
                <ul className="list-disc pl-6 space-y-2">
                  <li>Your use or inability to use our services.</li>
                  <li>
                    Any injuries or physical harm resulting from exercise or
                    physical activities during training sessions.
                  </li>
                  <li>
                    Any unauthorized access to or use of our servers and/or any
                    personal information stored therein.
                  </li>
                </ul>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  7. Waiver and Assumption of Risk
                </h2>
                <p>
                  You acknowledge that personal training involves physical
                  activities that may pose a risk of injury. You voluntarily
                  agree to participate in these activities and assume all risks
                  of injury or illness that may result from your participation.
                </p>
                <p>
                  By using our services, you acknowledge that you have read and
                  agreed to our separate Waiver and Release of Liability form.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  8. Intellectual Property
                </h2>
                <p>
                  All content on our website, including text, graphics, logos,
                  images, videos, and software, is the property of FL Best
                  Trainer and is protected by copyright and other intellectual
                  property laws. You may not use, reproduce, distribute, or
                  create derivative works from this content without our express
                  permission.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  9. Changes to Terms
                </h2>
                <p>
                  We reserve the right to modify these Terms at any time. If we
                  make changes, we will post the updated Terms on our website
                  and update the "Last updated" date. Your continued use of our
                  services after any changes indicates your acceptance of the
                  new Terms.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  10. Governing Law
                </h2>
                <p>
                  These Terms shall be governed by and construed in accordance
                  with the laws of the State of Florida, without regard to its
                  conflict of law provisions.
                </p>
              </section>

              <section className="space-y-4">
                <h2 className="text-2xl font-semibold text-white">
                  11. Contact Information
                </h2>
                <p>
                  If you have any questions about these Terms, please contact us
                  at:
                </p>
                <div className="bg-black/20 p-6 rounded-lg border border-white/10 mt-4">
                  <p className="mb-2">FL Best Trainer</p>
                  <p className="mb-2">
                    Email:{" "}
                    <a
                      href="mailto:flbesttrainer@gmail.com"
                      className="text-royal-light hover:underline"
                    >
                      flbesttrainer@gmail.com
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
