import React, { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import {
  FaCheckCircle,
  FaPlay,
  FaArrowRight,
  FaShieldAlt,
  FaStar,
} from "react-icons/fa";

interface HeroProps {
  nameBackgroundOpacity: number;
}

export default function Hero({ nameBackgroundOpacity }: HeroProps) {
  // Track if component is mounted for animations
  const [isMounted, setIsMounted] = useState(false);
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    setIsMounted(true);

    const handleMouseMove = (e: MouseEvent) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => {
      setIsMounted(false);
      window.removeEventListener("mousemove", handleMouseMove);
    };
  }, []);

  return (
    <section className="pt-20 sm:pt-24 md:pt-28 pb-16 md:py-32 relative overflow-hidden min-h-[90vh] sm:min-h-screen flex items-center">
      {/* Background gradients and effects */}
      <div className="absolute inset-0 bg-gradient-to-br from-[#0A0A0A] via-[#151515] to-[#1A1A1A] z-0"></div>
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5 z-0"></div>

      {/* Animated background glow effects - optimized for mobile */}
      <div className="absolute top-20 -left-16 sm:-left-32 w-48 sm:w-64 h-48 sm:h-64 rounded-full bg-royal/10 blur-[80px] sm:blur-[100px] animate-pulse-slow"></div>
      <div
        className="absolute bottom-20 -right-16 sm:-right-32 w-48 sm:w-80 h-48 sm:h-80 rounded-full bg-royal/10 blur-[80px] sm:blur-[100px] animate-pulse-slow"
        style={{ animationDelay: "1.5s" }}
      ></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full max-w-xl sm:max-w-3xl max-h-xl sm:max-h-3xl bg-royal/5 rounded-full blur-[80px] sm:blur-[120px] opacity-70"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Two-column layout that stacks on mobile */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left content column */}
          <div className="max-w-xl mx-auto lg:mx-0 order-2 lg:order-1">
            {/* New banner - mobile optimized */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: isMounted ? 1 : 0, y: isMounted ? 0 : 10 }}
              transition={{ duration: 0.5 }}
              className="inline-flex items-center mb-4 sm:mb-6 bg-gradient-to-r from-royal/20 to-royal/10 border border-royal/30 rounded-full pl-1 pr-3 sm:pr-4 py-0.5 text-xs sm:text-sm"
            >
              <span className="bg-royal text-white font-semibold px-2 py-0.5 sm:px-3 sm:py-1 rounded-full mr-1.5 sm:mr-2 text-xs">
                NEW
              </span>
              <span className="text-royal-light whitespace-normal sm:whitespace-nowrap">
                In-Home Training Available
              </span>
            </motion.div>

            {/* Main headline - responsive text sizing */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isMounted ? 1 : 0, y: isMounted ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.1 }}
            >
              <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-3 sm:mb-4 leading-tight">
                Your <span className="text-royal-light">Fitness Journey</span>,
                <br className="hidden sm:block" />
                <span className="sm:block">Your Schedule</span>
              </h1>

              {/* Trainer name with highlight */}
              <div className="mb-4 sm:mb-6">
                <h2 className="text-lg sm:text-xl md:text-2xl font-medium text-white/90">
                  <span className="relative inline-block">
                    Gavin Stanifer
                    <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-royal to-transparent"></span>
                  </span>
                  <span className="text-white/60 text-base sm:text-lg ml-2">
                    NASM-CPT
                  </span>
                </h2>
              </div>
            </motion.div>

            {/* Description - adjusted for mobile */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isMounted ? 1 : 0, y: isMounted ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-base sm:text-lg text-white/80 mb-6 sm:mb-8 leading-relaxed"
            >
              Elite personal training that comes to you. Achieve your fitness
              goals with customized programs, expert guidance, and a trainer
              committed to your success.
            </motion.p>

            {/* Stats section - mobile responsive */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isMounted ? 1 : 0, y: isMounted ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="mb-6 sm:mb-8 grid grid-cols-3 gap-2 sm:gap-3 text-center"
            >
              <div className="bg-black/20 backdrop-blur-sm rounded-md p-2 sm:p-3 border border-white/5 hover:bg-black/30 transition-colors">
                <div className="text-royal-light font-bold text-lg sm:text-xl md:text-2xl">
                  100+
                </div>
                <div className="text-white/70 text-[10px] sm:text-xs">
                  Happy Clients
                </div>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-md p-2 sm:p-3 border border-white/5 hover:bg-black/30 transition-colors">
                <div className="text-royal-light font-bold text-lg sm:text-xl md:text-2xl">
                  10+
                </div>
                <div className="text-white/70 text-[10px] sm:text-xs">
                  Years Experience
                </div>
              </div>
              <div className="bg-black/20 backdrop-blur-sm rounded-md p-2 sm:p-3 border border-white/5 hover:bg-black/30 transition-colors">
                <div className="text-royal-light font-bold text-lg sm:text-xl md:text-2xl">
                  NASM
                </div>
                <div className="text-white/70 text-[10px] sm:text-xs">
                  Certification
                </div>
              </div>
            </motion.div>

            {/* Services list - mobile optimized */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isMounted ? 1 : 0, y: isMounted ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.4 }}
              className="mb-6 sm:mb-8 grid grid-cols-1 sm:grid-cols-2 gap-2 sm:gap-3"
            >
              {[
                "In-Home Training",
                "Custom Workout Plans",
                "Nutrition Coaching",
                "Fitness Assessments",
              ].map((service, i) => (
                <div
                  key={i}
                  className="flex items-center text-xs sm:text-sm md:text-base"
                >
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rounded-full bg-royal/20 flex items-center justify-center mr-1.5 sm:mr-2 flex-shrink-0">
                    <FaCheckCircle className="w-2 h-2 sm:w-3 sm:h-3 text-royal-light" />
                  </div>
                  <span className="text-white/80">{service}</span>
                </div>
              ))}
            </motion.div>

            {/* Client testimonial - hidden on smallest screens */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isMounted ? 1 : 0, y: isMounted ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="mb-6 sm:mb-8 hidden sm:block"
            >
              <div className="bg-black/30 backdrop-blur-sm rounded-lg border-l-2 border-royal p-3 sm:p-4 shadow-lg">
                <div className="flex items-start">
                  <div className="flex-shrink-0 mr-3 sm:mr-4">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar
                          key={i}
                          className="text-royal-light w-3 h-3 sm:w-4 sm:h-4"
                        />
                      ))}
                    </div>
                  </div>
                  <div>
                    <p className="italic text-white/90 text-xs sm:text-sm">
                      "Gavin has completely transformed my approach to fitness.
                      The convenience of in-home training combined with his
                      expertise has helped me achieve goals I never thought
                      possible."
                    </p>
                    <div className="mt-1 sm:mt-2">
                      <span className="text-white/70 text-[10px] sm:text-xs font-semibold">
                        — Michael R., Client for 3+ years
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>

            {/* CTA buttons - with added Blog button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: isMounted ? 1 : 0, y: isMounted ? 0 : 20 }}
              transition={{ duration: 0.6, delay: 0.6 }}
              className="flex flex-col sm:flex-row flex-wrap gap-3 mb-6"
            >
              <Link
                href="#pricing"
                className="group bg-gradient-to-r from-royal to-royal-light px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg text-white text-sm sm:text-base font-medium hover:shadow-lg transition-all shadow-lg shadow-royal/20 flex items-center justify-center sm:justify-start"
              >
                Explore packages
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </Link>
              <Link
                href="/plans"
                className="group bg-white/10 hover:bg-white/20 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg text-white text-sm sm:text-base font-medium border border-royal/30 transition-colors flex items-center justify-center sm:justify-start"
              >
                <span>Get Custom Plan</span>
                <FaArrowRight className="ml-2 opacity-70 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
              </Link>
              <Link
                href="/about"
                className="bg-white/10 hover:bg-white/20 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg text-white text-sm sm:text-base font-medium border border-white/20 transition-colors flex items-center justify-center sm:justify-start"
              >
                <FaPlay className="mr-2 text-royal-light" />
                Meet Gavin Stanifer
              </Link>
              <Link
                href="/blog"
                className="bg-white/10 hover:bg-white/20 px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg text-white text-sm sm:text-base font-medium border border-white/20 transition-colors flex items-center justify-center sm:justify-start"
              >
                <FaCheckCircle className="mr-2 text-royal-light" />
                Fitness Blog
              </Link>
            </motion.div>
          </div>

          {/* Right side with enhanced photo styling - hidden on small and medium screens */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{
              opacity: isMounted ? 1 : 0,
              scale: isMounted ? 1 : 0.95,
            }}
            transition={{ duration: 0.8, delay: 0.3 }}
            className="relative mx-auto lg:mx-0 order-1 lg:order-2 hidden lg:block"
          >
            {/* Photo container with improved styling */}
            <div className="relative w-full h-[550px] rounded-xl overflow-hidden shadow-xl group">
              {/* Multiple layered gradients for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent z-10"></div>

              {/* Animated vignette on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-radial-gradient transition-opacity duration-700 z-10"></div>

              {/* The image with improved styling and enhanced definition */}
              <Image
                src="/images/brandphoto5.jpeg"
                alt="Gavin Stanifer - FL Best Trainer"
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                  // Scale the image slightly larger to prevent edges from showing
                  transform: `scale(1.05) translate(${
                    mousePosition.x * -8
                  }px, ${mousePosition.y * -8}px)`,
                  transition: "transform 0.2s ease-out",
                }}
                priority
                className="group-hover:scale-105 transition-transform duration-700 physique-enhance"
              />

              {/* Subtle inner shadow/glow */}
              <div className="absolute inset-0 shadow-inner pointer-events-none z-20"></div>

              {/* Premium photo frame with gradient border */}
              <div className="absolute inset-0 rounded-xl z-20 p-px bg-gradient-to-br from-royal-light via-transparent to-royal/50 opacity-70"></div>

              {/* ENHANCED NASM Certification Badge - PREMIUM STYLE */}
              <div className="absolute top-5 right-5 z-40">
                <div
                  className="bg-gradient-to-br from-royal to-royal-light p-3 rounded-lg shadow-lg float-animation"
                  style={{
                    boxShadow: "0 10px 25px -5px rgba(26, 45, 128, 0.5)",
                    border: "1px solid rgba(255, 255, 255, 0.15)",
                  }}
                >
                  <div className="flex items-center">
                    <div className="bg-white/20 rounded-full w-10 h-10 flex items-center justify-center mr-3 shadow-inner">
                      <FaShieldAlt className="text-white text-lg" />
                    </div>
                    <div className="text-white">
                      <div className="font-bold text-lg leading-tight">
                        NASM-CPT
                      </div>
                      <div className="text-xs font-medium tracking-wide text-white/90">
                        CERTIFIED TRAINER
                      </div>
                    </div>
                  </div>
                  {/* Premium glow effect */}
                  <div className="absolute -inset-0.5 bg-white/20 rounded-lg blur opacity-30"></div>
                </div>
              </div>

              {/* Stats panel overlay */}
              <div className="absolute left-0 bottom-0 right-0 bg-black/60 backdrop-blur-sm p-4 z-30 border-t border-white/10">
                <div className="grid grid-cols-3 gap-3">
                  <div className="text-center">
                    <div className="text-royal text-xl font-bold">10+</div>
                    <div className="text-white/80 text-xs">Years Exp.</div>
                  </div>
                  <div className="text-center border-l border-r border-white/10">
                    <div className="text-royal text-xl font-bold">100+</div>
                    <div className="text-white/80 text-xs">Clients</div>
                  </div>
                  {/* <div className="text-center">
                    <div className="text-royal text-xl font-bold">NASM</div>
                    <div className="text-white/80 text-xs">Certified</div>
                  </div> */}
                </div>
              </div>
            </div>

            {/* Experience badge - add float-animation class */}
            <div className="absolute -bottom-5 -right-5 bg-gradient-to-br from-royal to-royal-light p-4 rounded-lg shadow-lg z-30 float-animation">
              <div className="text-white text-center">
                <div className="font-bold text-xl mb-1">10+</div>
                <div className="text-sm">Years Experience</div>
              </div>
            </div>

            {/* Side highlight with improved glow */}
            <div className="absolute -left-2 top-1/4 bottom-1/4 w-1.5 bg-gradient-to-b from-royal-light via-royal to-transparent rounded-full shadow-glow float-animation"></div>
          </motion.div>
        </div>

        {/* Bottom info card - mobile optimized */}
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: isMounted ? 1 : 0, y: isMounted ? 0 : 30 }}
          transition={{ duration: 0.7, delay: 0.8 }}
          className="max-w-6xl mx-auto mt-12 sm:mt-16"
          style={{ opacity: nameBackgroundOpacity }}
        >
          <div className="relative">
            <div className="absolute inset-0 bg-gradient-to-r from-royal/10 via-royal/20 to-royal/10 backdrop-blur-md rounded-xl border border-royal/20 shadow-lg"></div>
            <div className="relative z-10 py-4 sm:py-5 px-4 sm:px-6 md:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
              <div className="text-center md:text-left">
                <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-white">
                  Ready to transform your mind and body?
                </h2>
                <p className="text-white/70 text-sm sm:text-base">
                  Professional training designed for your goals and schedule
                </p>
              </div>
              <Link
                href="#contact"
                className="whitespace-nowrap w-full md:w-auto px-5 sm:px-6 py-2.5 sm:py-3 bg-gradient-to-r from-royal to-royal-light hover:from-royal-light hover:to-royal rounded-lg transition-all duration-300 text-white text-sm sm:text-base font-medium shadow-lg shadow-royal/20 flex items-center justify-center"
              >
                <span>Reach Out</span>
                <FaArrowRight className="ml-2" />
              </Link>
            </div>
          </div>
        </motion.div>
      </div>

      {/* Component-specific styles */}
      <style jsx>{`
        /* These styles will only apply to elements within this component */
        .shadow-glow {
          box-shadow: 0 0 15px rgba(65, 105, 225, 0.5);
        }
        .bg-radial-gradient {
          background: radial-gradient(
            circle at center,
            transparent 0%,
            rgba(0, 0, 0, 0.3) 100%
          );
        }
        .float-animation {
          animation: float 3s ease-in-out infinite;
        }
        @keyframes float {
          0% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
          100% {
            transform: translateY(0px);
          }
        }
        .animate-pulse-slow {
          animation: pulse-slow 8s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
        @keyframes pulse-slow {
          0%,
          100% {
            opacity: 0.1;
          }
          50% {
            opacity: 0.2;
          }
        }
      `}</style>
    </section>
  );
}
