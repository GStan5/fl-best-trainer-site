import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

export default function ProcessSteps() {
  const steps = [
    {
      number: "01",
      title: "Assessment",
      description:
        "Complete a detailed assessment about your goals, training history, available equipment, and any limitations.",
    },
    {
      number: "02",
      title: "Program Design",
      description:
        "Using your assessment, I'll create a custom workout plan specifically designed to match your needs and goals.",
    },
    {
      number: "03",
      title: "Detailed Instructions",
      description:
        "Receive your plan with clear instructions, video demos of exercises, and progression guidelines.",
    },
    {
      number: "04",
      title: "Implementation",
      description:
        "Start following your personalized plan with confidence, knowing each exercise was selected for you.",
    },
    {
      number: "05",
      title: "Progress Tracking",
      description:
        "Track your progress through our app or worksheets to monitor improvements and ensure continuous results.",
    },
    {
      number: "06",
      title: "Plan Updates",
      description:
        "As you progress, your plan will be updated to ensure continued growth and prevent plateaus.",
    },
  ];

  return (
    <div id="process" className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h2 className="text-3xl font-bold text-white mb-3">
          How <span className="text-royal">It Works</span>
        </h2>
        <div className="w-80 h-1 bg-gradient-to-r from-transparent via-royal to-transparent rounded-full mx-auto shadow-glow float-animation"></div>
        <p className="text-white/70 max-w-2xl mx-auto mt-4 text-sm ">
          Getting your personalized workout plan is simple. Follow these steps
          to start your fitness journey with a program designed specifically for
          you.
        </p>
      </motion.div>

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {steps.map((step, index) => (
          <motion.a
            href="#pricing"
            key={index}
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="bg-gradient-to-br from-white/8 to-white/5 hover:from-royal/10 hover:to-royal/5 rounded-lg p-4 border border-white/10 hover:border-royal/20 relative group transition-all duration-300 cursor-pointer flex flex-col h-full"
          >
            <div className="absolute -top-3 -left-3 w-7 h-7 bg-royal rounded-full flex items-center justify-center text-white text-xs font-bold shadow-lg shadow-royal/30 group-hover:scale-110 transition-transform duration-300">
              {step.number}
            </div>
            <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-royal transition-colors duration-300">
              {step.title}
            </h3>
            <p className="text-white/70 text-sm group-hover:text-white/90 transition-colors duration-300">
              {step.description}
            </p>
            <div className="mt-auto pt-3 text-sm text-royal opacity-0 group-hover:opacity-100 transition-all duration-300 flex items-center justify-end font-medium">
              Get Started <FaArrowRight className="ml-2 text-xs" />
            </div>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
