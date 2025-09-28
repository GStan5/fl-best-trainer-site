import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/router";
import { motion } from "framer-motion";
import SEO from "../components/shared/SEO";
import {
  FaUser,
  FaPhone,
  FaMapMarkerAlt,
  FaFileContract,
  FaCheckCircle,
  FaArrowRight,
  FaArrowLeft,
} from "react-icons/fa";

interface OnboardingData {
  firstName: string;
  lastName: string;
  phone: string;
  address: string;
  emergencyContactName: string;
  emergencyContactPhone: string;
}

export default function Onboarding() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);
  const [formData, setFormData] = useState<OnboardingData>({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
    emergencyContactName: "",
    emergencyContactPhone: "",
  });

  useEffect(() => {
    if (status === "loading") return;

    if (!session) {
      router.push("/auth/signin");
      return;
    }

    checkOnboardingStatus();
  }, [session, status]);

  const checkOnboardingStatus = async () => {
    try {
      const response = await fetch("/api/onboarding/status");
      const data = await response.json();

      if (data.success) {
        // If user doesn't need onboarding, redirect to classes
        if (!data.user.needsOnboarding && !data.user.needsWaiver) {
          router.push("/classes");
          return;
        }

        // Pre-fill form with existing data
        if (data.user.first_name) {
          setFormData((prev) => ({
            ...prev,
            firstName: data.user.first_name || "",
            lastName: data.user.last_name || "",
            phone: data.user.phone || "",
            address: data.user.address || "",
            emergencyContactName: data.user.emergency_contact_name || "",
            emergencyContactPhone: data.user.emergency_contact_phone || "",
          }));
        }
      }
    } catch (error) {
      console.error("Error checking onboarding status:", error);
    } finally {
      setCheckingStatus(false);
    }
  };

  const handleInputChange = (field: keyof OnboardingData, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleNextStep = () => {
    if (currentStep < 3) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
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

      const data = await response.json();

      if (data.success) {
        // Set redirect URL for after waiver completion
        localStorage.setItem("redirectAfterWaiver", "/classes");
        // Redirect to waiver page
        window.location.href = "/waiver";
      } else {
        console.error("Failed to save onboarding info");
        alert("Failed to save your information. Please try again.");
      }
    } catch (error) {
      console.error("Error saving onboarding info:", error);
      alert("Failed to save your information. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (status === "loading" || checkingStatus) {
    return (
      <>
        <SEO
          title="Loading | Set Up Your Account - FL Best Trainer"
          description="Complete your account setup to start booking fitness classes with FL Best Trainer"
        />
        <div className="min-h-screen bg-gradient-to-br from-royal-dark via-royal-navy to-black flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-royal-light mx-auto mb-4"></div>
            <p className="text-white">Loading...</p>
          </div>
        </div>
      </>
    );
  }

  if (!session) {
    return null; // Will redirect to signin
  }

  return (
    <>
      <SEO
        title="Welcome | Set Up Your Account - FL Best Trainer"
        description="Complete your account setup to start booking fitness classes with FL Best Trainer"
      />

      <div className="min-h-screen bg-gradient-to-br from-royal-dark via-royal-navy to-black flex items-center justify-center py-8 px-4">
        <div className="w-full max-w-2xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-royal-dark to-royal-navy rounded-2xl border border-royal-light/20 p-4 sm:p-6 md:p-8 shadow-2xl"
          >
            {/* Header */}
            <div className="text-center mb-6 sm:mb-8">
              <FaCheckCircle className="text-royal-light text-3xl sm:text-4xl mx-auto mb-3 sm:mb-4" />
              <h1 className="text-2xl sm:text-3xl font-bold text-white mb-2">
                Welcome to FL Best Trainer!
              </h1>
              <p className="text-white/70 text-sm sm:text-base">
                Let's get you set up with just a few quick details
              </p>
            </div>

            {/* Step Indicator */}
            <div className="flex items-center justify-center mb-6 sm:mb-8">
              {[1, 2, 3].map((step) => (
                <div key={step} className="flex items-center">
                  <div
                    className={`w-7 h-7 sm:w-8 sm:h-8 rounded-full flex items-center justify-center text-xs sm:text-sm font-semibold ${
                      step <= currentStep
                        ? "bg-royal-light text-royal-dark"
                        : "bg-white/20 text-white/50"
                    }`}
                  >
                    {step}
                  </div>
                  {step < 3 && (
                    <div
                      className={`w-8 sm:w-12 h-1 mx-1 sm:mx-2 ${
                        step < currentStep ? "bg-royal-light" : "bg-white/20"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            {/* Step Content */}
            <div className="min-h-[350px] sm:min-h-[400px]">
              {/* Step 1: Personal Information */}
              {currentStep === 1 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-4 sm:mb-6">
                    <FaUser className="text-royal-light text-2xl sm:text-3xl mx-auto mb-2" />
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      Personal Information
                    </h3>
                    <p className="text-white/60 text-sm sm:text-base">
                      Tell us a bit about yourself
                    </p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstName}
                        onChange={(e) =>
                          handleInputChange("firstName", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-royal-light focus:border-transparent"
                        placeholder="Enter your first name"
                      />
                    </div>
                    <div>
                      <label className="block text-white text-sm font-medium mb-2">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastName}
                        onChange={(e) =>
                          handleInputChange("lastName", e.target.value)
                        }
                        className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-royal-light focus:border-transparent"
                        placeholder="Enter your last name"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phone}
                      onChange={(e) =>
                        handleInputChange("phone", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-royal-light focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Address (Optional)
                    </label>
                    <input
                      type="text"
                      value={formData.address}
                      onChange={(e) =>
                        handleInputChange("address", e.target.value)
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-royal-light focus:border-transparent"
                      placeholder="Enter your address"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 2: Emergency Contact */}
              {currentStep === 2 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="space-y-6"
                >
                  <div className="text-center mb-4 sm:mb-6">
                    <FaPhone className="text-royal-light text-2xl sm:text-3xl mx-auto mb-2" />
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      Emergency Contact
                    </h3>
                    <p className="text-white/60 text-sm sm:text-base">
                      Someone we can contact in case of emergency
                    </p>
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Emergency Contact Name *
                    </label>
                    <input
                      type="text"
                      value={formData.emergencyContactName}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactName",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-royal-light focus:border-transparent"
                      placeholder="Enter emergency contact name"
                    />
                  </div>

                  <div>
                    <label className="block text-white text-sm font-medium mb-2">
                      Emergency Contact Phone *
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyContactPhone}
                      onChange={(e) =>
                        handleInputChange(
                          "emergencyContactPhone",
                          e.target.value
                        )
                      }
                      className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-royal-light focus:border-transparent"
                      placeholder="(555) 123-4567"
                    />
                  </div>
                </motion.div>
              )}

              {/* Step 3: Complete Setup */}
              {currentStep === 3 && (
                <motion.div
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="text-center space-y-6"
                >
                  <div className="mb-4 sm:mb-6">
                    <FaFileContract className="text-royal-light text-2xl sm:text-3xl mx-auto mb-2" />
                    <h3 className="text-lg sm:text-xl font-semibold text-white">
                      Ready for Your Waiver
                    </h3>
                    <p className="text-white/60 text-sm sm:text-base">
                      We'll save your info and take you to complete the
                      liability waiver
                    </p>
                  </div>

                  <div className="bg-white/5 border border-white/10 rounded-lg p-6 text-left">
                    <h4 className="text-white font-semibold mb-3">
                      Final Step:
                    </h4>
                    <ol className="list-decimal list-inside space-y-2 text-white/80 mb-6">
                      <li>Click the button below to save your information</li>
                      <li>You'll be redirected to the liability waiver</li>
                      <li>Complete and submit the waiver</li>
                      <li>
                        You'll be automatically redirected back to classes
                      </li>
                      <li>Your registration will be complete!</li>
                    </ol>

                    <div className="bg-amber-500/10 border border-amber-500/30 rounded-lg p-4">
                      <p className="text-amber-200 text-sm">
                        <strong>Important:</strong> Your personal information
                        will be saved securely, then you'll complete the waiver
                        to finish registration.
                      </p>
                    </div>
                  </div>
                </motion.div>
              )}
            </div>

            {/* Navigation Buttons */}
            <div className="flex justify-between mt-6 sm:mt-8">
              <button
                onClick={handlePrevStep}
                disabled={currentStep === 1}
                className={`flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
                  currentStep === 1
                    ? "bg-white/10 text-white/50 cursor-not-allowed"
                    : "bg-white/20 text-white hover:bg-white/30"
                }`}
              >
                <FaArrowLeft className="text-xs sm:text-sm" />
                <span className="hidden sm:inline">Previous</span>
                <span className="sm:hidden">Prev</span>
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
                  className={`flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 text-sm sm:text-base ${
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
                  <FaArrowRight className="text-xs sm:text-sm" />
                </button>
              ) : (
                <button
                  onClick={saveInfoAndRedirectToWaiver}
                  disabled={isLoading}
                  className={`flex items-center gap-1 sm:gap-2 px-4 sm:px-6 py-3 sm:py-4 font-semibold rounded-lg transition-all duration-300 transform hover:scale-105 text-sm sm:text-base ${
                    isLoading
                      ? "bg-white/10 text-white/50 cursor-not-allowed"
                      : "bg-royal-light text-royal-dark hover:bg-white"
                  }`}
                >
                  {isLoading ? (
                    <>
                      <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-royal-dark"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <span className="hidden sm:inline">
                        Save Info & Complete Waiver
                      </span>
                      <span className="sm:hidden">Save & Continue</span>
                      <FaArrowRight className="text-xs sm:text-sm" />
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Step Progress */}
            <div className="mt-6 text-center">
              <p className="text-white/50 text-sm">
                Step {currentStep} of 3 • All information is securely stored and
                never shared
              </p>
            </div>
          </motion.div>
        </div>
      </div>
    </>
  );
}
