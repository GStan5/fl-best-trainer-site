import { motion } from "framer-motion";
import {
  FaPhone,
  FaEnvelope,
  FaMapMarkerAlt,
  FaSms,
  FaShieldAlt,
  FaUserPlus,
  FaStar,
} from "react-icons/fa";
import { useEffect, useState } from "react";

export default function ContactSection() {
  const [mounted, setMounted] = useState(false);

  // Mount check for animations
  useEffect(() => {
    setMounted(true);
  }, []);

  // Enhanced vCard function for better cross-platform compatibility
  const generateVCard = () => {
    const vCardData = `BEGIN:VCARD
VERSION:3.0
N:Stanifer;Gavin;;;
FN:Gavin Stanifer
TEL;TYPE=CELL:(928) 587-1309
EMAIL:flbesttrainer@gmail.com
URL:https://flbesttrainer.com
NOTE:Personal Trainer - Serving Manatee and Sarasota Counties
END:VCARD`;

    return "data:text/vcard;charset=utf-8," + encodeURIComponent(vCardData);
  };

  // Animation variants for staggered animations
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: { type: "spring", stiffness: 100 },
    },
  };

  useEffect(() => {
    // Check if the URL has the contact hash
    const handleHashChange = () => {
      if (window.location.hash === "#contact") {
        const contactElement = document.getElementById("contact");
        if (contactElement) {
          contactElement.classList.add("highlight-section");
          // Remove highlight after animation completes
          setTimeout(() => {
            contactElement.classList.remove("highlight-section");
          }, 1500);
        }
      }
    };

    // Run once on mount and whenever hash changes
    window.addEventListener("hashchange", handleHashChange);
    handleHashChange(); // Check on initial load

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  return (
    <section
      id="contact"
      className="py-16 sm:py-20 bg-gradient-to-b from-black to-navy-dark relative overflow-hidden"
    >
      {/* Background pattern */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>

      {/* Animated background glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-2/3 h-1/3 bg-royal/20 rounded-full blur-[100px] -z-0 animate-pulse-slow"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <motion.div
          className="max-w-4xl mx-auto bg-gradient-to-b from-black/80 to-black/40 backdrop-blur-lg border border-white/10 rounded-2xl overflow-hidden shadow-2xl shadow-royal/10"
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, type: "spring" }}
        >
          <div className="relative">
            {/* Decorative top border glow */}
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-royal/70 to-transparent"></div>

            <div className="p-6 sm:p-8 md:p-12">
              <motion.div
                className="text-center"
                initial="hidden"
                animate={mounted ? "visible" : "hidden"}
                variants={containerVariants}
              >
                {/* Availability Badge */}
                <motion.div
                  className="inline-flex items-center bg-gradient-to-r from-royal-dark/60 to-royal/60 rounded-full px-4 py-1.5 mb-6 shadow-lg shadow-royal/20"
                  variants={itemVariants}
                >
                  <div className="h-2 w-2 rounded-full bg-green-400 mr-2 animate-pulse"></div>
                  <span className="text-white/90 text-xs font-medium">
                    Available for new clients
                  </span>
                </motion.div>

                {/* Title with animation */}
                <motion.h2
                  className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4 tracking-tight"
                  variants={itemVariants}
                >
                  Ready to{" "}
                  <motion.span
                    className="text-royal-light bg-gradient-to-r from-royal to-royal-light bg-clip-text text-transparent"
                    initial={{ opacity: 0.7 }}
                    animate={{ opacity: [0.7, 1, 0.7] }}
                    transition={{ duration: 2, repeat: Infinity }}
                  >
                    Get Started?
                  </motion.span>
                </motion.h2>

                {/* Enhanced subtitle */}
                <motion.p
                  className="text-white/70 mb-12 max-w-2xl mx-auto text-base sm:text-lg"
                  variants={itemVariants}
                >
                  Ready to{" "}
                  <span className="text-royal-light font-medium">
                    transform your mind and body?
                  </span>{" "}
                  Choose the contact method that works best for you, and I'll
                  respond promptly to help you start your fitness journey.
                </motion.p>

                {/* Contact cards */}
                <motion.div
                  className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 mb-10"
                  variants={containerVariants}
                >
                  {/* Call Me */}
                  <motion.div
                    className="relative bg-gradient-to-b from-black/80 to-navy-dark/60 border border-white/10 rounded-xl p-5 sm:p-6 hover:border-royal/40 transition-all duration-300 group overflow-hidden"
                    variants={itemVariants}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(66, 133, 244, 0.2)",
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Animated highlight effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-royal/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-royal-dark to-royal rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-royal/20 group-hover:scale-110 transition-transform duration-300">
                        <FaPhone className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm mb-1">
                          Call me directly
                        </p>
                        <p className="text-white text-xl font-medium mb-4">
                          (928) 587-1309
                        </p>
                        <a
                          href="tel:9285871309"
                          className="inline-flex items-center justify-center w-full px-5 py-2.5 bg-gradient-to-r from-royal-dark to-royal hover:from-royal hover:to-royal-light text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-royal/10 hover:shadow-royal/30 active:scale-95 touch-manipulation"
                        >
                          Call Now
                        </a>
                      </div>
                    </div>
                  </motion.div>

                  {/* Text Me */}
                  <motion.div
                    className="relative bg-gradient-to-b from-black/80 to-navy-dark/60 border border-white/10 rounded-xl p-5 sm:p-6 hover:border-amber-500/40 transition-all duration-300 group overflow-hidden"
                    variants={itemVariants}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(217, 119, 6, 0.2)",
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Animated highlight effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-amber-500/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-amber-700 to-amber-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-amber-700/20 group-hover:scale-110 transition-transform duration-300">
                        <FaSms className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm mb-1">Text me</p>
                        <p className="text-white text-xl font-medium mb-4">
                          (928) 587-1309
                        </p>
                        <a
                          href="sms:9285871309?body=Hi Gavin, I'm interested in personal training. Please contact me."
                          className="inline-flex items-center justify-center w-full px-5 py-2.5 bg-gradient-to-r from-amber-700 to-amber-600 hover:from-amber-600 hover:to-amber-500 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-amber-600/10 hover:shadow-amber-500/30 active:scale-95 touch-manipulation"
                        >
                          Text Now
                        </a>
                      </div>
                    </div>
                  </motion.div>

                  {/* Email Me */}
                  <motion.div
                    className="relative bg-gradient-to-b from-black/80 to-navy-dark/60 border border-white/10 rounded-xl p-5 sm:p-6 hover:border-blue-400/40 transition-all duration-300 group overflow-hidden sm:col-span-2 lg:col-span-1"
                    variants={itemVariants}
                    whileHover={{
                      y: -5,
                      boxShadow: "0 10px 25px -5px rgba(96, 165, 250, 0.2)",
                    }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    {/* Animated highlight effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-blue-400/5 to-transparent translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000"></div>

                    <div className="relative">
                      <div className="w-14 h-14 bg-gradient-to-br from-blue-700 to-blue-400 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-lg shadow-blue-500/20 group-hover:scale-110 transition-transform duration-300">
                        <FaEnvelope className="text-white w-5 h-5" />
                      </div>
                      <div>
                        <p className="text-white/60 text-sm mb-1">Email me</p>
                        <p className="text-white text-base font-medium mb-4 tracking-tight">
                          flbesttrainer@gmail.com
                        </p>
                        <a
                          href="mailto:flbesttrainer@gmail.com?subject=Personal Training Inquiry&body=Hi Gavin, I'm interested in personal training. Please contact me."
                          className="inline-flex items-center justify-center w-full px-5 py-2.5 bg-gradient-to-r from-blue-700 to-blue-500 hover:from-blue-600 hover:to-blue-400 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-blue-600/10 hover:shadow-blue-500/30 active:scale-95 touch-manipulation"
                        >
                          Email Now
                        </a>
                      </div>
                    </div>
                  </motion.div>
                </motion.div>

                {/* Save contact button with enhanced visual */}
                <motion.div className="mb-10 relative" variants={itemVariants}>
                  <div className="max-w-md mx-auto bg-gradient-to-b from-royal/10 to-transparent p-5 sm:p-6 rounded-xl border border-royal/20">
                    <div className="flex items-center justify-center mb-3">
                      <FaStar className="text-royal-light w-4 h-4 mr-2" />
                      <h3 className="text-white font-medium">
                        Save my contact information
                      </h3>
                    </div>

                    <div className="bg-black/40 backdrop-blur-md rounded-lg p-3 mb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="text-left">
                        <p className="text-white font-medium">Gavin Stanifer</p>
                        <p className="text-white/70 text-sm">(928) 587-1309</p>
                        <p className="text-royal-light/80 text-sm">
                          flbesttrainer@gmail.com
                        </p>
                      </div>
                      <div className="flex flex-col gap-2">
                        <div className="relative group">
                          <a
                            href={generateVCard()}
                            download="Gavin_Stanifer_Contact.vcf"
                            className="inline-flex items-center px-5 py-2.5 bg-gradient-to-r from-royal-dark to-royal border border-royal/30 hover:border-royal/50 text-white rounded-lg text-sm font-medium transition-all duration-300 shadow-lg shadow-royal/10 hover:shadow-royal/20 active:bg-royal-dark active:scale-95 touch-manipulation whitespace-nowrap"
                          >
                            <FaUserPlus className="mr-2 h-4 w-4" />
                            <span className="hidden xs:inline">Save </span>
                            Contact
                          </a>
                          <div className="hidden group-hover:block absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 p-2 bg-black/90 rounded text-xs text-white w-52 text-center">
                            Works with Outlook, Apple Contacts, Google Contacts,
                            and mobile phones
                          </div>
                        </div>
                        <div className="text-xs text-white/60 text-center px-2">
                          <span className="text-royal-light">Note:</span> On
                          Windows, open the downloaded file to add the contact
                        </div>
                      </div>
                    </div>

                    <p className="text-white/50 text-xs">
                      Add me to your contacts with one click for easy access
                    </p>
                  </div>
                </motion.div>

                {/* Guarantee statement */}
                <motion.div className="mb-8" variants={itemVariants}>
                  <div className="bg-gradient-to-r from-transparent via-royal/10 to-transparent py-3 px-4 rounded-lg inline-flex items-center">
                    <FaShieldAlt className="h-4 w-4 text-royal-light mr-3" />
                    <p className="text-white/80 text-sm">
                      All inquiries receive a response within 24 hours
                    </p>
                  </div>
                </motion.div>

                {/* Location and availability */}
                <motion.div
                  className="pt-6 border-t border-white/10"
                  variants={itemVariants}
                >
                  <div className="flex flex-col items-center justify-center text-center space-y-3">
                    <div className="flex items-center justify-center bg-gradient-to-r from-royal-dark/20 to-royal/20 px-5 py-2 rounded-full">
                      <FaMapMarkerAlt className="text-royal-light mr-2 flex-shrink-0" />
                      <p className="text-white/90 text-sm font-medium">
                        Serving Manatee and Sarasota Counties
                      </p>
                    </div>
                    <p className="text-white/50 text-xs">
                      <span className="text-royal-light">Pro tip:</span> Best
                      times to call: 7am-8pm, Monday through Saturday
                    </p>
                  </div>
                </motion.div>
              </motion.div>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
