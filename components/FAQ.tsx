import { useState } from 'react';

const questions = [
  {
    q: "Do you work with beginners?",
    a: "Yes! All levels are welcome — programs are customized to your goals and experience.",
  },
  {
    q: "Do I need gym equipment at home?",
    a: "No. I bring everything needed, or we use what you have.",
  },
  {
    q: "How do I book a session?",
    a: "Use the booking page to schedule via Calendly or reach out directly.",
  },
];

export default function FAQ() {
  const [openIndex, setOpenIndex] = useState<number | null>(null);

  return (
    <section className="py-12 bg-white">
      <h2 className="text-2xl text-center font-bold text-blue-900 mb-6">Frequently Asked Questions</h2>
      <div className="max-w-2xl mx-auto space-y-4 px-4">
        {questions.map((item, idx) => (
          <div key={idx} className="border-b pb-4">
            <button
              onClick={() => setOpenIndex(openIndex === idx ? null : idx)}
              className="text-left w-full text-blue-800 font-medium focus:outline-none"
            >
              {item.q}
            </button>
            {openIndex === idx && <p className="mt-2 text-sm text-gray-700">{item.a}</p>}
          </div>
        ))}
      </div>
    </section>
  );
}