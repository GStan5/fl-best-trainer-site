import Link from "next/link";
import { FaPhone, FaCalendarAlt, FaDumbbell } from "react-icons/fa";

export default function CTASection() {
  return (
    <section className="py-20 bg-black/50 backdrop-blur-sm relative overflow-hidden">
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal/50 to-transparent"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
        <h2 className="text-3xl sm:text-4xl font-bold text-white mb-6">
          Ready to Transform Your Fitness Journey?
        </h2>
        <p className="text-lg text-white/70 mb-10 max-w-2xl mx-auto">
          Take the first step toward achieving your fitness goals with
          professional guidance and personalized training.
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-6 flex-wrap">
          <a
            href="tel:+1234567890"
            className="flex items-center px-8 py-3 bg-royal text-white rounded-xl font-medium hover:bg-royal-light transition-all duration-300"
          >
            <FaPhone className="mr-2" />
            Call Now
          </a>

          <Link
            href="/contact"
            className="flex items-center px-8 py-3 bg-white/10 text-white rounded-xl font-medium hover:bg-white/20 transition-all duration-300"
          >
            <FaCalendarAlt className="mr-2" />
            Schedule Consultation
          </Link>

          <Link
            href="/plans"
            className="flex items-center px-8 py-3 bg-gradient-to-r from-royal to-royal-light text-white rounded-xl font-medium hover:from-royal-light hover:to-royal transition-all duration-300"
          >
            <FaDumbbell className="mr-2" />
            Purchase Workout Plan
          </Link>
        </div>
      </div>
    </section>
  );
}
