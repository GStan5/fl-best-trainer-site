import { motion } from "framer-motion";

export default function HowItWorks() {
  const steps = [
    {
      number: "01",
      title: "Initial Consultation",
      description:
        "We discuss your goals, fitness level, and home setup to create a personalized plan.",
    },
    {
      number: "02",
      title: "Custom Program Design",
      description:
        "I design a program that works with your space and equipment for efficient workouts.",
    },
    {
      number: "03",
      title: "In-Home Sessions",
      description:
        "I come to your home at scheduled times for personalized training sessions.",
    },
    {
      number: "04",
      title: "Progress Tracking",
      description:
        "Regular assessments to monitor improvement and adjust your program as you advance.",
    },
  ];

  return (
    <section className="py-20 bg-black relative">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <motion.h2
            className="text-3xl sm:text-4xl font-bold text-white mb-4"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5 }}
          >
            How <span className="text-royal-light">It Works</span>
          </motion.h2>
          <motion.p
            className="text-lg text-white/70"
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            Simple, streamlined process to get you started with your personal
            training journey
          </motion.p>
        </div>

        {/* Both mobile and desktop view - card-based timeline */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {steps.map((step, index) => (
            <motion.div
              key={index}
              className="bg-black/30 backdrop-blur-sm border border-white/5 rounded-xl p-6 relative"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
            >
              {/* Step number with accent */}
              <div className="flex items-center mb-4">
                <div className="text-4xl font-bold text-royal/20 mr-3">
                  {step.number}
                </div>
                <div className="h-0.5 flex-grow bg-gradient-to-r from-royal/50 to-transparent"></div>
              </div>

              {/* Step title */}
              <h3 className="text-xl font-bold text-white mb-3">
                {step.title}
              </h3>

              {/* Step description */}
              <p className="text-white/70">{step.description}</p>

              {/* Connector arrow to next step, except for last item */}
              {index < steps.length - 1 && (
                <div className="hidden lg:block absolute -right-3 top-1/2 transform translate-x-1/2 -translate-y-1/2 w-6 h-6 text-royal">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.28 11.47a.75.75 0 010 1.06l-7.5 7.5a.75.75 0 01-1.06-1.06L14.69 12 7.72 5.03a.75.75 0 011.06-1.06l7.5 7.5z"
                      clipRule="evenodd"
                    />
                  </svg>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
