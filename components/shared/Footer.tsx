import { useRouter } from "next/router";
import Link from "next/link";
import {
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
  FaDumbbell,
  FaRegCalendarAlt,
  FaRegCreditCard,
  FaTiktok,
} from "react-icons/fa";
import Head from "next/head";
import { useState, useEffect } from "react";

// ===== SOCIAL MEDIA CONFIGURATION =====
// Update your social media links here
const SOCIAL_MEDIA = {
  instagram: {
    url: "https://instagram.com/flbesttrainer",
    enabled: true,
    icon: FaInstagram,
    label: "Follow us on Instagram",
  },
  facebook: {
    url: "https://facebook.com/flbesttrainer",
    enabled: true,
    icon: FaFacebook,
    label: "Follow us on Facebook",
  },
  youtube: {
    url: "https://youtube.com/@flbesttrainer",
    enabled: true,
    icon: FaYoutube,
    label: "Subscribe to our YouTube channel",
  },
  tiktok: {
    url: "https://tiktok.com/@flbesttrainer",
    enabled: false, // Set to true when you want to display this
    icon: FaTiktok,
    label: "Follow us on TikTok",
  },
};

// ===== CONTACT INFORMATION =====
// Update your contact details here
const CONTACT_INFO = {
  phone: {
    number: "+19285871309",
    display: "(928) 587-1309",
  },
  email: "flbesttrainer@gmail.com",
  location: "Southwest Florida Area",
};
// ===================================

