import Layout from "@/components/shared/Layout";
import SEO from "@/components/shared/SEO";
import Link from "next/link";

export default function PrivacyPolicy() {
  return (
    <Layout>
      <SEO
        title="Privacy Policy | FL Best Trainer"
        description="Privacy policy for FL Best Trainer services and website."
        url="/privacy"
      />

      <div className="container mx-auto py-16 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">
            Privacy Policy
          </h1>

          <div className="prose prose-invert prose-lg max-w-none">
            <p>Last Updated: May 31, 2024</p>

            <h2>1. Introduction</h2>
            <p>
              FL Best Trainer ("we," "our," or "us") respects your privacy and
              is committed to protecting it through our compliance with this
              policy. This policy describes the types of information we may
              collect from you or that you may provide when you visit our
              website and our practices for collecting, using, maintaining,
              protecting, and disclosing that information.
            </p>

            <h2>2. Information We Collect</h2>
            <p>
              We may collect several types of information from and about users
              of our website, including:
            </p>
            <ul>
              <li>Contact information (name, email address, phone number)</li>
              <li>Fitness goals and health information you choose to share</li>
              <li>Information about your internet connection and device</li>
              <li>Usage details and browsing actions</li>
            </ul>

            <h2>3. How We Use Your Information</h2>
            <p>
              We use information that we collect about you or that you provide
              to us:
            </p>
            <ul>
              <li>To provide you with information, products, or services</li>
              <li>To improve our website and services</li>
              <li>To communicate with you about our services</li>
              <li>To fulfill any other purpose for which you provide it</li>
            </ul>

            <h2>4. Data Security</h2>
            <p>
              We have implemented measures designed to secure your personal
              information from accidental loss and from unauthorized access,
              use, alteration, and disclosure.
            </p>

            <h2>5. Contact Information</h2>
            <p>
              To ask questions or comment about this privacy policy, contact us
              at:{" "}
              <a
                href="mailto:flbesttrainer@gmail.com"
                className="text-royal-light hover:underline"
              >
                flbesttrainer@gmail.com
              </a>
            </p>
          </div>

          <div className="mt-12 border-t border-white/10 pt-8">
            <Link
              href="/"
              className="text-royal hover:text-royal-light transition-colors"
            >
              Return to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
