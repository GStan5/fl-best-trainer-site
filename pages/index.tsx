"use client";
import { useEffect, useState } from "react";
import Head from "next/head";
import Layout from "@/components/shared/Layout";
import CoreBenefits from "@/components/home/CoreBenefits";
import TestimonialCarousel from "@/components/home/TestimonialCarousel";
import Hero from "@/components/home/Hero";
import InstagramFeed from "@/components/home/InstagramFeed";
import TrainingPricing from "@/components/training/TrainingPricing";
import ContactSection from "@/components/training/ContactSection";
import { useRouter } from "next/router";

export default function Home() {
  const router = useRouter();
  const [nameBackgroundOpacity, setNameBackgroundOpacity] = useState(1);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);

    const handleScroll = () => {
      const opacity = Math.max(0, 1 - (window.scrollY - 200) / 200);
      setNameBackgroundOpacity(opacity);
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
      setIsMounted(false);
    };
  }, []);

  useEffect(() => {
    // Check if we should scroll to testimonials
    if (
      router.query.scrollTo === "testimonials" &&
      typeof window !== "undefined"
    ) {
      setTimeout(() => {
        document.getElementById("testimonials")?.scrollIntoView({
          behavior: "smooth",
        });
      }, 300);
    }
  }, [router.query]);

  return (
    <>
      <Head>
        <title>
          FL Best Trainer | In-Home Personal Training in Southwest Florida
        </title>
        <meta
          name="description"
          content="Premium in-home personal training in Southwest Florida. Expert guidance, customized workout plans, and proven results that come to you."
        />
        <meta
          name="keywords"
          content="personal trainer, in-home training, Southwest Florida, Bradenton, Anna Maria Island, Longboat Key Sarasota, fitness coach"
        />

        {/* Open Graph / Facebook */}
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://flbesttrainer.com" />
        <meta
          property="og:title"
          content="FL Best Trainer | In-Home Personal Training in Southwest Florida"
        />
        <meta
          property="og:description"
          content="Premium in-home personal training in Southwest Florida. Expert guidance, customized workout plans, and proven results that come to you."
        />
        <meta
          property="og:image"
          content="https://flbesttrainer.com/images/og-image.jpg"
        />

        {/* Twitter */}
        <meta property="twitter:card" content="summary_large_image" />
        <meta property="twitter:url" content="https://flbesttrainer.com" />
        <meta
          property="twitter:title"
          content="FL Best Trainer | In-Home Personal Training in Southwest Florida"
        />
        <meta
          property="twitter:description"
          content="Premium in-home personal training in Southwest Florida. Expert guidance, customized workout plans, and proven results that come to you."
        />
        <meta
          property="twitter:image"
          content="https://flbesttrainer.com/images/og-image.jpg"
        />

        {/* Canonical URL */}
        <link rel="canonical" href="https://flbesttrainer.com" />
      </Head>

      <Layout>
        {isMounted && (
          <>
            <Hero nameBackgroundOpacity={nameBackgroundOpacity} />
            <CoreBenefits />

            {/* Main content sections with navy background */}
            <div className="bg-gradient-to-b from-navy via-royal-dark to-navy">
              <TestimonialCarousel />
              <TrainingPricing id="pricing" />
            </div>

            {/* <InstagramFeed /> */}
            <ContactSection id="contact" />
          </>
        )}
      </Layout>
    </>
  );
}
