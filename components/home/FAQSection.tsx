import { useState } from "react";
import { CANCELLATION_POLICY } from "../../config/cancellation";

export default function FAQSection() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  const faqs = [
    {
      question: "Do I need any equipment for in-home training?",
      answer:
        "No, all necessary equipment is provided for your in-home sessions at no extra cost.",
    },
    {
      question: "How often should I schedule training sessions?",
      answer:
        "For optimal results, 2-3 sessions per week is recommended, but your program will be customized to your specific goals and schedule.",
    },
    {
      question: "What areas do you service in Florida?",
      answer:
        "Services are available throughout South Florida, including Broward and Miami-Dade counties.",
    },
    {
      question: "Can I cancel or reschedule my session?",
      answer: CANCELLATION_POLICY.getFAQMessage(),
    },
  ];

  return (
    <section className="py-20 bg-[#1A1A1A] relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4 text-center">
          Frequently Asked Questions
        </h2>
        <p className="text-lg text-white/70 mb-12 text-center max-w-2xl mx-auto">
          Find answers to common questions about our personal training services
        </p>

        <div className="max-w-3xl mx-auto">
          {faqs.map((faq, idx) => (
            <div key={idx} className="mb-6">
              <button
                onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
                className="flex justify-between items-center w-full text-left p-4 sm:p-5 
                  bg-black/30 backdrop-blur-sm border border-white/10 rounded-xl 
                  hover:border-royal/30 transition-all duration-300"
              >
                <span className="text-base sm:text-lg font-medium text-white">
                  {faq.question}
                </span>
                <span className="text-royal-light text-xl ml-4 flex-shrink-0">
                  {openIndex === idx ? "−" : "+"}
                </span>
              </button>

              {openIndex === idx && (
                <div
                  className="p-4 sm:p-5 bg-black/20 backdrop-blur-sm border-x border-b border-white/10 rounded-b-xl
                  animate-fade-in"
                >
                  <p className="text-white/80">{faq.answer}</p>
                </div>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
