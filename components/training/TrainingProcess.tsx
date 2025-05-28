import { motion } from "framer-motion";
import {
  FaUserCheck,
  FaChartLine,
  FaCalendarAlt,
  FaRunning,
  FaArrowRight,
  FaDollarSign,
  FaStar,
  FaLightbulb,
  FaCheck,
} from "react-icons/fa";
import { useState } from "react";

export default function TrainingProcess() {
  const [hoveredStep, setHoveredStep] = useState(null);

  const steps = [
    {
      icon: <FaUserCheck />,
      title: "Initial Consultation",
      description:
        "We will discuss your fitness goals, medical history, and previous exercise experience to create a customized plan.",
      color: "from-royal-light to-royal",
      keyPoints: [
        "Goal assessment & Personal preferences",
        "Medical history review & Current physical hurdles that we want to focus on",
      ],
    },
    {
      icon: <FaChartLine />,
      title: "Fitness Assessment",
      description:
        "I will measure your current fitness levels to establish baselines and set realistic, achievable goals.",
      color: "from-royal to-blue-500",
      keyPoints: [
        "Strength evaluation",
        "Body flexibility & mobility assessment",
      ],
    },
    {
      icon: <FaCalendarAlt />,
      title: "Scheduling",
      description:
        "We will create a training schedule that fits your lifestyle, with flexible options to accommodate your needs.",
      color: "from-blue-500 to-royal-light",
      keyPoints: [
        "Flexible appointment times to fit your schedule that let you avoid traffic",
        "3 sessions per week recommended for best results & most efficient progress",
      ],
    },
    {
      icon: <FaRunning />,
      title: "In-Home Sessions",
      description:
        "I will guide you through targeted workouts using minimal equipment or bodyweight exercises in your home.",
      color: "from-royal to-royal-light",
      keyPoints: [
        "Efficient 45-60 minute sessions that challenge you",
        "Minimal equipment required for effective workouts",
      ],
    },
  ];

  // Define benefits array separately to avoid syntax issues
  const benefits = [
    {
      title: "Personalized Planning",
      desc: "Custom-tailored approach for your specific goals, needs, and preferences",
    },
    {
      title: "Progressive System",
      desc: "Methodical approach that builds success step by step for long-term results",
    },
    {
      title: "In-Home Convenience",
      desc: "Save time with workouts in the comfort of your own space and avoid traffic",
    },
    {
      title: "Expert Guidance",
      desc: "Professional supervision ensures safe and effective workouts while minimizing injury risk",
    },
  ];

  // Function to scroll to the prices section
  const scrollToPrices = (e) => {
    e.preventDefault();
    const pricesSection = document.getElementById("pricing");
    if (pricesSection) {
      const headerHeight = 80;
      const pricesPosition =
        pricesSection.getBoundingClientRect().top + window.pageYOffset;
      window.scrollTo({
        top: pricesPosition - headerHeight,
        behavior: "smooth",
      });
    }
  };

  return (
    <section className="py-24 bg-gradient-to-b from-[#1A1A1A] to-black relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal/50 to-transparent"></div>
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal/50 to-transparent"></div>

      {/* Background glow */}
      <motion.div
        className="absolute top-1/2 left-1/4 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-royal/5 rounded-full blur-[120px]"
        animate={{ opacity: [0.3, 0.6, 0.3], scale: [1, 1.05, 1] }}
        transition={{ duration: 8, repeat: Infinity, repeatType: "reverse" }}
      />

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <motion.div
            className="inline-flex items-center justify-center mb-3"
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4 }}
          >
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-royal/70"></div>
            <span className="px-3 text-royal-light text-sm font-medium">
              YOUR JOURNEY
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-royal/70"></div>
          </motion.div>

          <motion.h2
            className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-6"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            Simple <span className="text-royal-light">4-Step</span> Process
          </motion.h2>

          <motion.p
            className="text-lg text-white/70 max-w-2xl mx-auto"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Gavin Stanifer's streamlined approach makes getting started with
            personalized in-home training easy and tailored to your unique needs
          </motion.p>
        </div>

        {/* Mobile View - Step Cards */}
        <div className="md:hidden space-y-12">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="bg-gradient-to-br from-black/80 to-navy/20 backdrop-blur-sm 
                        border border-white/5 rounded-xl shadow-xl overflow-hidden"
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{
                y: -5,
                boxShadow: "0 25px 50px -12px rgba(66, 27, 139, 0.25)",
              }}
            >
              {/* Top gradient bar */}
              <div
                className={`h-1.5 w-full bg-gradient-to-r ${step.color}`}
              ></div>

              <div className="p-6">
                {/* Step header */}
                <div className="flex items-center mb-5">
                  <div
                    className={`relative bg-gradient-to-br ${step.color} w-14 h-14 rounded-full 
                                  flex items-center justify-center text-white text-xl shadow-lg shadow-royal/20 mr-4`}
                  >
                    <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
                    <div className="relative z-10">{step.icon}</div>
                    <span
                      className="absolute -top-2 -right-2 bg-black w-6 h-6 rounded-full 
                                    flex items-center justify-center text-royal-light text-xs font-bold border border-royal/30"
                    >
                      {index + 1}
                    </span>
                  </div>
                  <div>
                    <span className="text-royal-light/70 text-sm font-medium">
                      Step {index + 1}
                    </span>
                    <h3 className="text-xl font-bold text-white">
                      {step.title}
                    </h3>
                  </div>
                </div>

                <p className="text-white/80 text-base mb-4">
                  {step.description}
                </p>

                {/* Key points */}
                <div className="space-y-2 mt-4 pl-4">
                  {step.keyPoints.map((point, i) => (
                    <motion.div
                      key={i}
                      className="flex items-center"
                      initial={{ opacity: 0, x: -10 }}
                      whileInView={{ opacity: 1, x: 0 }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.3, delay: 0.4 + i * 0.1 }}
                    >
                      <FaCheck className="text-royal-light mr-2 text-xs" />
                      <span className="text-sm text-white/70">{point}</span>
                    </motion.div>
                  ))}
                </div>
              </div>

              {/* Step connector */}
              {index < steps.length - 1 && (
                <motion.div
                  className="absolute left-1/2 transform -translate-x-1/2 h-8 flex items-center justify-center"
                  style={{ bottom: "-30px" }}
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                >
                  <div className="w-px h-full bg-royal/30"></div>
                  <div className="absolute bottom-0 w-2 h-2 bg-royal rounded-full transform -translate-x-1/2 left-1/2"></div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </div>

        {/* Desktop View - Timeline */}
        <div className="hidden md:block relative mb-20">
          {/* Center timeline */}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-0.5 bg-gradient-to-b from-royal via-royal-light to-royal"></div>
          <div className="absolute left-1/2 transform -translate-x-1/2 top-0 bottom-0 w-4 bg-gradient-to-b from-royal/20 via-royal-light/20 to-royal/20 blur-xl"></div>

          {/* Steps */}
          <div className="relative">
            {steps.map((step, index) => (
              <div key={index} className="flex items-stretch mb-28 last:mb-0">
                {/* Left/Right side layout */}
                {index % 2 !== 0 && <div className="w-[calc(50%-32px)]"></div>}

                {/* Left side content */}
                {index % 2 === 0 && (
                  <motion.div
                    className="w-[calc(50%-32px)] pr-10 text-right flex flex-col justify-center"
                    initial={{ opacity: 0, x: -50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    onMouseEnter={() => setHoveredStep(index)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    <div
                      className={`bg-gradient-to-br from-black/80 to-navy/10 backdrop-blur-sm 
                                   border border-white/5 rounded-xl p-6 shadow-lg transition-all 
                                   ${
                                     hoveredStep === index
                                       ? "shadow-royal/20 -translate-x-2 border-royal/20"
                                       : ""
                                   }`}
                    >
                      {/* Content */}
                      <div
                        className={`h-1 w-full bg-gradient-to-r ${step.color} rounded-t-xl mb-4`}
                      ></div>
                      <span className="text-royal-light/70 text-sm font-medium mb-1 inline-block">
                        Step {index + 1}
                      </span>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-white/80 ml-auto max-w-sm mb-4">
                        {step.description}
                      </p>

                      {/* Key points */}
                      <div className="space-y-2 ml-auto text-right">
                        {step.keyPoints.map((point, i) => (
                          <div
                            key={i}
                            className="flex items-center justify-end"
                          >
                            <span className="text-sm text-white/70">
                              {point}
                            </span>
                            <FaCheck className="text-royal-light ml-2 text-xs" />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Connector arrow */}
                    <div className="absolute right-0 top-1/2 transform translate-x-[9px] -translate-y-1/2">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-r-[12px] border-r-royal-light/50 border-b-[8px] border-b-transparent"></div>
                    </div>
                  </motion.div>
                )}

                {/* Center icon */}
                <motion.div
                  className={`relative z-10 bg-gradient-to-br ${
                    step.color
                  } w-16 h-16 rounded-full 
                             flex items-center justify-center text-white text-xl shadow-lg shadow-royal/20 shrink-0 self-center mx-6
                             ${
                               hoveredStep === index
                                 ? "scale-110 ring-2 ring-white/30"
                                 : ""
                             }`}
                  initial={{ opacity: 0, scale: 0.5 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: 0.3 }}
                  whileHover={{ scale: 1.1 }}
                >
                  <div className="absolute inset-0 rounded-full bg-gradient-to-br from-white/20 to-transparent opacity-50"></div>
                  <div className="relative z-10">{step.icon}</div>
                  <span className="absolute -top-1 -right-1 bg-black w-6 h-6 rounded-full flex items-center justify-center text-royal-light text-xs font-bold border border-royal/30">
                    {index + 1}
                  </span>

                  {/* Hover pulse effect */}
                  {hoveredStep === index && (
                    <motion.div
                      className="absolute inset-0 rounded-full border border-royal-light/30"
                      animate={{ scale: [1, 1.6, 1], opacity: [1, 0, 1] }}
                      transition={{ duration: 2, repeat: Infinity }}
                    />
                  )}
                </motion.div>

                {/* Right side content */}
                {index % 2 !== 0 && (
                  <motion.div
                    className="w-[calc(50%-32px)] pl-10 text-left flex flex-col justify-center"
                    initial={{ opacity: 0, x: 50 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    onMouseEnter={() => setHoveredStep(index)}
                    onMouseLeave={() => setHoveredStep(null)}
                  >
                    <div
                      className={`bg-gradient-to-br from-black/80 to-navy/10 backdrop-blur-sm 
                                   border border-white/5 rounded-xl p-6 shadow-lg transition-all
                                   ${
                                     hoveredStep === index
                                       ? "shadow-royal/20 translate-x-2 border-royal/20"
                                       : ""
                                   }`}
                    >
                      {/* Content */}
                      <div
                        className={`h-1 w-full bg-gradient-to-r ${step.color} rounded-t-xl mb-4`}
                      ></div>
                      <span className="text-royal-light/80 text-sm font-medium mb-1 inline-block">
                        Step {index + 1}
                      </span>
                      <h3 className="text-2xl font-bold text-white mb-3">
                        {step.title}
                      </h3>
                      <p className="text-white/80 max-w-sm mb-4">
                        {step.description}
                      </p>

                      {/* Key points */}
                      <div className="space-y-2">
                        {step.keyPoints.map((point, i) => (
                          <div key={i} className="flex items-center">
                            <FaCheck className="text-royal-light mr-2 text-xs" />
                            <span className="text-sm text-white/70">
                              {point}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Connector arrow */}
                    <div className="absolute left-0 top-1/2 transform -translate-x-[9px] -translate-y-1/2">
                      <div className="w-0 h-0 border-t-[8px] border-t-transparent border-l-[12px] border-l-royal-light/50 border-b-[8px] border-b-transparent"></div>
                    </div>
                  </motion.div>
                )}

                {index % 2 === 0 && <div className="w-[calc(50%-32px)]"></div>}
              </div>
            ))}
          </div>
        </div>

        {/* Benefits section */}
        <motion.div
          className="max-w-4xl mx-auto my-10 bg-gradient-to-br from-black/60 to-navy/20 backdrop-blur-sm 
                    border border-white/5 rounded-xl p-8 shadow-lg"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="flex items-center mb-5">
            <div
              className="bg-gradient-to-br from-royal to-royal-light/70 w-12 h-12 rounded-full 
                          flex items-center justify-center text-white text-xl shadow-lg shadow-royal/20 mr-4"
            >
              <FaLightbulb />
            </div>
            <h3 className="text-xl sm:text-2xl font-bold text-white">
              Why This Process Works
            </h3>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mt-6">
            {benefits.map((benefit, i) => (
              <div key={i} className="flex items-start">
                <div className="flex-shrink-0 h-6 w-6 rounded-full bg-royal/20 flex items-center justify-center mt-0.5">
                  <FaStar className="h-3 w-3 text-royal-light" />
                </div>
                <p className="ml-3 text-white/80">
                  <span className="text-white font-medium">
                    {benefit.title}
                  </span>
                  <br />
                  {benefit.desc}
                </p>
              </div>
            ))}
          </div>
        </motion.div>

        {/* CTA Button */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6 }}
        >
          <div className="relative inline-block">
            {/* Button glow effect */}
            <div className="absolute -inset-10 bg-royal/20 rounded-full blur-xl opacity-70 animate-pulse-slow"></div>

            <a
              href="#pricing"
              onClick={scrollToPrices}
              className="relative inline-flex items-center px-8 py-4 sm:py-5 bg-gradient-to-r 
                       from-royal to-royal-light text-white rounded-xl font-medium shadow-lg 
                       shadow-royal/20 hover:shadow-xl hover:shadow-royal/30 hover:-translate-y-1 
                       transition-all duration-300 group z-10"
            >
              <FaDollarSign className="mr-2 group-hover:animate-bounce-slight" />
              <span className="text-lg">View Training Packages</span>
              <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
            </a>
          </div>

          <p className="text-white/60 text-sm mt-6 max-w-lg mx-auto">
            No contracts or long-term commitments. Flexible payment options
            available. Start your fitness journey today.
          </p>

          {/* Trust indicators */}
          <div className="flex items-center justify-center mt-5 space-x-4">
            <div className="flex">
              {[...Array(5)].map((_, i) => (
                <FaStar key={i} className="h-4 w-4 text-royal-light" />
              ))}
            </div>
            <span className="text-sm text-white/60 font-medium">
              Trusted by 100+ satisfied clients
            </span>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
