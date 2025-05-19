import { benefits } from "@/data/benefits";
import { BenefitCard } from "../shared/BenefitCard";

export default function CoreBenefits() {
  return (
    <section className="relative bg-gradient-to-b from-[#1A1A1A] to-navy py-24 lg:py-32">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl 2xl:text-6xl font-heading font-bold text-white mb-6">
            Transform Your Body.{" "}
            <span className="text-royal-light">Transform Your Life.</span>
          </h2>
          <p className="text-lg md:text-xl text-white/80 max-w-3xl mx-auto">
            Experience premium personal training that comes to you, with proven
            results and a commitment to your success.
          </p>
        </div>

        <div className="grid lg:grid-cols-3 gap-8 lg:gap-12">
          {benefits.map((benefit, index) => (
            <BenefitCard key={index} {...benefit} />
          ))}
        </div>
      </div>
    </section>
  );
}
