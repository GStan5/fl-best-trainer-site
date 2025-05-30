import { useEffect, useState } from "react";
import Layout from "@/components/shared/Layout";
import TrainingHero from "@/components/training/TrainingHero";
import TrainingProcess from "@/components/training/TrainingProcess";
import TrainingBenefits from "@/components/training/TrainingBenefits";
import TrainingPricing from "@/components/training/TrainingPricing";
import ContactSection from "@/components/training/ContactSection";
import TestimonialCarousel from "@/components/home/TestimonialCarousel";
import SEO from "@/components/shared/SEO";

export default function InHomeTraining() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Define cities served for both display and schema
  const citiesServed = [
    "Bradenton",
    "Anna Maria Island",
    "Longboat Key",
    "Sarasota",
    "Lakewood Ranch",
  ];

  // Define schema for the training page
  const schema = {
    "@context": "https://schema.org",
    "@type": "Service",
    name: "In-Home Personal Training",
    serviceType: "Personal Training",
    provider: {
      "@type": "LocalBusiness",
      name: "FL Best Trainer",
      address: {
        "@type": "PostalAddress",
        addressRegion: "FL",
        addressCountry: "US",
      },
      telephone: "+19285871309",
    },
    description:
      "Professional in-home personal training service in Southwest Florida. Get expert fitness coaching and customized workouts in the comfort of your own space.",
    areaServed: citiesServed.map((city) => ({
      "@type": "City",
      name: city,
    })),
    offers: {
      "@type": "Offer",
      price: "150.00",
      priceCurrency: "USD",
      priceSpecification: {
        "@type": "UnitPriceSpecification",
        price: "150.00",
        priceCurrency: "USD",
        unitText: "session",
      },
    },
    termsOfService: "https://flbesttrainer.com/terms",
    hasOfferCatalog: {
      "@type": "OfferCatalog",
      name: "Personal Training Packages",
      itemListElement: [
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Trial Session (60 Minutes)",
          },
          price: "150.00",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Starter Package (8 Sessions)",
          },
          price: "1040.00",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Commitment Package (12 Sessions)",
          },
          price: "1440.00",
          priceCurrency: "USD",
        },
        {
          "@type": "Offer",
          itemOffered: {
            "@type": "Service",
            name: "Transform Package (24 Sessions)",
          },
          price: "2400.00",
          priceCurrency: "USD",
        },
      ],
    },
  };

  return (
    <Layout>
      <SEO
        title="In-Home Personal Training | FL Best Trainer | Southwest Florida"
        description="Expert in-home personal training in Bradenton, Anna Maria Island, and Longboat Key. Get customized workouts and coaching in the comfort of your own space."
        keywords="in-home personal training, mobile personal trainer, Bradenton personal trainer, Anna Maria Island fitness, Longboat Key workouts, in-home workouts, Southwest Florida trainer"
        url="/training"
        ogImage="/images/training-og.jpg"
        schema={schema}
      />

      {isMounted && (
        <>
          <TrainingHero />
          <TrainingBenefits />
          <TrainingProcess />
          <TrainingPricing id="pricing" />
          <TestimonialCarousel />
          <ContactSection id="contact" />
        </>
      )}
    </Layout>
  );
}
