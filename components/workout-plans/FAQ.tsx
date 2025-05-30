import { useState } from "react";
import { motion } from "framer-motion";
import { FaChevronDown } from "react-icons/fa";

export default function FAQ() {
  const [activeIndex, setActiveIndex] = useState(null);

  const faqs = [
    {
      question: "How are your workout plans different from free ones online?",
      answer:
        "My workout plans are completely personalized to your specific body type, goals, available equipment, and any limitations or injuries you may have. Unlike generic plans, these are scientifically designed specifically for you and regularly updated based on your progress.",
    },
    {
      question: "Do I need special equipment for the workouts?",
      answer:
        "Not at all! I design your plan based on the equipment you have access to. Whether you have a fully equipped gym, basic home equipment, or no equipment at all, I'll create an effective program that works with what you have.",
    },
    {
      question: "How often will my workout plan be updated?",
      answer:
        "This depends on your chosen plan. Basic plans receive monthly updates, Premium plans bi-weekly updates, and Elite plans weekly updates all per request. Each update is based on your progress feedback to ensure continuous improvement.",
    },
    {
      question: "Can I switch between gym and home workouts?",
      answer:
        "Absolutely! I can design your program with flexibility in mind, providing alternative exercises for both gym and home environments so you can train effectively regardless of your location.",
    },
    {
      question: "Is nutrition guidance included with the workout plans?",
      answer:
        "Basic nutritional guidelines are included with Premium and Elite plans. The Elite plan includes comprehensive nutrition planning tailored to your specific goals and dietary preferences.",
    },
  ];

  const toggleFAQ = (index) => {
    setActiveIndex(activeIndex === index ? null : index);
  };

  return (
    <div id="faq" className="py-12">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          Frequently
          <span className="text-royal"> Asked Questions</span>
        </h2>
        {/* Animated line */}
        <div className="w-80 h-1 bg-gradient-to-r from-transparent via-royal to-transparent rounded-full mx-auto shadow-glow float-animation mb-6"></div>
        <p className="text-white/70 max-w-3xl mx-auto">
          Have questions about my workout plans? Find quick answers to the most
          common questions below.
        </p>
      </motion.div>

      <div className="max-w-4xl mx-auto">
        {faqs.map((faq, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: index * 0.1 }}
            className="mb-4"
          >
            <button
              className={`w-full text-left p-5 rounded-lg flex justify-between items-center ${
                activeIndex === index
                  ? "bg-royal text-white"
                  : "bg-white/5 text-white hover:bg-white/10"
              } transition-all duration-300`}
              onClick={() => toggleFAQ(index)}
            >
              <span className="font-medium text-lg">{faq.question}</span>
              <FaChevronDown
                className={`transform transition-transform ${
                  activeIndex === index ? "rotate-180" : ""
                }`}
              />
            </button>

            {activeIndex === index && (
              <div className="bg-white/5 p-5 rounded-b-lg mt-px">
                <p className="text-white/80">{faq.answer}</p>
              </div>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  );
}
