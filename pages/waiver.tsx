import Layout from "@/components/shared/Layout";
import SEO from "@/components/shared/SEO";
import Link from "next/link";
import { useState, useRef, useEffect } from "react";
import SignaturePad from "signature_pad";

export default function WaiverPage() {
  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [signatureType, setSignatureType] = useState<"draw" | "type">("draw");
  const [typedSignature, setTypedSignature] = useState("");
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const signaturePadRef = useRef<SignaturePad | null>(null);

  useEffect(() => {
    if (canvasRef.current && signatureType === "draw") {
      signaturePadRef.current = new SignaturePad(canvasRef.current, {
        backgroundColor: "rgb(255, 255, 255)",
        penColor: "rgb(0, 0, 0)",
      });

      // Resize canvas to fit container
      const canvas = canvasRef.current;
      const ratio = Math.max(window.devicePixelRatio || 1, 1);
      canvas.width = canvas.offsetWidth * ratio;
      canvas.height = canvas.offsetHeight * ratio;
      canvas.getContext("2d")?.scale(ratio, ratio);
      signaturePadRef.current.clear();
    }
  }, [signatureType]);

  const clearSignature = () => {
    if (signaturePadRef.current) {
      signaturePadRef.current.clear();
    }
    setTypedSignature("");
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
              In consideration for being permitted to participate in personal
              training services, fitness instruction, and related activities
              provided by <strong>Gavin R. Stanifer</strong>, doing business as{" "}
              <strong>"FL Best Trainer"</strong>, I acknowledge, understand, and
              agree to the following:
            </p>

            <h2>Terms and Conditions</h2>

            <ol className="space-y-4">
              <li>
                <strong>Assumption of Risk:</strong> I understand and
                acknowledge that physical exercise, fitness training, and
                related activities involve inherent risks of physical injury,
                including but not limited to: muscle strains, sprains, tears,
                broken bones, heart attack, stroke, heat exhaustion,
                dehydration, and in extreme cases, permanent disability or
                death. I voluntarily assume all such risks and hazards
                incidental to such participation.
              </li>

              <li>
                <strong>Physical Condition:</strong> I represent and warrant
                that I am in good physical condition and have no medical
                condition, impairment, disease, infirmity, or other illness that
                would prevent my participation or use of equipment or that would
                increase my risk of injury or adverse health consequences. I
                acknowledge that Provider has recommended that I consult with a
                physician before beginning any exercise program.
              </li>

              <li>
                <strong>Release and Waiver:</strong> I, for myself and my heirs,
                assigns, personal representatives, and next of kin,{" "}
                <strong>
                  HEREBY RELEASE, WAIVE, DISCHARGE, AND COVENANT NOT TO SUE
                </strong>{" "}
                Gavin R. Stanifer, FL Best Trainer, and their respective
                officers, directors, employees, agents, contractors, and
                representatives from any and all liability, claims, demands,
                losses, or damages on my account caused or alleged to be caused
                in whole or in part by negligence or otherwise.
              </li>

              <li>
                <strong>Indemnification:</strong> I agree to indemnify and hold
                harmless the Released Parties from any loss, liability, damage,
                or cost they may incur arising out of or related to my
                participation in activities, whether caused by my own actions or
                inactions, those of others participating in the activity, the
                conditions in which the activities take place, or negligence.
              </li>

              <li>
                <strong>Medical Treatment:</strong> I consent to receive medical
                treatment that may be deemed advisable in the event of injury,
                accident, and/or illness during participation. I understand and
                agree that I am solely responsible for all costs related to
                medical treatment and transportation.
              </li>

              <li>
                <strong>Media Release:</strong> I grant to the Released Parties
                the irrevocable right and permission to photograph, videotape,
                or otherwise record my participation and to use such recordings
                for promotional, educational, or commercial purposes without
                compensation to me.
              </li>

              <li>
                <strong>Equipment Use:</strong> I acknowledge that I am
                responsible for inspecting any equipment before use and will
                immediately report any unsafe conditions. I will use equipment
                only as instructed and within my capabilities.
              </li>

              <li>
                <strong>Severability:</strong> If any provision of this
                agreement is held to be invalid or unenforceable, the remaining
                provisions shall continue in full force and effect.
              </li>

              <li>
                <strong>Governing Law:</strong> This agreement shall be governed
                by the laws of the State of Florida. Any disputes arising under
                this agreement shall be resolved exclusively in the courts of
                Florida, and I consent to the jurisdiction of such courts.
              </li>

              <li>
                <strong>Entire Agreement:</strong> This document constitutes the
                entire agreement between the parties and supersedes any prior
                understandings or agreements.
              </li>
            </ol>

            <div className="bg-yellow-900/20 border border-yellow-500 p-4 rounded-md mt-6">
              <p className="text-yellow-300 font-bold">
                <strong>ACKNOWLEDGMENT:</strong> By signing below, I acknowledge
                that I have read this agreement, fully understand its terms,
                understand that I am giving up substantial rights including my
                right to sue, and have signed it freely and without any
                inducement or assurance of any nature. This is a legally binding
                electronic document.
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
                  setSubmitted(true);
                  form.reset();
                  clearSignature();
                } else {
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
                className="w-full rounded-md bg-white/10 border border-white/20 p-3 text-white placeholder-white/50 focus:border-royal focus:ring-1 focus:ring-royal"
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
                <div className="bg-white rounded-md p-4">
                  <canvas
                    ref={canvasRef}
                    className="w-full h-32 border border-gray-300 rounded cursor-crosshair"
                    style={{ touchAction: "none" }}
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
              </div>
            )}
          </form>

          <div className="mt-12 border-t border-white/10 pt-8">
            <p className="text-white/60 text-sm mb-4">
              Questions about this waiver? Contact us before signing.
            </p>
            <Link
              href="/"
              className="text-royal hover:text-royal-light transition-colors"
            >
              ← Return to Home
            </Link>
          </div>
        </div>
      </div>
    </Layout>
  );
}
