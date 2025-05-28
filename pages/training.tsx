import { useEffect, useState } from "react";
import Layout from "@/components/shared/Layout";
import dynamic from "next/dynamic";
import TrainingHero from "@/components/training/TrainingHero";

// Dynamically import components that use browser APIs
const TrainingProcess = dynamic(
  () => import("@/components/training/TrainingProcess"),
  { ssr: false }
);
const TrainingBenefits = dynamic(
  () => import("@/components/training/TrainingBenefits"),
  { ssr: false }
);
const TrainingPricing = dynamic(
  () => import("@/components/training/TrainingPricing"),
  { ssr: false }
);
const ContactSection = dynamic(
  () => import("@/components/training/ContactSection"),
  { ssr: false }
);
// Dynamically import TestimonialCarousel correctly
const TestimonialCarousel = dynamic(
  () => import("@/components/home/TestimonialCarousel"),
  { ssr: false }
);

export default function InHomeTraining() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  return (
    <Layout>
      {isMounted && (
        <>
          <TrainingHero />
          <TrainingBenefits />
          <TrainingProcess />
          <TrainingPricing />
          <TestimonialCarousel />
          <ContactSection />
        </>
      )}
    </Layout>
  );
}
