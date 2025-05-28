"use client";
import { useEffect, useState } from "react";
import Layout from "@/components/shared/Layout";
import CoreBenefits from "@/components/home/CoreBenefits";
import Stats from "@/components/home/Stats";
import dynamic from "next/dynamic";
import TrainingPricing from "@/components/training/TrainingPricing";
import ContactSection from "@/components/training/ContactSection";

// Dynamically import components that use browser APIs
const Hero = dynamic(() => import("@/components/home/Hero"), { ssr: false });
const HowItWorks = dynamic(() => import("@/components/home/HowItWorks"), {
  ssr: false,
});
const TestimonialCarousel = dynamic(
  () => import("@/components/home/TestimonialCarousel"),
  { ssr: false }
);
const FAQSection = dynamic(() => import("@/components/home/FAQSection"), {
  ssr: false,
});
const InstagramFeed = dynamic(() => import("@/components/home/InstagramFeed"), {
  ssr: false,
});
const Newsletter = dynamic(() => import("@/components/home/Newsletter"), {
  ssr: false,
});
const CTASection = dynamic(() => import("@/components/home/CTASection"), {
  ssr: false,
});

export default function Home() {
  const [nameBackgroundOpacity, setNameBackgroundOpacity] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const handleScroll = () => {
      const opacity = Math.max(0, 1 - (window.scrollY - 200) / 200);
      setNameBackgroundOpacity(opacity);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <Layout>
      {isMounted && (
        <>
          <Hero nameBackgroundOpacity={nameBackgroundOpacity} />

          <CoreBenefits />

          <Stats />

          {/* Main content sections with navy background */}
          <div className="bg-gradient-to-b from-navy via-royal-dark to-navy">
            <HowItWorks />

            <TestimonialCarousel />
            <TrainingPricing />
          </div>
          <InstagramFeed />
          {/* <Newsletter /> */}
          <CTASection />
          <ContactSection />
        </>
      )}
    </Layout>
  );
}
