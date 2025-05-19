import Link from "next/link";
import {
  FaInstagram,
  FaFacebook,
  FaYoutube,
  FaMapMarkerAlt,
  FaPhone,
  FaEnvelope,
} from "react-icons/fa";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  const footerLinks = {
    services: [
      { name: "Personal Training", href: "/services#personal-training" },
      { name: "Group Sessions", href: "/services#group-sessions" },
      { name: "Nutrition Planning", href: "/services#nutrition" },
      { name: "Online Coaching", href: "/services#online" },
    ],
    company: [
      { name: "About", href: "/about" },
      { name: "Testimonials", href: "/testimonials" },
      { name: "Blog", href: "/blog" },
      { name: "Contact", href: "/contact" },
    ],
    legal: [
      { name: "Privacy Policy", href: "/privacy" },
      { name: "Terms of Service", href: "/terms" },
    ],
  };

  return (
    <footer className="bg-[#1A1A1A] text-white/80">
      {/* Main Footer Content */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">
          {/* Brand Section */}
          <div className="space-y-6">
            <div className="flex items-center space-x-4">
              <div className="relative w-10 h-10">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-royal to-royal-light opacity-70" />
                <div className="absolute inset-0.5 rounded-full bg-[#1A1A1A]" />
                <span className="absolute inset-0 flex items-center justify-center text-xl font-bold text-royal-light">
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
              Transform your fitness journey with expert personal training that
              comes to you. NASM certified training for sustainable results.
            </p>
            <div className="flex items-center space-x-4">
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-royal-light transition-colors"
              >
                <FaInstagram className="w-6 h-6" />
              </a>
              <a
                href="https://facebook.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-royal-light transition-colors"
              >
                <FaFacebook className="w-6 h-6" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-white/60 hover:text-royal-light transition-colors"
              >
                <FaYoutube className="w-6 h-6" />
              </a>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Services</h4>
            <ul className="space-y-3">
              {footerLinks.services.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-royal-light transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Company</h4>
            <ul className="space-y-3">
              {footerLinks.company.map((link) => (
                <li key={link.name}>
                  <Link
                    href={link.href}
                    className="text-sm hover:text-royal-light transition-colors"
                  >
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Information */}
          <div>
            <h4 className="text-lg font-semibold text-white mb-6">Contact</h4>
            <ul className="space-y-4">
              <li className="flex items-start space-x-3">
                <FaMapMarkerAlt className="w-5 h-5 text-royal-light flex-shrink-0 mt-0.5" />
                <span className="text-sm">Southwest Florida Area</span>
              </li>
              <li className="flex items-center space-x-3">
                <FaPhone className="w-5 h-5 text-royal-light flex-shrink-0" />
                <a
                  href="tel:+1234567890"
                  className="text-sm hover:text-royal-light transition-colors"
                >
                  (928) 687-1309
                </a>
              </li>
              <li className="flex items-center space-x-3">
                <FaEnvelope className="w-5 h-5 text-royal-light flex-shrink-0" />
                <a
                  href="mailto:contact@flbesttrainer.com"
                  className="text-sm hover:text-royal-light transition-colors"
                >
                  GavinStanifer@Live.com
                </a>
              </li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/10">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
            <p className="text-sm text-white/60">
              &copy; {currentYear} FL Best Trainer. All rights reserved.
            </p>
            <div className="flex items-center space-x-6">
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
    </footer>
  );
}
