import { useState, useEffect } from "react";
import {
  FaCheck,
  FaTimes,
  FaEnvelope,
  FaMobile,
  FaCrown,
  FaArrowRight,
  FaFire,
  FaStar,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function PricingPlans() {
  const [billingCycle, setBillingCycle] = useState("3month");
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    // Check if the user is on a mobile device
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);

    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  const plans = [
    {
      title: "Basic Plan",
      description:
        "Perfect for beginners looking to start their fitness journey",
      price:
        billingCycle === "3month"
          ? "$99"
          : billingCycle === "6month"
          ? "$94" // 5% off
          : "$84", // 15% off
      period: "/month",
      totalPrice:
        billingCycle === "3month"
          ? "$297 total"
          : billingCycle === "6month"
          ? "$564 total (5% off)"
          : "$1,008 total (15% off)",
      features: [
        { text: "Customized workout program", included: true },
        { text: "Written form guides with cues", included: true },
        { text: "Monthly plan updates per request", included: true },
        { text: "Email support", included: false },
        { text: "Weekly email check-ins", included: false },
        { text: "Nutrition guidance", included: false },
        { text: "Video demonstrations", included: false },
        { text: "Priority support", included: false },
      ],
      featured: false,
      cta: "Get Started",
      emailSubject: "I'm Interested in the Basic Plan",
      emailBody:
        "Hi Gavin,\n\nI'm interested in learning more about the Basic Plan subscription for 3 months.\n\nCould you provide me with more details about getting started?\n\nThanks!",
      textMessage:
        "Hi Gavin, I'm interested in your Basic Plan for customized workouts. Can you send me details about getting started?",
      icon: <FaStar className="text-royal" />,
      color: "royal",
    },
    {
      title: "Premium Plan",
      description: "Our most popular option for dedicated fitness enthusiasts",
      price:
        billingCycle === "3month"
          ? "$199"
          : billingCycle === "6month"
          ? "$189" // 5% off
          : "$169", // 15% off
      period: "/month",
      totalPrice:
        billingCycle === "3month"
          ? "$597 total"
          : billingCycle === "6month"
          ? "$1,134 total (5% off)"
          : "$2,028 total (15% off)",
      features: [
        { text: "Customized workout program", included: true },
        { text: "Written form guides with cues", included: true },
        { text: "Bi-weekly plan updates per request", included: true },
        { text: "Full access Email support", included: true },
        { text: "Basic nutrition guidance", included: true },
        { text: "Weekly check-in calls", included: false },
        { text: "Video demonstrations", included: false },
        { text: "Priority support", included: false },
      ],
      featured: true,
      cta: "Join Premium",
      emailSubject: "I Want to Join the Premium Plan",
      emailBody: `Hi Gavin,\n\nI'd like to sign up for the Premium Plan subscription for ${
        billingCycle === "3month"
          ? "3 months"
          : billingCycle === "6month"
          ? "6 months"
          : "a year"
      }.\n\nPlease let me know the next steps for getting started with the Premium Plan.\n\nThanks!`,
      textMessage:
        "Hi Gavin, I'd like to join your Premium Plan. Can you help me get started with this subscription?",
      icon: <FaFire className="text-royal" />,
      color: "royal",
    },
    {
      title: "Elite Plan",
      description: "Comprehensive fitness solution for maximum results",
      price:
        billingCycle === "3month"
          ? "$299"
          : billingCycle === "6month"
          ? "$284" // 5% off
          : "$254", // 15% off
      period: "/month",
      totalPrice:
        billingCycle === "3month"
          ? "$897 total"
          : billingCycle === "6month"
          ? "$1,704 total (5% off)"
          : "$3,048 total (15% off)",
      features: [
        {
          text: "Video demonstrations per request",
          included: true,
          highlight: true,
        },
        {
          text: "Unlimited support access via Text",
          included: true,
          highlight: true,
        },
        { text: "FREE Access to future app", included: true, highlight: true },
        { text: "Customized workout program", included: true },
        { text: "Written form guides with cues", included: true },
        { text: "Weekly plan updates per request", included: true },
        { text: "Weekly check-in calls per request", included: true },
        { text: "Customized nutrition planning", included: true },
      ],
      featured: false,
      cta: "Go Elite",
      emailSubject: "I'm Ready for the Elite Plan",
      emailBody: `Hi Gavin,\n\nI'm interested in the Elite Plan subscription for ${
        billingCycle === "3month"
          ? "3 months"
          : billingCycle === "6month"
          ? "6 months"
          : "a year"
      }.\n\nI'm ready for the comprehensive fitness solution and would like to get started right away.\n\nThanks!`,
      textMessage:
        "Hi Gavin, I want to sign up for your Elite Plan for maximum results. When can we get started?",
      icon: <FaCrown className="text-amber-400" />,
      color: "amber",
      premium: true,
    },
  ];

  // Function to create email link with dynamic content based on selected plan and billing cycle
  const createEmailLink = (plan) => {
    const updatedSubject = plan.emailSubject;

    // Create a pricing summary string based on selected billing cycle
    const pricingSummary =
      billingCycle === "3month"
        ? `${plan.price}/month for 3 months (${plan.totalPrice.split(" ")[0]})`
        : billingCycle === "6month"
        ? `${plan.price}/month for 6 months (${
            plan.totalPrice.split(" ")[0]
          }, 5% off)`
        : `${plan.price}/month for 12 months (${plan.totalPrice.split(" ")[0]},
       15% off)`;

    // Update the email body with pricing information
    const updatedBody =
      plan.emailBody.replace(
        "3 months",
        billingCycle === "3month"
          ? "3 months"
          : billingCycle === "6month"
          ? "6 months"
          : "a year"
      ) + `\n\nSelected package: ${plan.title} - ${pricingSummary}`;

    return `mailto:gavin@flbesttrainer.com?subject=${encodeURIComponent(
      updatedSubject
    )}&body=${encodeURIComponent(updatedBody)}`;
  };

  // Function to create SMS link with dynamic content
  const createSmsLink = (plan) => {
    const phoneNumber = "8135551212"; // Replace with your actual phone number

    // Create pricing summary for SMS
    const pricingSummary =
      billingCycle === "3month"
        ? `${plan.totalPrice.split(" ")[0]} total`
        : billingCycle === "6month"
        ? `${plan.totalPrice.split(" ")[0]} total (5% off)`
        : `${plan.totalPrice.split(" ")[0]} total (15% off)`;

    const updatedMessage = `${plan.textMessage} I'm interested in the ${
      billingCycle === "3month"
        ? "3 month"
        : billingCycle === "6month"
        ? "6 month"
        : "annual"
    } plan at ${plan.price}/month (${pricingSummary}).`;

    return `sms:+1${phoneNumber}?body=${encodeURIComponent(updatedMessage)}`;
  };

  return (
    <div id="pricing" className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          Pricing
          <span className="text-royal"> Plans</span>
        </h2>
        {/* Animated line*/}
        <div className="w-80 h-1 bg-gradient-to-r from-transparent via-royal to-transparent rounded-full mx-auto shadow-glow float-animation mb-6"></div>
        <p className="text-white/70 max-w-3xl mx-auto mb-8">
          Choose the plan that best fits your fitness goals and budget. All
          plans include personalized workout programs created specifically for
          you.
        </p>

        <div className="inline-flex items-center bg-white/5 p-1 rounded-lg mb-12">
          <button
            onClick={() => setBillingCycle("3month")}
            className={`py-2 px-4 rounded-md transition-all ${
              billingCycle === "3month"
                ? "bg-royal text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            3 Months
          </button>
          <button
            onClick={() => setBillingCycle("6month")}
            className={`py-2 px-4 rounded-md transition-all ${
              billingCycle === "6month"
                ? "bg-royal text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            6 Months <span className="text-xs text-green-400 ml-1">5% Off</span>
          </button>
          <button
            onClick={() => setBillingCycle("annual")}
            className={`py-2 px-4 rounded-md transition-all ${
              billingCycle === "annual"
                ? "bg-royal text-white"
                : "text-white/70 hover:text-white"
            }`}
          >
            Annual <span className="text-xs text-green-400 ml-1">15% Off</span>
          </button>
        </div>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {plans.map((plan, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className={`rounded-xl p-6 border relative ${
              plan.premium
                ? "bg-gradient-to-br from-amber-950/40 to-amber-900/20 border-amber-600/50 shadow-xl shadow-amber-900/10"
                : plan.featured
                ? "bg-gradient-to-br from-royal/30 to-royal/10 border-royal shadow-lg"
                : "bg-white/5 border-white/10 hover:bg-white/10"
            } transition-all duration-300 ${
              plan.premium ? "transform scale-105 z-10" : ""
            }`}
          >
            {plan.premium && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-amber-600 to-amber-400 text-white text-xs font-bold py-1.5 px-5 rounded-full shadow-md">
                BEST VALUE
              </div>
            )}

            {plan.featured && !plan.premium && (
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-royal text-white text-xs font-bold py-1 px-4 rounded-full">
                MOST POPULAR
              </div>
            )}

            <div
              className={`flex items-center mb-3 ${
                plan.premium ? "text-amber-400" : "text-royal"
              }`}
            >
              <div
                className={`p-2 rounded-lg mr-3 ${
                  plan.premium ? "bg-amber-400/20" : "bg-royal/20"
                }`}
              >
                {plan.icon}
              </div>
              <h3
                className={`text-2xl font-bold ${
                  plan.premium ? "text-amber-400" : "text-white"
                }`}
              >
                {plan.title}
              </h3>
            </div>

            <p className="text-white/70 mb-6 h-12">{plan.description}</p>

            <div className="mb-8">
              <span
                className={`text-4xl font-bold ${
                  plan.premium ? "text-amber-400" : "text-white"
                }`}
              >
                {plan.price}
              </span>
              <span className="text-white/70">{plan.period}</span>
              <div
                className={`text-sm mt-1 ${
                  plan.premium ? "text-amber-400/70" : "text-white/50"
                }`}
              >
                {plan.totalPrice}
              </div>

              {billingCycle === "6month" && (
                <div className="mt-2 inline-block bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-500/20 rounded-full px-3 py-0.5 text-xs text-green-400">
                  Save {index === 0 ? "$30" : index === 1 ? "$60" : "$90"} with
                  5% off
                </div>
              )}

              {billingCycle === "annual" && (
                <div className="mt-2 inline-block bg-gradient-to-r from-green-900/30 to-green-800/30 border border-green-500/20 rounded-full px-3 py-0.5 text-xs text-green-400">
                  Save {index === 0 ? "$180" : index === 1 ? "$360" : "$540"}{" "}
                  with 15% off
                </div>
              )}
            </div>

            <ul className="space-y-3 mb-8">
              {plan.features.map((feature, i) => (
                <li key={i} className="flex items-center">
                  {feature.included ? (
                    <FaCheck
                      className={`${
                        feature.highlight ? "text-amber-400" : "text-green-500"
                      } mr-2`}
                    />
                  ) : (
                    <FaTimes className="text-red-500 mr-2" />
                  )}
                  <span
                    className={
                      feature.included
                        ? feature.highlight
                          ? "text-amber-400"
                          : "text-white/90"
                        : "text-white/50"
                    }
                  >
                    {feature.text}
                  </span>
                </li>
              ))}
            </ul>

            <a
              href={isMobile ? createSmsLink(plan) : createEmailLink(plan)}
              className={`w-full block text-center py-3.5 rounded-lg font-semibold transition-all ${
                plan.premium
                  ? "bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-white shadow-lg shadow-amber-900/20"
                  : plan.featured
                  ? "bg-royal hover:bg-royal-light text-white"
                  : "bg-white/10 hover:bg-white/20 text-white"
              } flex items-center justify-center group`}
            >
              {isMobile ? (
                <>
                  <FaMobile
                    className={`mr-2 ${
                      plan.premium ? "group-hover:animate-pulse" : ""
                    }`}
                  />{" "}
                  {plan.cta}
                </>
              ) : (
                <>
                  <FaEnvelope
                    className={`mr-2 ${
                      plan.premium ? "group-hover:animate-pulse" : ""
                    }`}
                  />{" "}
                  {plan.cta}
                </>
              )}
              {plan.premium && (
                <FaArrowRight className="ml-2 opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              )}
            </a>

            {plan.premium && (
              <div className="mt-4 text-center text-amber-400/70 text-xs">
                ✦ Maximum results guaranteed ✦
              </div>
            )}
          </motion.div>
        ))}
      </div>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5, delay: 0.6 }}
        className="mt-12 text-center text-white/60 text-sm max-w-2xl mx-auto"
      >
        <p>
          All plans include personalized programming and ongoing support.
          <br className="hidden md:block" />
          For the fastest results and most comprehensive support, the Elite Plan
          is recommended.
        </p>
      </motion.div>
    </div>
  );
}
