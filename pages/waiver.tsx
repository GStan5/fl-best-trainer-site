import Layout from "@/components/shared/Layout";
import SEO from "@/components/shared/SEO";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import SignaturePad from "signature_pad";
import { event } from "../utils/gtag";

export default function WaiverPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [signatureType, setSignatureType] = useState<"draw" | "type">("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  // Authentication check
  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push(
        "/auth/signin?callbackUrl=" + encodeURIComponent(router.asPath)
      );
      return;
    }
  }, [session, status, router]);

  // Ensure signature pad initializes when component is fully ready
  useEffect(() => {
    if (status !== "loading" && session) {
      // Small delay to ensure DOM is fully rendered
      const timer = setTimeout(() => {
        if (
          signatureType === "draw" &&
          canvasRef.current &&
          !signaturePadRef.current
        ) {
          // Trigger re-initialization
          setSignatureType("type");
          setTimeout(() => setSignatureType("draw"), 50);
        }
      }, 200);
      return () => clearTimeout(timer);
    }
  }, [session, status]);

  useEffect(() => {
    const initializeSignaturePad = () => {
      if (!canvasRef.current || signatureType !== "draw") return;

      // Clean up existing SignaturePad instance
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
        signaturePadRef.current = null;
      }

      const canvas = canvasRef.current;

      // Set fixed dimensions immediately
      const containerWidth = canvas.parentElement?.clientWidth || 400;
      const height = 128; // Fixed height matching h-32 class

      // Set canvas actual size (for drawing)
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = containerWidth * ratio;
      canvas.height = height * ratio;

      // Set canvas display size (CSS)
      canvas.style.width = containerWidth + "px";
      canvas.style.height = height + "px";

      // Scale the drawing context
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.scale(ratio, ratio);
      }

      // Initialize SignaturePad
      signaturePadRef.current = new SignaturePad(canvas, {
        backgroundColor: "rgb(255, 255, 255)",
        penColor: "rgb(0, 0, 0)",
      });

      signaturePadRef.current.clear();
    };

    // Use requestAnimationFrame to ensure DOM is ready
    if (signatureType === "draw") {
      requestAnimationFrame(() => {
        requestAnimationFrame(() => {
          initializeSignaturePad();
        });
      });
    }

    // Handle window resize with debouncing
    let resizeTimeout: NodeJS.Timeout;
    const handleResize = () => {
      clearTimeout(resizeTimeout);
      resizeTimeout = setTimeout(() => {
        if (signatureType === "draw") {
          requestAnimationFrame(() => {
            initializeSignaturePad();
          });
        }
      }, 100);
    };

    window.addEventListener("resize", handleResize);

    // Cleanup function
    return () => {
      window.removeEventListener("resize", handleResize);
      if (signaturePadRef.current) {
        signaturePadRef.current.off();
        signaturePadRef.current = null;
      }
    };
  }, [signatureType]);

  const clearSignature = () => {
    if (signatureType === "draw" && signaturePadRef.current) {
      signaturePadRef.current.clear();
    } else if (signatureType === "type") {
      setTypedSignature("");
    }
  };

  const getSignatureData = () => {
    if (signatureType === "draw" && signaturePadRef.current) {
      return signaturePadRef.current.toDataURL();
    }
    return typedSignature;
  };

  const isSignatureValid = () => {
    if (signatureType === "draw" && signaturePadRef.current) {
      return !signaturePadRef.current.isEmpty();
    }
    return typedSignature.trim().length > 0;
  };

  // Show loading state while session is loading
  if (status === "loading") {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-royal-dark via-royal-dark/90 to-black flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-light"></div>
        </div>
      </Layout>
    );
  }

  // Redirect to sign in if not authenticated
  if (!session) {
    return null; // This will be handled by the useEffect redirect
  }

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
            <p className="text-yellow-400 font-semibold">
              Last Updated: {new Date().toLocaleDateString()}
            </p>

            <h2>LIABILITY WAIVER, RELEASE, AND INDEMNIFICATION AGREEMENT</h2>

            <p className="text-red-400 font-bold text-center">
              READ CAREFULLY - THIS IS A LEGAL DOCUMENT THAT AFFECTS YOUR LEGAL
              RIGHTS
            </p>

            <p>
              In consideration of being permitted to participate in personal
              training sessions, fitness instruction, exercise programs, and
              related physical activities (collectively, the
              &quot;Activities&quot;) provided by FL Best Trainer LLC, a Florida
              limited liability company (the &quot;Company&quot;), and its
              owners, members, managers, employees, trainers, independent
              contractors, agents, and representatives, including Gavin R.
              Stanifer (collectively, the &quot;Released Parties&quot;), I, the
              undersigned participant, acknowledge and agree to the following:
            </p>

            <h2>Terms and Conditions</h2>

            <ol className="space-y-4">
              <li>
                <strong>Assumption of Risk:</strong> I understand that
                participation in fitness and physical training activities
                involves inherent risks, including but not limited to muscle
                strains, sprains, fractures, cardiovascular events, illness,
                permanent injury, or death. I voluntarily and knowingly assume
                all risks, whether known or unknown, foreseeable or
                unforeseeable, arising from my participation in the Activities.
              </li>

              <li>
                <strong>Physical Condition:</strong> I represent and warrant
                that I am physically and medically able to participate in the
                Activities and have no condition that would increase my risk of
                injury or prevent safe participation. I acknowledge that the
                Company has recommended that I consult with a physician prior to
                beginning any exercise or fitness program.
              </li>

              <li>
                <strong>Release and Waiver of Liability:</strong> I, for myself
                and on behalf of my heirs, assigns, personal representatives,
                and next of kin,{" "}
                <strong>
                  HEREBY RELEASE, WAIVE, DISCHARGE, AND COVENANT NOT TO SUE
                </strong>{" "}
                the Released Parties from any and all claims, demands, actions,
                causes of action, liabilities, damages, losses, or expenses of
                any kind arising out of or related to my participation in the
                Activities,{" "}
                <strong>
                  INCLUDING ANY CLAIMS ARISING FROM THE NEGLIGENCE OF THE
                  RELEASED PARTIES
                </strong>
                , to the fullest extent permitted by Florida law.
              </li>

              <li>
                <strong>Indemnification:</strong> I agree to indemnify and hold
                harmless the Released Parties to the fullest extent permitted by
                Florida law from any loss, liability, damage, or cost (including
                reasonable attorneys&apos; fees) arising out of or related to my
                participation in the Activities.
              </li>

              <li>
                <strong>Medical Treatment:</strong> I authorize the Company and
                its representatives to obtain emergency medical treatment for me
                if deemed necessary during my participation. I understand that I
                am solely responsible for all costs related to medical
                treatment, transportation, and related expenses.
              </li>

              <li>
                <strong>Media Release:</strong> I grant the Released Parties the
                irrevocable right to photograph, video record, or otherwise
                record my participation in the Activities and to use such media
                for lawful promotional or commercial purposes without
                compensation, unless I revoke this permission in writing.
              </li>

              <li>
                <strong>Equipment and Environment:</strong> I acknowledge that I
                am responsible for inspecting any equipment prior to use and
                will immediately report unsafe conditions. I agree to use
                equipment only as instructed and within my personal physical
                capabilities. I understand that Activities may occur in
                non-commercial environments, including private residences, which
                may present additional hazards.
              </li>

              <li>
                <strong>No Guarantees:</strong> I acknowledge that the Company
                makes no guarantees regarding fitness results, health
                improvements, or outcomes.
              </li>

              <li>
                <strong>Severability:</strong> If any provision of this
                Agreement is held to be invalid or unenforceable, the remaining
                provisions shall remain in full force and effect.
              </li>

              <li>
                <strong>Governing Law and Venue:</strong> This Agreement shall
                be governed by and interpreted in accordance with the laws of
                the State of Florida. Any legal action arising out of this
                Agreement shall be brought exclusively in the state or federal
                courts located in Florida, and I consent to such jurisdiction.
              </li>

              <li>
                <strong>Entire Agreement:</strong> This Agreement constitutes
                the entire agreement between the parties and supersedes any
                prior oral or written agreements or understandings.
              </li>

              <li>
                <strong>Acknowledgment and Voluntary Execution:</strong> I
                acknowledge that I have read this Agreement in its entirety,
                understand its terms, understand that I am giving up substantial
                legal rights, and sign it freely and voluntarily without
                inducement.
              </li>
            </ol>

            <div className="bg-yellow-900/20 border border-yellow-500 p-4 rounded-md mt-6">
              <p className="text-yellow-300 font-bold">
                <strong>ACKNOWLEDGMENT:</strong> By signing below, I acknowledge
                that I have read this Agreement in its entirety, understand its
                terms, understand that I am giving up substantial legal rights,
                and sign it freely and voluntarily without inducement. This is a
                legally binding electronic document.
              </p>
            </div>
          </div>

          <form
            id="waiver-form"
            className="space-y-6 mt-8"
            onSubmit={async (e) => {
              e.preventDefault();
              setError("");
              setIsSubmitting(true);

              const form = e.currentTarget as HTMLFormElement;
              const signatureData = getSignatureData();

              if (!isSignatureValid()) {
                setError("Please provide a signature");
                setIsSubmitting(false);
                return;
              }

              const data = {
                name: (form.elements.namedItem("name") as HTMLInputElement)
                  .value,
                email: (form.elements.namedItem("email") as HTMLInputElement)
                  .value,
                phone: (form.elements.namedItem("phone") as HTMLInputElement)
                  .value,
                signature: signatureData,
                signatureType: signatureType,
                date: new Date().toISOString(),
              };

              try {
                const res = await fetch("/api/waiver", {
                  method: "POST",
                  headers: { "Content-Type": "application/json" },
                  body: JSON.stringify(data),
                });

                if (res.ok) {
                  // Track successful waiver submission
                  event({
                    action: "submit_waiver",
                    category: "engagement",
                    label: "liability_waiver_completed",
                  });

                  setSubmitted(true);
                  form.reset();
                  clearSignature();

                  // Check if we need to redirect back to a specific page
                  const redirectUrl = localStorage.getItem(
                    "redirectAfterWaiver"
                  );
                  if (redirectUrl) {
                    localStorage.removeItem("redirectAfterWaiver");
                    // Redirect after a short delay to show success message
                    setTimeout(() => {
                      window.location.href = redirectUrl;
                    }, 2000);
                  } else {
                    // Default redirect to classes page after waiver completion
                    setTimeout(() => {
                      window.location.href = "/classes";
                    }, 2000);
                  }
                } else {
                  // Track failed waiver submission
                  event({
                    action: "submit_waiver_failed",
                    category: "engagement",
                    label: "liability_waiver_error",
                  });

                  const errorData = await res.json();
                  setError(errorData.error || "Failed to submit waiver.");
                }
              } catch (err) {
                setError("Network error. Please try again.");
              } finally {
                setIsSubmitting(false);
              }
            }}
          >
            <div>
              <label
                className="block text-sm font-medium text-white mb-1"
                htmlFor="name"
              >
                Full Name *
              </label>
              <input
                type="text"
                name="name"
                id="name"
                required
                defaultValue={session?.user?.name || ""}
                className="w-full rounded-md bg-white/10 border border-white/20 p-3 text-white placeholder-white/50 focus:border-royal focus:ring-1 focus:ring-royal"
                placeholder="Enter your full legal name"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-white mb-1"
                htmlFor="email"
              >
                Email Address *
              </label>
              <input
                type="email"
                name="email"
                id="email"
                required
                defaultValue={session?.user?.email || ""}
                readOnly
                className="w-full rounded-md bg-white/10 border border-white/20 p-3 text-white placeholder-white/50 focus:border-royal focus:ring-1 focus:ring-royal opacity-75"
                placeholder="Enter your email address"
              />
            </div>

            <div>
              <label
                className="block text-sm font-medium text-white mb-1"
                htmlFor="phone"
              >
                Phone Number *
              </label>
              <input
                type="tel"
                name="phone"
                id="phone"
                required
                className="w-full rounded-md bg-white/10 border border-white/20 p-3 text-white placeholder-white/50 focus:border-royal focus:ring-1 focus:ring-royal"
                placeholder="Enter your phone number"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-white mb-4">
                Signature *
              </label>

              <div className="flex space-x-4 mb-4">
                <button
                  type="button"
                  onClick={() => setSignatureType("draw")}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    signatureType === "draw"
                      ? "bg-royal text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  Draw Signature
                </button>
                <button
                  type="button"
                  onClick={() => setSignatureType("type")}
                  className={`px-4 py-2 rounded-md transition-colors ${
                    signatureType === "type"
                      ? "bg-royal text-white"
                      : "bg-white/10 text-white/70 hover:bg-white/20"
                  }`}
                >
                  Type Signature
                </button>
              </div>

              {signatureType === "draw" ? (
                <div className="bg-white rounded-md p-4 max-w-full overflow-hidden">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-32 border border-gray-300 rounded cursor-crosshair block"
                    style={{ touchAction: "none", maxWidth: "100%" }}
                  />
                  <div className="mt-2 flex justify-between">
                    <p className="text-sm text-gray-600">
                      Sign above using your mouse or finger
                    </p>
                    <button
                      type="button"
                      onClick={clearSignature}
                      className="text-sm text-red-600 hover:text-red-800"
                    >
                      Clear
                    </button>
                  </div>
                </div>
              ) : (
                <div>
                  <input
                    type="text"
                    value={typedSignature}
                    onChange={(e) => setTypedSignature(e.target.value)}
                    placeholder="Type your full name as your signature"
                    className="w-full rounded-md bg-white/10 border border-white/20 p-3 text-white placeholder-white/50 focus:border-royal focus:ring-1 focus:ring-royal"
                    style={{ fontFamily: "cursive" }}
                  />
                  <p className="text-xs text-white/60 mt-1">
                    By typing your name, you agree this serves as your legal
                    electronic signature.
                  </p>
                </div>
              )}
            </div>

            <div className="flex items-start space-x-3">
              <input
                id="agree"
                name="agree"
                type="checkbox"
                required
                className="h-4 w-4 text-royal focus:ring-royal border-white/20 rounded mt-1"
              />
              <label
                htmlFor="agree"
                className="text-white text-sm leading-relaxed"
              >
                I acknowledge that I have read, understood, and agree to be
                bound by all terms and conditions of this liability waiver. I
                understand that I am giving up certain legal rights by signing
                this document.
              </label>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-royal hover:bg-royal-light disabled:bg-gray-600 text-white font-medium py-3 px-6 rounded-md transition-colors"
            >
              {isSubmitting
                ? "Submitting Waiver..."
                : "Submit Liability Waiver"}
            </button>

            {error && (
              <div className="bg-red-900/20 border border-red-500 text-red-400 px-4 py-3 rounded-md">
                {error}
              </div>
            )}

            {submitted && (
              <div className="bg-green-900/20 border border-green-500 text-green-400 px-4 py-3 rounded-md">
                ✅ Waiver submitted successfully! You will receive a
                confirmation email with a copy of your signed waiver shortly.
                {localStorage.getItem("redirectAfterWaiver") && (
                  <>
                    <br />
                    <div className="flex items-center mt-2">
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-green-400 mr-2"></div>
                      <span className="text-sm">
                        Completing your registration and redirecting...
                      </span>
                    </div>
                  </>
                )}
              </div>
            )}
          </form>

          <div className="mt-12 border-t border-white/10 pt-8">
            <p className="text-white/60 text-sm mb-4">
              Questions about this waiver? Contact us before signing.
            </p>
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <Link
                href="/"
                className="text-royal hover:text-royal-light transition-colors"
              >
                ← Return to Home
              </Link>

              {/* Download PDF Button */}
              <a
                href="/FL-Best-Trainer-Waiver.html"
                target="_blank"
                className="flex items-center px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors duration-200 shadow-lg text-sm"
              >
                <svg
                  className="w-4 h-4 mr-2"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 10v6m0 0l-3-3m3 3l3-3m2 8H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                  />
                </svg>
                Download Printable Waiver
              </a>
            </div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
