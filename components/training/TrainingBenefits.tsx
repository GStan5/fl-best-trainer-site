import { motion } from "framer-motion";
import {
  FaDumbbell,
  FaStopwatch,
  FaHome,
  FaCheck,
  FaUser,
  FaHeartbeat,
  FaCar,
  FaShieldAlt,
  FaChartLine,
  FaArrowRight,
} from "react-icons/fa";
import { useState } from "react";

export default function TrainingBenefits() {
  // Update the useState default value from "all" to "convenience"
  const [activeCategory, setActiveCategory] = useState("convenience");
  const [showQuestions, setShowQuestions] = useState(false);

  // Handle smooth scrolling
  const scrollToContact = (e) => {
    e.preventDefault();
    const contactSection = document.getElementById("contact");
    if (contactSection) {
      contactSection.scrollIntoView({ behavior: "smooth" });
    }
  };

  // Categorize benefits for better organization
  const benefitsData = {
    convenience: [
      {
        icon: <FaHome className="text-royal-light w-8 h-8" />,
        title: "Convenient & Private",
        description:
          "No commute to gym, no crowds, no waiting for equipment. Train in the privacy of your own home.",
        category: "convenience",
      },
      {
        icon: <FaCar className="text-royal-light w-8 h-8" />,
        title: "Skip the Traffic",
        description:
          "Save time and avoid the stress of rush hour traffic. Your workout starts the moment I arrive at your door.",
        category: "convenience",
      },
      {
        icon: <FaShieldAlt className="text-royal-light w-8 h-8" />,
        title: "Health & Safety",
        description:
          "Train in the comfort and safety of your own space without exposure to crowded public facilities.",
        category: "convenience",
      },
    ],
    results: [
      {
        icon: <FaUser className="text-royal-light w-8 h-8" />,
        title: "Personalized Approach",
        description:
          "Custom training plans designed specifically for your goals, fitness level, and available space.",
        category: "results",
      },
      {
        icon: <FaHeartbeat className="text-royal-light w-8 h-8" />,
        title: "Focused Results",
        description:
          "Achieve your goals faster with expert guidance and motivation during every workout.",
        category: "results",
      },
      {
        icon: <FaChartLine className="text-royal-light w-8 h-8" />,
        title: "Progressive Development",
        description:
          "Enjoy structured advancement through fitness levels with regular assessments and updated training protocols.",
        category: "results",
      },
    ],
    efficiency: [
      {
        icon: <FaStopwatch className="text-royal-light w-8 h-8" />,
        title: "Time Efficient",
        description:
          "Maximize results with focused, efficient workouts that eliminate wasted time.",
        category: "efficiency",
      },
      {
        icon: <FaDumbbell className="text-royal-light w-8 h-8" />,
        title: "Effective Workouts",
        description:
          "Custom exercise programs using bodyweight movements and minimal equipment, perfect for your home environment.",
        category: "efficiency",
      },
      {
        icon: <FaCheck className="text-royal-light w-8 h-8" />,
        title: "Accountability",
        description:
          "Scheduled sessions with a dedicated trainer ensure you stay consistent with your fitness routine.",
        category: "efficiency",
      },
    ],
  };

  // All benefits in a flat array for "all" category view
  const allBenefits = [
    ...benefitsData.convenience,
    ...benefitsData.results,
    ...benefitsData.efficiency,
  ];

  // Get the benefits to display based on active category
  const getDisplayBenefits = () => {
    switch (activeCategory) {
      case "convenience":
        return benefitsData.convenience;
      case "results":
        return benefitsData.results;
      case "efficiency":
        return benefitsData.efficiency;
      default:
        return allBenefits;
    }
  };

  return (
    <section
      className="py-20 bg-gradient-to-b from-navy to-navy-dark relative"
      id="benefits"
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal/50 to-transparent"></div>
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal/50 to-transparent"></div>

      {/* Content container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section header */}
        <div className="text-center max-w-3xl mx-auto mb-12">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: -20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7 }}
          >
            Why Choose{" "}
            <span className="text-royal-light">In-Home Training</span>
          </motion.h2>
          <motion.p
            className="text-lg text-white/70"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            Experience these key advantages of having a certified personal
            trainer come directly to your home
          </motion.p>
        </div>

        {/* Comparison with traditional gyms - MOVED UP */}
        <motion.div
          className="mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          <div className="bg-black/30 backdrop-blur-sm rounded-xl overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-2">
              <div className="p-5 border-b md:border-b-0 md:border-r border-white/10">
                <h4 className="text-center font-medium text-white mb-3 flex items-center justify-center">
                  <span className="w-8 h-8 rounded-full bg-royal/20 flex items-center justify-center mr-2">
                    <FaHome className="text-royal-light w-4 h-4" />
                  </span>
                  In-Home Training
                </h4>
                <ul className="space-y-2">
                  {[
                    "No commute time",
                    "Full privacy & comfort",
                    "100% personalized attention",
                    "Efficient time management",
                    "Workout on your schedule",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <FaCheck className="text-royal-light mt-1 mr-2 flex-shrink-0" />
                      <span className="text-white/80 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
              <div className="p-5">
                <h4 className="text-center font-medium text-white/70 mb-3 flex items-center justify-center">
                  <span className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center mr-2">
                    <FaDumbbell className="text-white/40 w-4 h-4" />
                  </span>
                  Traditional Gym
                </h4>
                <ul className="space-y-2">
                  {[
                    "Time lost in traffic",
                    "Crowded public spaces",
                    "Shared trainer attention",
                    "Waiting for equipment",
                    "Fixed operating hours",
                  ].map((item, i) => (
                    <li key={i} className="flex items-start">
                      <FaArrowRight className="text-white/30 mt-1 mr-2 flex-shrink-0" />
                      <span className="text-white/60 text-sm">{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Category navigation tabs - REORDERED */}
        <div className="flex justify-center mb-8 overflow-x-auto pb-1 hide-scrollbar">
          <motion.div
            className="inline-flex bg-black/20 backdrop-blur-sm rounded-lg p-1 border border-white/10"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
          >
            {[
              { id: "convenience", label: "Convenience" },
              { id: "results", label: "Better Results" },
              { id: "efficiency", label: "Efficiency" },
              { id: "all", label: "All Benefits" },
            ].map((category) => (
              <button
                key={category.id}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-200 whitespace-nowrap
                  ${
                    activeCategory === category.id
                      ? "bg-gradient-to-r from-royal to-royal-light text-white shadow-md"
                      : "text-white/70 hover:text-white hover:bg-white/5"
                  }`}
                onClick={() => setActiveCategory(category.id)}
              >
                {category.label}
              </button>
            ))}
          </motion.div>
        </div>

        {/* Featured benefit (only visible when a category is selected) */}
        {activeCategory !== "all" && (
          <motion.div
            className="mb-12 max-w-4xl mx-auto"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          >
            <div className="bg-black/40 backdrop-blur-sm border border-white/10 rounded-2xl p-6 sm:p-8 overflow-hidden relative">
              <div className="absolute inset-0 bg-gradient-to-br from-royal/10 to-transparent opacity-50"></div>

              <div className="relative z-10 flex flex-col md:flex-row items-center md:items-start gap-6">
                <div className="bg-gradient-to-br from-black/60 to-royal/20 w-20 h-20 rounded-xl flex items-center justify-center shrink-0">
                  {activeCategory === "convenience" ? (
                    <FaHome className="text-royal-light w-10 h-10" />
                  ) : activeCategory === "results" ? (
                    <FaChartLine className="text-royal-light w-10 h-10" />
                  ) : (
                    <FaStopwatch className="text-royal-light w-10 h-10" />
                  )}
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-white mb-2">
                    {activeCategory === "convenience"
                      ? "Unmatched Convenience"
                      : activeCategory === "results"
                      ? "Superior Results"
                      : "Maximum Efficiency"}
                  </h3>

                  <p className="text-white/80 text-lg mb-4">
                    {activeCategory === "convenience"
                      ? "In-home training eliminates common barriers to fitness success like travel time, gym anxiety, and scheduling conflicts."
                      : activeCategory === "results"
                      ? "Personalized attention means faster progress toward your specific goals with programs tailored exactly to your needs."
                      : "No wasted time, no distractions - just focused, effective workouts that deliver maximum results in minimum time."}
                  </p>

                  <a
                    href="#contact"
                    onClick={scrollToContact}
                    className="inline-flex items-center text-royal-light hover:text-royal group"
                  >
                    Learn how I can help you
                    <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
                  </a>
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {/* Benefits grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
          {getDisplayBenefits().map((benefit, index) => (
            <motion.div
              key={index}
              className="group bg-black/30 backdrop-blur-sm border border-white/5 rounded-xl p-6 hover:border-royal/50 hover:shadow-lg hover:shadow-royal/10 transition-all duration-300 cursor-pointer relative overflow-hidden h-full"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={scrollToContact}
            >
              {/* Hover background effect */}
              <div className="absolute inset-0 bg-gradient-to-br from-royal/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

              {/* Glowing dot in top-right corner */}
              <div className="absolute top-3 right-3 w-2 h-2 rounded-full bg-royal-light opacity-0 group-hover:opacity-100 transition-opacity duration-300 group-hover:animate-pulse"></div>

              <div className="bg-black/40 w-16 h-16 rounded-lg flex items-center justify-center mb-4 relative group-hover:bg-gradient-to-br from-black/50 to-royal/30 transform group-hover:scale-110 transition-all duration-300">
                <div className="absolute inset-0 rounded-lg bg-gradient-to-tr from-transparent to-royal/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative transform group-hover:scale-110 transition-transform duration-300">
                  {benefit.icon}
                </div>
              </div>

              <h3 className="text-xl font-bold text-white mb-2 group-hover:text-royal-light transition-colors duration-300">
                {benefit.title}
              </h3>

              <p className="text-white/70 relative z-10 group-hover:text-white/90 transition-colors duration-300">
                {benefit.description}
              </p>

              {/* Contact hint that appears on hover */}
              <div className="absolute inset-x-0 bottom-0 h-0 bg-gradient-to-t from-royal/20 to-transparent group-hover:h-12 transition-all duration-300 opacity-0 group-hover:opacity-100">
                <div className="absolute bottom-2 left-0 right-0 text-center text-white/80 text-sm flex items-center justify-center">
                  <span>Contact Me</span>
                  <FaArrowRight className="ml-2 text-xs" />
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Common Questions section - collapsed by default */}
        <motion.div
          className="mt-16 mb-12 max-w-3xl mx-auto"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7 }}
        >
          <div className="bg-black/30 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden">
            {/* Header section that's always visible */}
            <div
              className="p-6 flex items-center justify-between cursor-pointer"
              onClick={() => setShowQuestions(!showQuestions)}
            >
              <h3 className="text-2xl font-bold text-white">
                Common <span className="text-royal-light">Questions</span>
              </h3>

              <div
                className={`w-8 h-8 rounded-full bg-black/40 flex items-center justify-center border border-royal/30 transition-all duration-300 ${
                  showQuestions ? "bg-royal/20" : ""
                }`}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  className={`text-royal-light transition-transform duration-300 ${
                    showQuestions ? "transform rotate-180" : ""
                  }`}
                >
                  <polyline points="6 9 12 15 18 9"></polyline>
                </svg>
              </div>
            </div>

            {/* Questions section that expands/collapses */}
            <motion.div
              initial={false}
              animate={{
                height: showQuestions ? "auto" : 0,
                opacity: showQuestions ? 1 : 0,
              }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden"
            >
              <div className="px-6 pb-6">
                {[
                  {
                    question: "How much space do I need for in-home training?",
                    answer:
                      "Very little! I design workouts that can be done in as little as 6'x6' of floor space. A small living room, bedroom, or even patio area is perfect.",
                  },
                  {
                    question:
                      "Is in-home training as effective as gym workouts?",
                    answer:
                      "Absolutely! With proper guidance and programming, in-home training can be just as effective (and often more so) than traditional gym workouts because of the personalized attention and program design.",
                  },
                  {
                    question: "Do I need to buy special equipment?",
                    answer:
                      "Not at all. I bring essential portable equipment with me, and many exercises use just your body weight. If you already have equipment, we'll incorporate it into your program.",
                  },
                  {
                    question: "How often should I train for optimal results?",
                    answer:
                      "For most clients, 2-3 sessions per week yields the best balance of results and recovery. We'll determine the ideal frequency based on your goals, current fitness level, and schedule.",
                  },
                  {
                    question:
                      "What if I have limited mobility or physical limitations?",
                    answer:
                      "In-home training is actually ideal for clients with mobility concerns or physical limitations. I'll create a completely customized program that works around your specific needs while still helping you make progress.",
                  },
                ].map((item, i) => (
                  <details
                    key={i}
                    className="group bg-black/40 backdrop-blur-sm border border-white/5 rounded-lg mb-3 last:mb-0 overflow-hidden"
                  >
                    <summary className="flex items-center justify-between p-4 cursor-pointer list-none">
                      <span className="font-medium text-white group-hover:text-royal-light transition-colors">
                        {item.question}
                      </span>
                      <div className="border border-royal/30 rounded-full w-5 h-5 flex items-center justify-center group-open:bg-royal/20 transition-colors">
                        <span className="text-royal-light text-sm block group-open:rotate-180 transition-transform">
                          +
                        </span>
                      </div>
                    </summary>
                    <div className="px-4 pb-4">
                      <p className="text-white/70">{item.answer}</p>
                    </div>
                  </details>
                ))}
              </div>
            </motion.div>
          </div>
        </motion.div>

        {/* Call to action */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.3 }}
        >
          <p className="text-white/80 mb-6 max-w-2xl mx-auto">
            Ready to experience these benefits firsthand? Contact me today to
            schedule your initial consultation and start your in-home training
            journey.
          </p>

          <a
            href="#contact"
            onClick={scrollToContact}
            className="inline-flex items-center px-8 py-4 bg-gradient-to-r from-royal to-royal-light text-white rounded-xl font-medium shadow-lg hover:shadow-xl hover:shadow-royal/30 hover:-translate-y-1 transition-all duration-300"
          >
            Get Started Today
            <FaArrowRight className="ml-2" />
          </a>
        </motion.div>

        {/* Background accents */}
        <div className="hidden lg:block absolute -bottom-10 -left-16 w-32 h-32 bg-royal/5 rounded-full blur-2xl"></div>
        <div className="hidden lg:block absolute -top-20 right-10 w-48 h-48 bg-royal/5 rounded-full blur-3xl"></div>
      </div>
    </section>
  );
}
