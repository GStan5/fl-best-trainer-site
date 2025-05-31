import Layout from "@/components/shared/Layout";
import SEO from "@/components/shared/SEO";
import Link from "next/link";

export default function WaiverPage() {
  return (
    <Layout>
      <SEO
        title="Liability Waiver | FL Best Trainer"
        description="Liability release and waiver form for FL Best Trainer services."
        url="/waiver"
      />

      <div className="container mx-auto py-32 px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-8">
            Liability Waiver
          </h1>

          <div className="prose prose-invert prose-lg max-w-none">
            <p>Last Updated: May 31, 2024</p>

            <h2>Release of Liability and Assumption of Risk</h2>

            <p>
              I, the participant, acknowledge that physical training involves
              strenuous physical activity and that such activity carries
              inherent risks including, but not limited to, physical injury and
              cardiac events. I understand that the participant is voluntarily
              participating in these activities with knowledge of the dangers
              involved.
            </p>

            <p>
              In consideration of being permitted to participate in the fitness
              training provided by FL Best Trainer, I hereby agree to the
              following:
            </p>

            <ol>
              <li>
                <strong>Assumption of Risk:</strong> I freely and voluntarily
                assume all risks, known and unknown, associated with
                participating in fitness training, including but not limited to
                injuries resulting from physical exertion, equipment, and
                facilities.
              </li>

              <li>
                <strong>Medical Consultation:</strong> I hereby represent that I
                am physically capable of participating in an exercise/fitness
                program and that I have consulted with a physician regarding any
                limitations or restrictions.
              </li>

              <li>
                <strong>Release of Liability:</strong> I, for myself and on
                behalf of my heirs, assigns, personal representatives, and next
                of kin, hereby release and hold harmless FL Best Trainer, its
                officers, officials, agents, employees, other participants, and
                sponsoring agencies from and against any and all claims for
                injury, disability, death, or damage.
              </li>

              <li>
                <strong>Media Release:</strong> I hereby grant FL Best Trainer
                permission to use my likeness in photographs, videos, or other
                digital media in any of its publications, including web-based
                publications, without payment or other consideration.
              </li>
            </ol>

            <p>
              By participating in training sessions or using workout plans
              provided by FL Best Trainer, you acknowledge that you have read
              this waiver, understand its contents, and consent to all terms. If
              you have any questions or concerns, please contact us before
              beginning any training program.
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
