import { benefits } from "@/data/benefits";
import { BenefitCard } from "../shared/BenefitCard";

export default function CoreBenefits() {
  return (
    <section className="relative bg-gradient-to-b from-[#1A1A1A] to-navy py-14 sm:py-16">
      {/* Subtle separator line */}
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal/20 to-transparent"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-8 sm:mb-10">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-3">
            Transform Your{" "}
            <span className="text-royal-light">Fitness Journey</span>
          </h2>
          <p className="text-base text-white/70 max-w-2xl mx-auto">
            Premium personal training tailored to your goals, delivered in the
            comfort of your own space.
          </p>
        </div>

        {/* Optimized grid layout - goes to 2 columns on sm screens */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4 max-w-5xl mx-auto">
          {benefits.map((benefit, index) => (
            <BenefitCard
              key={index}
              {...benefit}
              className={
                index === benefits.length - 1 && benefits.length % 2 !== 0
                  ? "sm:col-span-2 lg:col-span-1"
                  : ""
              }
            />
          ))}
        </div>
      </div>
    </section>
  );
}
