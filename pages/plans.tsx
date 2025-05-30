import Layout from "../components/shared/Layout";
import SEO from "@/components/shared/SEO";
import Hero from "../components/workout-plans/Hero";
import PlanTypes from "../components/workout-plans/PlanTypes";
import Benefits from "../components/workout-plans/Benefits";
import ProcessSteps from "../components/workout-plans/ProcessSteps";
import PricingPlans from "../components/workout-plans/PricingPlans";
import FAQ from "../components/workout-plans/FAQ";
import ContactSection from "@/components/training/ContactSection";

export default function WorkoutPlans() {
  // FAQ data is needed for schema
  const faqData = [
    {
      question:
        "How are your workout plans different from free programs online?",
      answer:
        "My workout plans are custom-designed for your specific goals, fitness level, and available equipment. Unlike generic templates, I factor in your health history, any injuries, and create a progressive program that evolves as you improve.",
    },
    {
      question: "Can I get a workout plan if I don't have gym equipment?",
      answer:
        "Absolutely! I design plans for all settings, including home workouts with minimal or no equipment. We'll work with what you have available and still create an effective program.",
    },
    {
      question: "How often are the workout plans updated?",
      answer:
        "For ongoing clients, I typically update plans every 4-6 weeks depending on your progress. This progressive overload approach ensures continuous improvement and prevents plateaus.",
    },
    {
      question: "Do workout plans include nutrition guidance?",
      answer:
        "Basic nutrition guidelines are included with all workout plans. For comprehensive nutrition coaching with meal plans, you can add on my nutrition package.",
    },
    {
      question: "What if the plan isn't working for me?",
      answer:
        "Client feedback is crucial to my process. If something isn't working, I'll make adjustments to your plan at no additional cost within the first 14 days to ensure it's perfectly aligned with your needs.",
    },
  ];

  // Structured data for the page
  const schema = {
    "@context": "https://schema.org",
    "@type": "ItemPage",
    name: "Custom Workout Plans | FL Best Trainer",
    description:
      "Custom workout plans designed by NASM certified trainer. Personalized programs for in-home, gym, and remote training to meet your fitness goals.",
    provider: {
      "@type": "LocalBusiness",
      name: "FL Best Trainer",
      telephone: "+19285871309",
      address: {
        "@type": "PostalAddress",
        addressRegion: "FL",
        addressCountry: "US",
      },
    },
    mainEntity: {
      "@type": "Service",
      name: "Custom Workout Plan Service",
      description:
        "Personalized workout programs designed specifically for your fitness level, goals, and available equipment. Each plan includes exercise demonstrations, progression tracking, and direct trainer support.",
      offers: {
        "@type": "AggregateOffer",
        priceCurrency: "USD",
        lowPrice: "149",
        highPrice: "299",
        offerCount: "3",
      },
      areaServed: {
        "@type": "GeoCircle",
        geoMidpoint: {
          "@type": "GeoCoordinates",
          latitude: "26.1420",
          longitude: "-81.7948",
        },
        geoRadius: "30000",
      },
    },
    // FAQ Schema
    mainContentOfPage: {
      "@type": "WebPageElement",
      mainContentOfPage: {
        "@type": "FAQPage",
        mainEntity: faqData.map((item) => ({
          "@type": "Question",
          name: item.question,
          acceptedAnswer: {
            "@type": "Answer",
            text: item.answer,
          },
        })),
      },
    },
  };

  return (
    <Layout>
      <SEO
        title="Custom Workout Plans | FL Best Trainer | Southwest Florida"
        description="Expert-designed custom workout plans for all fitness levels. Personalized programs for home, gym, or travel by a certified trainer in Bradenon, Sarasota, Anna Maria Island, and Longboat Key Florida."
        keywords="custom workout plans, personal training programs, home workouts, gym programs, Southwest Florida personal trainer, fitness programs, NASM certified trainer"
        url="/plans"
        ogImage="/images/workout-plans-og.jpg"
        schema={schema}
      />

      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <section className="py-16 bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Types of Workout Plans */}
          <PlanTypes />

          {/* Benefits of Custom Plans */}
          <div className="py-8">
            <hr className="border-white/10 my-8" />
            <Benefits />
          </div>

          {/* Process Steps */}
          <div className="py-8">
            <hr className="border-white/10 my-8" />
            <ProcessSteps />
          </div>
        </div>
      </section>

      {/* Pricing Plans */}
      <section className="py-16 bg-[#0A0A0A]" id="pricing">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <PricingPlans />

          {/* FAQ */}
          <div className="py-8 mt-12" id="faq">
            <hr className="border-white/10 my-8" />
            <FAQ />
          </div>
        </div>
      </section>

      {/* Contact Section */}
      <ContactSection id="contact" />
    </Layout>
  );
}