export default function Footer() {
  const currentYear = new Date().getFullYear();
  const router = useRouter();

  const [cookieConsent, setCookieConsent] = useState(true); // Default to true to prevent banner on server
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
    const hasConsented = localStorage.getItem("cookie-consent") === "true";
    setCookieConsent(hasConsented);
  }, []);

  const footerLinks = {
    services: [
      { name: "In-Home Personal Training", href: "/training" },
      { name: "Custom Workout Plans", href: "/plans" },
      { name: "Classes", href: "/classes" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "#contact" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  };

  // Create a handler for testimonial navigation
  const handleTestimonialsClick = (e: React.MouseEvent) => {
    e.preventDefault();

    if (router.pathname === "/") {
      // If already on home page, just scroll to testimonials
      document.getElementById("testimonials")?.scrollIntoView({
        behavior: "smooth",
      });
    } else {
      // If on another page, navigate to home and then scroll to testimonials
      router.push("/?scrollTo=testimonials").then(() => {
        // Need a small delay to ensure the page has loaded
        setTimeout(() => {
          document.getElementById("testimonials")?.scrollIntoView({
            behavior: "smooth",
          });
        }, 500);
      });
    }
  };

  return (
    <>
      <Head>
        <script type="application/ld+json">
          {JSON.stringify({
            "@context": "https://schema.org",
            "@type": "LocalBusiness",
            name: "FL Best Trainer",
            description:
              "Southwest Florida's premier in-home personal training service",
            url: "https://flbesttrainer.com",
            telephone: CONTACT_INFO.phone.number,
            email: CONTACT_INFO.email,
            address: {
              "@type": "PostalAddress",
              addressRegion: "FL",
              addressCountry: "US",
            },
            geo: {
              "@type": "GeoCoordinates",
              latitude: "26.1420",
              longitude: "-81.7948",
            },
            openingHours: "Mo,Tu,We,Th,Fr,Sa 06:00-20:00",
          })}
        </script>
      </Head>
      <footer className="bg-gradient-to-b from-[#101010] to-[#1A1A1A] text-white/80 relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal/30 to-transparent"></div>

        {/* Main Footer Content */}
        <div className="relative container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-8">
            {/* Brand Section */}
            <div className="space-y-6">
              <div className="flex items-center space-x-4">
                <div className="relative w-12 h-12 group">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-r from-royal to-royal-light opacity-70 group-hover:opacity-90 transition-opacity" />
                  <div className="absolute inset-0.5 rounded-full bg-[#1A1A1A]" />
                  <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-royal-light group-hover:text-white transition-colors">
                    FL
                  </span>
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">
                    FL Best Trainer
                  </h3>
                  <p className="text-sm text-royal-light">
                    Personal Training Excellence
                  </p>
                </div>
              </div>
              <p className="text-sm leading-relaxed">
                Southwest Florida's premier in-home personal training service.
                Expert guidance, custom workout plans, and personalized
                attention in the comfort of your own space.
              </p>
              <div className="flex items-center space-x-4">
                {/* Dynamically generate social media links from configuration */}
                {Object.entries(SOCIAL_MEDIA)
                  .filter(([_, social]) => social.enabled)
                  .map(([platform, social]) => {
                    const Icon = social.icon;
                    return (
                      <a
                        key={platform}
                        href={social.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="bg-white/5 hover:bg-royal/30 p-2.5 rounded-full text-white/70 hover:text-white transition-all"
                        aria-label={social.label}
                      >
                        <Icon className="w-5 h-5" aria-hidden="true" />
                      </a>
                    );
                  })}
              </div>
            </div>

            {/* Services Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <FaDumbbell className="text-royal-light w-4 h-4" /> Services
              </h4>
              <ul className="space-y-3">
                {footerLinks.services.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-royal-light focus:text-royal-light focus:outline-none focus:ring-1 focus:ring-royal-light/50 rounded transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-royal-light/50 rounded-full group-hover:scale-125 transition-transform"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Company Links */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <FaRegCalendarAlt className="text-royal-light w-4 h-4" />{" "}
                Company
              </h4>
              <ul className="space-y-3">
                {footerLinks.company.map((link) => (
                  <li key={link.name}>
                    <Link
                      href={link.href}
                      className="text-sm hover:text-royal-light focus:text-royal-light focus:outline-none focus:ring-1 focus:ring-royal-light/50 rounded transition-colors flex items-center gap-2 group"
                    >
                      <span className="w-1.5 h-1.5 bg-royal-light/50 rounded-full group-hover:scale-125 transition-transform"></span>
                      {link.name}
                    </Link>
                  </li>
                ))}
                {/* Updated Testimonials link */}
                <li key="testimonials">
                  <a
                    href="#testimonials"
                    onClick={handleTestimonialsClick}
                    className="text-sm hover:text-royal-light transition-colors flex items-center gap-2 group"
                  >
                    <span className="w-1.5 h-1.5 bg-royal-light/50 rounded-full group-hover:scale-125 transition-transform"></span>
                    Testimonials
                  </a>
                </li>
              </ul>
            </div>

            {/* Contact Information */}
            <div>
              <h4 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                <FaEnvelope className="text-royal-light w-4 h-4" /> Contact
              </h4>
              <ul className="space-y-4">
                <li className="flex items-start space-x-3 group">
                  <FaMapMarkerAlt className="w-5 h-5 text-royal-light flex-shrink-0 mt-0.5 group-hover:text-royal transition-colors" />
                  <span className="text-sm">{CONTACT_INFO.location}</span>
                </li>
                <li className="flex items-center space-x-3 group">
                  <FaPhone className="w-5 h-5 text-royal-light flex-shrink-0 group-hover:text-royal transition-colors" />
                  <a
                    href={`tel:${CONTACT_INFO.phone.number}`}
                    className="text-sm hover:text-royal-light transition-colors"
                  >
                    {CONTACT_INFO.phone.display}
                  </a>
                </li>
                <li className="flex items-center space-x-3 group">
                  <FaEnvelope className="w-5 h-5 text-royal-light flex-shrink-0 group-hover:text-royal transition-colors" />
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="text-sm hover:text-royal-light transition-colors break-all"
                  >
                    {CONTACT_INFO.email}
                  </a>
                </li>

                {/* Book a Session button */}
                <li className="mt-4 pt-3 border-t border-white/5">
                  <Link
                    href="/training/#pricing"
                    className="bg-gradient-to-r from-royal to-royal-light/80 hover:opacity-90 transition-opacity flex items-center justify-center gap-2 py-3 px-4 rounded-lg w-full text-white text-sm font-medium shadow-lg shadow-royal/20"
                  >
                    <FaRegCreditCard className="w-4 h-4" />
                    Schedule In-Home Training
                  </Link>
                </li>

                {/* Click-to-call and email buttons */}
                <li className="flex flex-wrap items-center gap-2">
                  <a
                    href={`tel:${CONTACT_INFO.phone.number}`}
                    className="bg-royal/20 hover:bg-royal/30 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <FaPhone className="w-3 h-3" /> Call Now
                  </a>
                  <a
                    href={`mailto:${CONTACT_INFO.email}`}
                    className="bg-royal/20 hover:bg-royal/30 text-white px-3 py-1 rounded-full text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <FaEnvelope className="w-3 h-3" /> Email
                  </a>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="relative border-t border-white/10">
          <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div className="flex flex-col items-center md:items-start space-y-2">
                <p className="text-sm text-white/60">
                  &copy; {currentYear} FL Best Trainer. All rights reserved.
                </p>
                <p className="text-xs text-white/40">
                  Website Professionally Developed by{" "}
                  <a
                    href="https://www.gse.codes/"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="hover:text-royal-light transition-colors underline decoration-dotted underline-offset-2"
                  >
                    GSE Codes
                  </a>
                </p>
              </div>
              <div className="flex items-center flex-wrap gap-x-6 gap-y-2 justify-center">
                {footerLinks.legal.map((link) => (
                  <Link
                    key={link.name}
                    href={link.href}
                    className="text-sm text-white/60 hover:text-royal-light transition-colors"
                  >
                    {link.name}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Cookie Consent Banner - only shown after client-side mounting and when not consented */}
        {isMounted && !cookieConsent && (
          <div className="fixed bottom-0 left-0 right-0 bg-black/90 backdrop-blur-md z-50 border-t border-white/10 shadow-lg">
            <div className="container mx-auto px-4 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
              <p className="text-sm text-white/80">
                We use cookies to enhance your experience. By continuing to
                visit this site you agree to our use of cookies.
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    localStorage.setItem("cookie-consent", "true");
                    setCookieConsent(true);
                  }}
                  className="bg-royal hover:bg-royal-light px-4 py-2 rounded text-white text-sm transition-colors"
                >
                  Accept
                </button>
                <Link
                  href="/privacy"
                  className="bg-white/10 hover:bg-white/20 px-4 py-2 rounded text-white text-sm transition-colors"
                >
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        )}
      </footer>
    </>
  );
}
