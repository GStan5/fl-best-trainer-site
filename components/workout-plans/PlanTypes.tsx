import { useEffect, useState } from "react";
import {
  FaDumbbell,
  FaHome,
  FaRunning,
  FaWeight,
  FaUserFriends,
  FaArrowRight,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function PlanTypes() {
  // Add state to ensure component is mounted before animation
  const [isMounted, setIsMounted] = useState(false);

  // Set mounted state after component mounts
  useEffect(() => {
    setIsMounted(true);
    return () => setIsMounted(false);
  }, []);

  const plans = [
    {
      icon: <FaDumbbell />,
      title: "Gym-Based Plans",
      description:
        "Full equipment workout plans designed for commercial gym settings with progressive overload principles.",
    },
    {
      icon: <FaHome />,
      title: "Home Workout Plans",
      description:
        "Minimal equipment plans designed to maximize results in your home environment.",
    },
    {
      icon: <FaRunning />,
      title: "Cardio & HIIT Plans",
      description:
        "Focused cardio and high-intensity interval training for optimal fat loss and endurance.",
    },
    {
      icon: <FaWeight />,
      title: "Strength Focus Plans",
      description:
        "Dedicated strength development programs for building muscle and increasing power.",
    },
    {
      icon: <FaUserFriends />,
      title: "Partner Workouts",
      description:
        "Specialized plans designed for couples or workout partners to train together effectively.",
    },
  ];

  // If not mounted yet, render a simple placeholder to avoid layout shift
  if (!isMounted) {
    return (
      <div className="py-12">
        <div className="text-center mb-10">
          <h2 className="text-3xl font-bold text-white mb-3">
            <span className="text-royal">Specialized</span> Workout Plan Types
          </h2>
          <div className="w-80 h-1 bg-gradient-to-r from-transparent via-royal to-transparent mx-auto mt-2 mb-4"></div>
          <p className="text-white/70 max-w-2xl mx-auto text-sm">
            Choose from a variety of specialized workout plans tailored to your
            environment, equipment access, and specific goals.
          </p>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
          {Array(5)
            .fill(0)
            .map((_, i) => (
              <div
                key={i}
                className="bg-white/5 rounded-lg p-4 border border-white/10 h-40"
              ></div>
            ))}
        </div>
      </div>
    );
  }

  return (
    <div className="py-12" id="plan-types">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-bold text-white mb-3">
          <span className="text-royal">Specialized</span> Workout Plan Types
        </h2>
        <div className="w-80 h-1 bg-gradient-to-r from-transparent via-royal to-transparent mx-auto mt-2 mb-4 shadow-glow float-animation"></div>
        <p className="text-white/70 max-w-2xl mx-auto text-sm">
          Choose from a variety of specialized workout plans tailored to your
          environment, equipment access, and specific goals.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 md:gap-4">
        {plans.map((plan, index) => (
          <motion.a
            href="#pricing"
            key={index}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
            className="bg-gradient-to-br from-white/8 to-white/5 hover:from-royal/15 hover:to-royal/5 rounded-lg p-4 border border-white/10 hover:border-royal/30 transition-all duration-300 group cursor-pointer h-full flex flex-col"
          >
            <div className="flex items-center mb-3">
              <div className="w-10 h-10 bg-royal/20 rounded-lg flex items-center justify-center text-royal text-lg mr-3 group-hover:bg-royal/30 transition-colors">
                {plan.icon}
              </div>
              <h3 className="text-lg font-semibold text-white group-hover:text-royal transition-colors">
                {plan.title}
              </h3>
            </div>
            <p className="text-white/70 group-hover:text-white/90 text-sm transition-colors">
              {plan.description}
            </p>
            <div className="mt-auto pt-3 text-royal opacity-0 group-hover:opacity-100 transition-all duration-300 text-xs font-medium flex items-center">
              Learn more <FaArrowRight className="ml-1 text-[0.6rem]" />
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
