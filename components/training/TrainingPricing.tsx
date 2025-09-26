import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  FaCheck,
  FaArrowRight,
  FaInfoCircle,
  FaStar,
  FaMedal,
  FaUsers,
  FaHandshake,
  FaRegClock,
  FaMapMarkerAlt,
  FaPercent,
  FaDumbbell,
  FaCalendarAlt,
  FaExclamationTriangle,
} from "react-icons/fa";

export default function TrainingPricing() {
  // Enhanced plan features to show clearer value progression
  const plans = [
    {
      name: "Trial Session",
      sessions: "1 Session",
      description: "Perfect for trying out in-home personal training",
      price: 150,
      priceDetails: "per session",
      features: [
        "Full 60-minute training session",
        "Fitness assessment",
        "Custom workout for your space",
        "Equipment recommendations",
        "Form guidance and technique tips",
      ],
      popular: false,
      icon: null,
      savings: null,
    },
    {
      name: "Starter Package",
      sessions: "8 Sessions",
      description: "Recommended for training twice a week",
      price: 130,
      priceDetails: "per session",
      features: [
        "Eight 60-minute sessions",
        "Comprehensive fitness assessment",
        "Custom workout program",
        "Nutrition recommendations",
        "Form guidance and technique tips",
      ],
      popular: false,
      icon: <FaStar className="text-royal-light w-5 h-5 mr-2" />,
      savings: "$160 savings",
    },
    {
      name: "Commitment",
      sessions: "12 Sessions",
      description: "Recommended for training 3 times a week",
      price: 120,
      priceDetails: "per session",
      features: [
        "Twelve 60-minute sessions",
        "Detailed fitness assessment",
        "Personalized workout program",
        "Custom nutrition advice",
        "Equipment recommendations",
        "Form guidance and technique tips",
      ],
      popular: true,
      icon: <FaMedal className="text-royal-light w-5 h-5 mr-2" />,
      savings: "$360 savings",
    },
    {
      name: "Transform",
      sessions: "24 Sessions",
      description: "Our most comprehensive package",
      price: 100,
      priceDetails: "per session",
      features: [
        "Twenty-four 60-minute sessions",
        "Advanced personalized program",
        "Premium scheduling priority",
        "Comprehensive fitness assessment",
        "Expert form guidance",
        "Customized program adjustments",
      ],
      popular: false,
      icon: <FaUsers className="text-royal-light w-5 h-5 mr-2" />,
      savings: "$1,200 savings",
    },
  ];

  // Add this function at the top of your component to detect mobile devices
  const isMobileDevice = () => {
    if (typeof window !== "undefined") {
      return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      );
    }
    return false;
  };

  // Then add this within your component before the return statement
  const handlePackageClick = (e, packageName) => {
    e.preventDefault();

    const isMobile = isMobileDevice();
    const packageTexts = {
      "Trial Session":
        "Hi Gavin, I'm interested in booking a Trial Session for $150. Please send me details!",
      "Starter Package":
        "Hi Gavin, I'd like to get the 8-Session Starter Package $130/session. Please send me more information.",
      Commitment:
        "Hi Gavin, I want to purchase the 12-Session Commitment Package at $120/session. Could you send me details?",
      Transform:
        "Hi Gavin, I'm interested in your 24-Session Transform Package at $100/session. Please send me more information!",
    };

    const message =
      packageTexts[packageName] ||
      "Hi Gavin, I'm interested in personal training. Please contact me.";

    if (isMobile) {
      window.location.href = `sms:9285871309?body=${encodeURIComponent(
        message
      )}`;
    } else {
      window.location.href = `mailto:flbesttrainer@gmail.com?subject=Interest in ${encodeURIComponent(
        packageName
      )}&body=${encodeURIComponent(message)}`;
    }
  };

  // Add state for scroll indicator
  const [showScrollIndicator, setShowScrollIndicator] = useState(true);

  // Hide scroll indicator after scrolling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 200) {
        setShowScrollIndicator(false);
      }
    };

    window.addEventListener("scroll", handleScroll);

    // Auto-hide after 5 seconds
    const timer = setTimeout(() => {
      setShowScrollIndicator(false);
    }, 5000);

    return () => {
      window.removeEventListener("scroll", handleScroll);
      clearTimeout(timer);
    };
  }, []);

  return (
    <section
      id="pricing"
      className="py-16 sm:py-20 bg-gradient-to-b from-navy-dark to-navy relative"
    >
      <div
        className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"
        loading="lazy"
      ></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="text-center max-w-3xl mx-auto mb-10 sm:mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Training <span className="text-royal-light">Packages</span>
          </motion.h2>
          <motion.p
            className="text-lg text-white/70"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.1 }}
          >
            Flexible packages designed to fit your schedule and fitness goals
          </motion.p>
        </div>

        {/* Partner/Friend Training Highlight Box */}
        <motion.div
          className="mb-8 sm:mb-10 bg-gradient-to-r from-amber-600/20 to-amber-800/20 border border-amber-500/30 rounded-xl p-4 sm:p-5 max-w-4xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5 }}
        >
          <div className="flex items-start flex-col md:flex-row">
            <div className="bg-amber-500/30 rounded-full p-3 mb-4 md:mb-0 md:mr-5 shrink-0">
              <FaHandshake className="text-amber-400 w-6 h-6 sm:w-8 sm:h-8" />
            </div>
            <div className="flex-grow">
              <h3 className="text-xl font-bold text-white mb-2">
                SPECIAL OFFER: Back-to-Back Training Discount
              </h3>
              <p className="text-white/80">
                <span className="text-amber-400 font-medium text-lg">
                  Save up to 15% additional
                </span>{" "}
                when you and a friend or partner book back-to-back sessions at
                the <strong className="text-white">same location</strong>.
                Contact me directly to receive this special offer!
              </p>
              <div className="mt-4 grid grid-cols-1 xs:grid-cols-2 md:grid-cols-3 gap-3">
                <a
                  href="mailto:flbesttrainer@gmail.com?subject=Back-to-Back Training Special Offer&body=Hi Gavin, I'm interested in the back-to-back training special offer. I'd like to train with a friend/partner at the same location. Please send me more details."
                  className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium text-sm transition-all duration-300 active:bg-amber-700 active:scale-95 touch-manipulation"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                    />
                  </svg>
                  <span className="whitespace-nowrap">Email About Offer</span>
                </a>
                <a
                  href="sms:9285871309?body=Hi Gavin, I'm interested in the back-to-back training special offer. Please send me details."
                  className="inline-flex items-center justify-center px-4 py-2 bg-amber-600 hover:bg-amber-500 text-white rounded-lg font-medium text-sm transition-all duration-300 active:bg-amber-700 active:scale-95 touch-manipulation"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z"
                    />
                  </svg>
                  <span className="whitespace-nowrap">Text About Offer</span>
                </a>
                <a
                  href="tel:9285871309"
                  className="inline-flex items-center justify-center px-4 py-2 bg-royal hover:bg-royal-light text-white rounded-lg font-medium text-sm transition-all duration-300 xs:col-span-2 md:col-span-1 active:bg-royal-dark active:scale-95 touch-manipulation"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-2 flex-shrink-0"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                    />
                  </svg>
                  <span className="whitespace-nowrap">
                    Got Questions? Call Me
                  </span>
                </a>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Mobile scroll indicator */}
        {showScrollIndicator && (
          <div className="lg:hidden flex items-center justify-center text-white/50 text-xs mt-2 mb-6 animate-pulse">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-4 w-4 mr-1"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4"
              />
            </svg>
            Scroll to see all packages
          </div>
        )}

        {/* Pricing Cards - Optimized for all screen sizes */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 sm:gap-8">
          {plans.map((plan, index) => (
            <motion.div
              key={index}
              className={`
                bg-black/30 backdrop-blur-sm border rounded-2xl overflow-hidden flex flex-col
                ${
                  plan.popular
                    ? "border-royal/40 shadow-lg shadow-royal/20"
                    : index === 3
                    ? "border-amber-500/40 shadow-lg shadow-amber-500/20"
                    : "border-white/10"
                }
                transition-all duration-300 hover:border-royal/30 hover:shadow-lg hover:shadow-royal/10
                ${
                  index === 3
                    ? "hover:border-amber-500/50 hover:shadow-amber-500/20"
                    : ""
                }
                ${index === 3 ? "lg:mt-[-16px]" : ""}
              `}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Banner content */}
              {plan.popular && (
                <div className="bg-royal text-white text-center text-sm font-bold py-2 relative overflow-hidden">
                  MOST POPULAR
                  <span className="absolute inset-0 bg-white/10 transform -skew-x-12 animate-shine"></span>
                </div>
              )}

              {index === 3 && (
                <motion.div
                  className="bg-gradient-to-r from-amber-500 to-amber-700 text-white text-center text-sm font-bold py-3 relative overflow-hidden"
                  initial={{ backgroundPosition: "200% 0" }}
                  animate={{ backgroundPosition: "0% 0" }}
                  transition={{
                    duration: 1.5,
                    repeat: Infinity,
                    repeatType: "mirror",
                  }}
                >
                  BEST VALUE! SAVE $1,200
                  <span className="absolute inset-0 bg-white/10 transform -skew-x-12 animate-shine"></span>
                </motion.div>
              )}

              {/* Card content */}
              <div
                className={`p-5 sm:p-6 md:p-8 flex flex-col h-full ${
                  index === 3
                    ? "bg-gradient-to-b from-amber-900/10 to-black/30 lg:pb-[calc(2rem+16px)]"
                    : ""
                }`}
              >
                <div>
                  <div className="flex items-center mb-1">
                    {index === 3 ? (
                      <div className="text-amber-400 w-5 h-5 mr-2 flex-shrink-0">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          fill="currentColor"
                        >
                          <path
                            fillRule="evenodd"
                            d="M12 1.5a5.25 5.25 0 00-5.25 5.25v3a3 3 0 00-3 3v6.75a3 3 0 003 3h10.5a3 3 0 003-3v-6.75a3 3 0 00-3-3v-3c0-2.9-2.35-5.25-5.25-5.25zm3.75 8.25v-3a3.75 3.75 0 10-7.5 0v3h7.5z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </div>
                    ) : (
                      plan.icon && (
                        <div className="flex-shrink-0">{plan.icon}</div>
                      )
                    )}
                    <h3
                      className={`text-xl sm:text-2xl font-bold ${
                        index === 3 ? "text-amber-400" : "text-white"
                      }`}
                    >
                      {plan.name}
                    </h3>
                  </div>
                  <p
                    className={`font-medium mb-2 ${
                      index === 3 ? "text-amber-300" : "text-royal-light"
                    }`}
                  >
                    {plan.sessions}
                  </p>
                  <p className="text-white/70 mb-4 text-sm sm:text-base">
                    {plan.description}
                  </p>

                  <div className="mb-2">
                    <span
                      className={`text-3xl sm:text-4xl font-bold ${
                        index === 3 ? "text-amber-400" : "text-white"
                      }`}
                    >
                      ${plan.price}
                    </span>
                    <span className="text-white/70 ml-1 text-sm sm:text-base">
                      {plan.priceDetails}
                    </span>
                  </div>

                  {plan.savings && (
                    <div
                      className={`mb-5 p-2 text-center rounded-lg ${
                        index === 3
                          ? "bg-gradient-to-r from-amber-700/30 to-amber-500/30 border border-amber-500/30"
                          : "bg-royal/20"
                      }`}
                    >
                      <span
                        className={`font-medium ${
                          index === 3 ? "text-amber-400" : "text-royal-light"
                        }`}
                      >
                        {plan.savings}
                      </span>
                    </div>
                  )}

                  {index === 3 && (
                    <motion.div
                      className="mb-5 bg-gradient-to-r from-amber-700/20 to-amber-500/20 rounded-lg p-2 sm:p-3 border border-amber-500/20"
                      animate={{
                        boxShadow: [
                          "0 0 0 rgba(245, 158, 11, 0)",
                          "0 0 10px rgba(245, 158, 11, 0.3)",
                          "0 0 0 rgba(245, 158, 11, 0)",
                        ],
                      }}
                      transition={{
                        duration: 2,
                        repeat: Infinity,
                        repeatType: "reverse",
                      }}
                    >
                      <p className="text-white/90 text-xs sm:text-sm flex items-start">
                        <span className="text-amber-400 mr-2 mt-0.5">⭐</span>
                        <span>
                          Includes{" "}
                          <strong className="text-white">ALL benefits</strong>{" "}
                          from other packages plus premium features
                        </span>
                      </p>
                    </motion.div>
                  )}

                  <div className="space-y-2 sm:space-y-3 mb-6 sm:mb-8 text-sm sm:text-base">
                    {plan.features.map((feature, i) => (
                      <div key={i} className="flex items-start">
                        <FaCheck
                          className={`mt-1 mr-3 flex-shrink-0 ${
                            index === 3 ? "text-amber-400" : "text-royal-light"
                          }`}
                        />
                        <span className="text-white/80">{feature}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-auto">
                  <a
                    href="#"
                    onClick={(e) => handlePackageClick(e, plan.name)}
                    className={`
                      inline-flex items-center justify-center w-full py-2.5 sm:py-3.5 px-5 sm:px-6 
                      rounded-lg sm:rounded-xl font-medium text-white text-sm sm:text-base
                      shadow-lg group relative overflow-hidden sm:touch-none touch-manipulation
                      ${
                        plan.popular
                          ? "bg-royal shadow-royal/20 hover:shadow-royal/40 active:bg-royal-dark"
                          : index === 3
                          ? "bg-gradient-to-r from-amber-600 to-amber-700 shadow-amber-600/20 hover:shadow-amber-500/40 active:from-amber-700 active:to-amber-800"
                          : "bg-white/10 hover:bg-white/15 border border-white/10 hover:border-white/20 shadow-black/20 active:bg-white/20"
                      }
                      transition-all duration-300 hover:translate-y-[-2px] active:translate-y-0 active:scale-[0.98]
                      ${index === 3 ? "py-3.5 sm:py-4" : ""}
                    `}
                  >
                    <span
                      className={`
                      absolute inset-0 w-0 bg-gradient-to-r 
                      ${
                        plan.popular
                          ? "from-royal-light/20 to-royal/0"
                          : index === 3
                          ? "from-amber-500/20 to-amber-700/0"
                          : "from-white/5 to-transparent"
                      }
                      transition-all duration-700 group-hover:w-full
                    `}
                    ></span>

                    <div className="flex items-center justify-center relative z-10">
                      {index === 0 && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"
                          />
                        </svg>
                      )}
                      {index === 3 && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M12 8v13m0-13V6a4 4 0 00-4-4H8.8a4 4 0 00-3.2 1.6"
                          />
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M5 3v5.4a4 4 0 001.504 3.136l.72.72a4 4 0 01.776 4.536l-.704 1.408A4 4 0 0010.816 21h2.368a4 4 0 004-4v-5"
                          />
                        </svg>
                      )}
                      {index === 2 && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                      )}
                      {index === 1 && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          className="h-4 w-4 mr-2 flex-shrink-0"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={2}
                            d="M13 10V3L4 14h7v7l9-11h-7z"
                          />
                        </svg>
                      )}
                      <span>
                        {index === 0
                          ? "Book Trial Session"
                          : index === 3
                          ? "Transform Your Mind & Body"
                          : index === 2
                          ? "Get Popular Package"
                          : "Get Starter Package"}
                      </span>
                      <FaArrowRight
                        className={`ml-2 flex-shrink-0 transform transition-transform duration-300 group-hover:translate-x-1 ${
                          index === 3 ? "text-amber-200" : ""
                        }`}
                      />
                    </div>
                  </a>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Simple FAQ Section */}
        <motion.div
          className="mt-12 mb-10 max-w-3xl mx-auto px-4"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.3 }}
        >
          <h3 className="text-2xl font-bold text-white text-center mb-6">
            Frequently Asked <span className="text-royal-light">Questions</span>
          </h3>

          <div className="space-y-4">
            <div className="bg-black/30 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 flex items-center">
                <FaRegClock className="text-royal-light mr-3 flex-shrink-0" />
                How long are the training sessions?
              </h4>
              <p className="text-white/80 text-sm">
                All sessions are 60 minutes in duration, including setup and
                breakdown time. This ensures you get a full, effective workout
                while respecting your schedule.
              </p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 flex items-center">
                <FaDumbbell className="text-royal-light mr-3 flex-shrink-0" />
                Do I need equipment for my home workouts?
              </h4>
              <p className="text-white/80 text-sm">
                I can create an effective workout with minimal equipment. I
                bring essential items to each session, and will adapt to
                whatever you have available. For long-term clients, I'll provide
                personalized recommendations for equipment that would enhance
                your specific fitness journey.
              </p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 flex items-center">
                <FaCalendarAlt className="text-royal-light mr-3 flex-shrink-0" />
                How do I schedule my sessions?
              </h4>
              <p className="text-white/80 text-sm">
                After purchasing a package, I'll contact you to set up a
                schedule that works best for you. The Commitment and Transform
                packages include scheduling priority to ensure you get your
                preferred time slots.
              </p>
            </div>

            <div className="bg-black/30 border border-white/10 rounded-lg p-4">
              <h4 className="text-white font-medium mb-2 flex items-center">
                <FaExclamationTriangle className="text-royal-light mr-3 flex-shrink-0" />
                What is your cancellation policy?
              </h4>
              <p className="text-white/80 text-sm">
                I require 72 hours notice for cancellations to avoid being
                charged for the session. I understand emergencies happen, so
                please contact me as soon as possible if you need to reschedule.
              </p>
            </div>
          </div>
        </motion.div>

        {/* Special Pricing Notes */}
        <motion.div
          className="mt-10 sm:mt-12 bg-black/40 border border-white/10 rounded-xl p-4 sm:p-6 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <h3 className="text-lg sm:text-xl font-bold text-white mb-3 sm:mb-4 flex items-center">
            <FaInfoCircle className="mr-3 text-royal-light flex-shrink-0" />
            Additional Pricing Information
          </h3>
          <ul className="space-y-2 sm:space-y-3 text-sm sm:text-base">
            <li className="flex items-start">
              <FaPercent className="text-amber-400 mt-1 mr-3 flex-shrink-0" />
              <span className="text-white/80">
                <strong className="text-white">
                  Back-to-Back Training Special:
                </strong>{" "}
                Save up to 15% when you and a friend/partner book sessions at
                the same location on the same day. Contact me for details on
                this exclusive offer.
              </span>
            </li>
            <li className="flex items-start">
              <FaMapMarkerAlt className="text-royal-light mt-1 mr-3 flex-shrink-0" />
              <span className="text-white/80">
                Prices may vary based on travel distance to your location
              </span>
            </li>
            <li className="flex items-start">
              <FaRegClock className="text-royal-light mt-1 mr-3 flex-shrink-0" />
              <span className="text-white/80">
                All sessions are 60 minutes in duration and include
                setup/breakdown time
              </span>
            </li>
          </ul>

          {/* Got Questions Section */}
          <div className="mt-6 pt-5 border-t border-white/10">
            <div className="flex flex-col items-center text-center mb-4">
              <div className="flex items-center mb-2">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 mr-2 text-royal-light"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <span className="text-white font-medium">
                  Got questions about packages?
                </span>
              </div>
              <p className="text-white/70 text-sm max-w-md">
                I'm here to help with any questions you may have about training
                packages
              </p>
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <a
                href="tel:9285871309"
                className="inline-flex items-center px-5 py-2.5 bg-royal hover:bg-royal-light text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-royal/10 hover:shadow-royal/20 active:bg-royal-dark active:scale-95 touch-manipulation"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
                  />
                </svg>
                Call (928) 587-1309
              </a>
              <a
                href="mailto:flbesttrainer@gmail.com?subject=Question about Training Packages&body=Hi Gavin, I have a question about your training packages."
                className="inline-flex items-center px-5 py-2.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-amber-600/10 hover:shadow-amber-500/20 active:bg-amber-700 active:scale-95 touch-manipulation"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-2"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
                Email Gavin Stanifer
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
