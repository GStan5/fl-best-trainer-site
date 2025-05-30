import Layout from "../components/shared/Layout";
import { FaEnvelope, FaPhone, FaMapMarkerAlt } from "react-icons/fa";

// Import components
import Hero from "../components/about/Hero";
import ApproachTabs from "../components/about/ApproachTabs";
import Timeline from "../components/about/Timeline";
import Certifications from "../components/about/Certifications";
import ServicesHighlight from "../components/about/ServicesHighlight";
import Stats from "../components/about/Stats";
import ContactSection from "@/components/training/ContactSection";
import SEO from "@/components/shared/SEO";

export default function About() {
  // Person schema for better representation in search results
  const schema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "Gavin Stanifer",
    jobTitle: "NASM Certified Personal Trainer",
    description:
      "Personal trainer with over 10 years of experience serving Southwest Florida, including Bradenton, Sarasota, Anna Maria Island, and Longboat Key.",
    image: "https://flbesttrainer.com/images/gavin-trainer.jpg",
    url: "https://flbesttrainer.com/about",
    sameAs: [
      "https://instagram.com/flbesttrainer",
      "https://facebook.com/flbesttrainer",
    ],
    worksFor: {
      "@type": "Organization",
      name: "FL Best Trainer",
      url: "https://flbesttrainer.com",
    },
    address: {
      "@type": "PostalAddress",
      addressRegion: "FL",
      addressCountry: "US",
    },
    alumniOf: [
      {
        "@type": "Organization",
        name: "National Academy of Sports Medicine (NASM)",
        url: "https://www.nasm.org/",
      },
    ],
    hasCredential: [
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certification",
        name: "NASM Certified Personal Trainer (CPT)",
        validFrom: "2013",
      },
      {
        "@type": "EducationalOccupationalCredential",
        credentialCategory: "certification",
        name: "NASM Corrective Exercise Specialist (CES)",
      },
    ],
  };

  return (
    <Layout>
      <SEO
        title="About Gavin Stanifer | FL Best Trainer | Southwest Florida Personal Training"
        description="Meet Gavin Stanifer, NASM certified personal trainer with 10+ years of experience serving Bradenton, Sarasota, Anna Maria Island, & Longboat Key. Learn about my expertise, background, and approach to fitness."
        keywords="personal trainer bio, Gavin Stanifer, NASM certified, fitness professional, Bradenton personal trainer, Sarasota fitness coach, Anna Maria Island trainer, Longboat Key fitness"
        url="/about"
        ogImage="/images/about-gavin.jpg"
        schema={schema}
      />

      {/* Hero Section */}
      <Hero />

      {/* Main Content */}
      <section className="py-16 bg-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          {/* Approach Tabs */}
          <ApproachTabs />

          {/* Stats */}
          <div className="py-8">
            <hr className="border-white/10 my-8" />
            <Stats />
          </div>

          {/* Timeline */}
          {/* <div className="py-8">
            <hr className="border-white/10 my-8" />
            <Timeline />
          </div> */}

          {/* Certifications */}
          {/* <div className="py-8">
            <hr className="border-white/10 my-8" />
            <Certifications />
          </div> */}
        </div>
      </section>

      {/* Services Highlight */}
      <section className="py-16 bg-gradient-to-b from-[#080808] to-[#0A0A0A]">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <ServicesHighlight />
        </div>
      </section>

      <ContactSection />
    </Layout>
  );
}
