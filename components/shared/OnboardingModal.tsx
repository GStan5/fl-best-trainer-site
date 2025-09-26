import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { useSession } from "next-auth/react";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaFileContract,
  FaCheckCircle,
} from "react-icons/fa";

interface OnboardingModalProps {
  isOpen: boolean;
  onComplete: () => void;
}

interface OnboardingData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export default function OnboardingModal({
  isOpen,
  onComplete,
}: OnboardingModalProps) {
  const { data: session } = useSession();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<OnboardingData>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      const nextStep = currentStep + 1;
      setCurrentStep(nextStep);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSubmit = async () => {
    setIsLoading(true);
    try {
      // Double-check waiver status before submitting
      const statusResponse = await fetch("/api/onboarding/status");
      const statusData = await statusResponse.json();

      if (!statusData.success || !statusData.user?.waiver_signed) {
        alert("Please complete the waiver before finishing setup.");
        setIsLoading(false);
        return;
      }

      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        onComplete();
      } else {
        console.error("Failed to complete onboarding");
      }
    } catch (error) {
      console.error("Error completing onboarding:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const openWaiverInNewTab = () => {
    window.open("/waiver", "_blank");
  };

  const saveInfoAndRedirectToWaiver = async () => {
    setIsLoading(true);
    try {
      // Save the user's onboarding info first
      const response = await fetch("/api/onboarding/complete", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        // Store the current page URL for redirect after waiver
        const currentUrl = window.location.href;
        localStorage.setItem("redirectAfterWaiver", currentUrl);

        // Redirect to waiver page
        window.location.href = "/waiver";
      } else {
        console.error("Failed to save onboarding info");
        alert("Failed to save your information. Please try again.");
      }
    } catch (error) {
      console.error("Error saving onboarding info:", error);
      alert("Error saving your information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-start justify-center p-4"
      style={{ paddingTop: "15vh" }}
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-gradient-to-br from-royal-dark to-royal-navy rounded-2xl border border-royal-light/20 p-6 sm:p-8 w-full max-w-2xl max-h-[80vh] overflow-y-auto"
      >
        {/* Header */}
        <div className="text-center mb-8">
          <FaCheckCircle className="text-royal-light text-4xl mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-white mb-2">
            Welcome to FL Best Trainer!
          </h2>
          <p className="text-white/70">
            Let's get you set up with just a few quick details
          </p>
        </div>

        {/* Progress Bar */}
        <div className="flex justify-center mb-8">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                    step <= currentStep
                      ? "bg-royal-light text-royal-dark"
                      : "bg-white/20 text-white/50"
                  }`}
                >
                  {step}
                </div>
                {step < 3 && (
                  <div
                    className={`w-12 h-1 mx-2 ${
                      step < currentStep ? "bg-royal-light" : "bg-white/20"
                    }`}
                  />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* Step Content */}
        <div className="min-h-[300px]">
          {currentStep === 1 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <FaUser className="text-royal-light text-3xl mx-auto mb-2" />
                <h3 className="text-xl font-semibold text-white">
                  Personal Information
                </h3>
                <p className="text-white/60">Tell us a bit about yourself</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    First Name *
                  </label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) =>
                      handleInputChange("firstName", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-royal-light focus:ring-1 focus:ring-royal-light"
                    placeholder="Enter your first name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) =>
                      handleInputChange("lastName", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-royal-light focus:ring-1 focus:ring-royal-light"
                    placeholder="Enter your last name"
                    required
                  />
                </div>

                <div className="md:col-span-2">
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Phone Number *
                  </label>
                  <input
                    type="tel"
                    value={formData.phone}
                    onChange={(e) => handleInputChange("phone", e.target.value)}
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-royal-light focus:ring-1 focus:ring-royal-light"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 2 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <FaMapMarkerAlt className="text-royal-light text-3xl mx-auto mb-2" />
                <h3 className="text-xl font-semibold text-white">
                  Contact & Emergency Info
                </h3>
                <p className="text-white/60">
                  Help us stay connected and keep you safe
                </p>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Address (Optional)
                  </label>
                  <textarea
                    value={formData.address}
                    onChange={(e) =>
                      handleInputChange("address", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-royal-light focus:ring-1 focus:ring-royal-light"
                    placeholder="Street address, city, state, zip"
                    rows={3}
                  />
                  <p className="text-white/50 text-xs mt-1">
                    This helps us with scheduling and logistics for in-home
                    sessions
                  </p>
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Emergency Contact Name *
                  </label>
                  <input
                    type="text"
                    value={formData.emergencyContactName}
                    onChange={(e) =>
                      handleInputChange("emergencyContactName", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-royal-light focus:ring-1 focus:ring-royal-light"
                    placeholder="Emergency contact full name"
                    required
                  />
                </div>

                <div>
                  <label className="block text-white/80 text-sm font-medium mb-2">
                    Emergency Contact Phone *
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContactPhone}
                    onChange={(e) =>
                      handleInputChange("emergencyContactPhone", e.target.value)
                    }
                    className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:border-royal-light focus:ring-1 focus:ring-royal-light"
                    placeholder="(555) 123-4567"
                    required
                  />
                </div>
              </div>
            </motion.div>
          )}

          {currentStep === 3 && (
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="space-y-6"
            >
              <div className="text-center mb-6">
                <FaFileContract className="text-royal-light text-3xl mx-auto mb-2" />
                <h3 className="text-xl font-semibold text-white">
                  Ready for Your Waiver
                </h3>
                <p className="text-white/60">
                  We'll save your info and take you to complete the liability
                  waiver
                </p>
              </div>

              <div className="bg-white/5 border border-white/10 rounded-lg p-6">
                <h4 className="text-white font-semibold mb-3">Final Step:</h4>
                <ol className="list-decimal list-inside space-y-2 text-white/80 mb-6">
                  <li>Click the button below to save your information</li>
                  <li>You'll be redirected to the liability waiver</li>
                  <li>Complete and submit the waiver</li>
                  <li>You'll be automatically redirected back here</li>
                  <li>Your registration will be complete!</li>
                </ol>

                <button
                  onClick={saveInfoAndRedirectToWaiver}
                  disabled={isLoading}
                  className={`w-full px-6 py-4 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 ${
                    isLoading
                      ? "bg-white/10 text-white/50 cursor-not-allowed"
                      : "bg-royal-light text-royal-dark hover:bg-white"
                  }`}
                >
                  {isLoading ? (
                    <div className="flex items-center justify-center">
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-royal-dark mr-2"></div>
                      Saving Information...
                    </div>
                  ) : (
                    "Save Info & Complete Waiver"
                  )}
                </button>

                <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                  <p className="text-amber-200 text-sm">
                    <strong>Important:</strong> Your personal information will
                    be saved securely, then you'll complete the waiver to finish
                    registration.
                  </p>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        {/* Navigation Buttons */}
        <div className="flex justify-between mt-8">
          <button
            onClick={handlePrevStep}
            disabled={currentStep === 1}
            className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
              currentStep === 1
                ? "bg-white/10 text-white/50 cursor-not-allowed"
                : "bg-white/20 text-white hover:bg-white/30"
            }`}
          >
            Previous
          </button>

          {currentStep < 3 ? (
            <button
              onClick={handleNextStep}
              disabled={
                (currentStep === 1 &&
                  (!formData.firstName ||
                    !formData.lastName ||
                    !formData.phone)) ||
                (currentStep === 2 &&
                  (!formData.emergencyContactName ||
                    !formData.emergencyContactPhone))
              }
              className={`px-6 py-3 rounded-lg font-semibold transition-all duration-300 ${
                (currentStep === 1 &&
                  (!formData.firstName ||
                    !formData.lastName ||
                    !formData.phone)) ||
                (currentStep === 2 &&
                  (!formData.emergencyContactName ||
                    !formData.emergencyContactPhone))
                  ? "bg-white/10 text-white/50 cursor-not-allowed"
                  : "bg-royal-light text-royal-dark hover:bg-white"
              }`}
            >
              Next
            </button>
          ) : null}
        </div>

        <div className="mt-6 text-center">
          <p className="text-white/50 text-sm">
            Step {currentStep} of 3 • All information is securely stored and
            never shared
          </p>
        </div>
      </motion.div>
    </div>
  );
}
