import { useEffect, useState } from "react";
import Layout from "@/components/shared/Layout";
import Hero from "@/components/home/Hero";
import CoreBenefits from "@/components/home/CoreBenefits";
import Stats from "@/components/home/Stats";
import HowItWorks from "@/components/home/HowItWorks";
import PricingSection from "@/components/home/PricingSection";
import TestimonialCarousel from "@/components/home/TestimonialCarousel";

export default function Home() {
  const [nameBackgroundOpacity, setNameBackgroundOpacity] = useState(1);

  useEffect(() => {
    const handleScroll = () => {
      const opacity = Math.max(0, 1 - (window.scrollY - 200) / 200);
      setNameBackgroundOpacity(opacity);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Layout>
      <Hero nameBackgroundOpacity={nameBackgroundOpacity} />

      <CoreBenefits />

      <Stats />

      {/* Main content sections with navy background */}
      <div className="bg-gradient-to-b from-navy via-royal-dark to-navy">
        <HowItWorks />
        <PricingSection />
        <TestimonialCarousel />
      </div>
    </Layout>
  );
}
