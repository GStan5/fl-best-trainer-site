import Image from "next/image";
import Link from "next/link";
import {
  FaCheckCircle,
  FaCertificate,
  FaStar,
  FaQuoteLeft,
  FaUserFriends,
  FaDumbbell,
  FaMedal,
  FaShieldAlt,
} from "react-icons/fa";
import { useState, useEffect } from "react";

export default function Hero() {
  const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e) => {
      setMousePosition({
        x: e.clientX / window.innerWidth - 0.5,
        y: e.clientY / window.innerHeight - 0.5,
      });
    };

    window.addEventListener("mousemove", handleMouseMove);
    return () => window.removeEventListener("mousemove", handleMouseMove);
  }, []);

  return (
    <section className="pt-28 pb-16 md:py-32 relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-r from-black to-navy z-0"></div>
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5 z-0"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-2">
              About <span className="text-royal-light">FL Best Trainer</span>
            </h1>

            {/* Personal Trainer Name with Highlight */}
            <div className="mb-6">
              <h2 className="text-xl md:text-2xl font-medium text-white/90">
                <span className="relative inline-block">
                  Gavin Stanifer
                  <span className="absolute -bottom-1 left-0 right-0 h-0.5 bg-gradient-to-r from-royal to-transparent"></span>
                </span>
                <span className="text-white/60 text-lg ml-2">NASM-CPT</span>
              </h2>
            </div>

            <p className="text-lg text-white/80 mb-6">
              Dedicated to transforming lives through personalized fitness and
              expert guidance. With NASM certification and years of experience,
              I bring professional training to your home on your schedule.
            </p>

            {/* Achievement Stats - UPDATED */}
            <div className="mb-6 grid grid-cols-3 gap-2 text-center">
              <div className="bg-black/20 rounded-md p-2 border border-white/5 ">
                <div className="text-royal-light font-bold text-xl">500+</div>
                <div className="text-white/70 text-xs">Happy Clients</div>
              </div>
              <div className="bg-black/20 rounded-md p-2 border border-white/5 ">
                <div className="text-royal-light font-bold text-xl">10+</div>
                <div className="text-white/70 text-xs">Years Experience</div>
              </div>
              <div className="bg-black/20 rounded-md p-2 border border-white/5 ">
                <div className="text-royal-light font-bold text-xl">NASM</div>
                <div className="text-white/70 text-xs">Certification</div>
              </div>
            </div>

            {/* Client Success Highlight */}
            <div className="mb-6 bg-black/40 rounded-lg border-l-2 border-royal p-4">
              <div className="flex items-start">
                <FaQuoteLeft className="text-royal-light w-6 h-6 mr-3 flex-shrink-0 mt-1" />
                <div>
                  <p className="italic text-white/90 text-sm">
                    "Working with Gavin has completely transformed my approach
                    to fitness. His personalized training has helped me achieve
                    goals I never thought possible."
                  </p>
                  <div className="mt-2 flex items-center">
                    <div className="flex">
                      {[...Array(5)].map((_, i) => (
                        <FaStar key={i} className="text-royal-light w-3 h-3" />
                      ))}
                    </div>
                    <span className="ml-2 text-white/70 text-xs">
                      — Satisfied Client
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Key Services List */}
            <div className="mb-6 grid grid-cols-2 gap-2">
              <div className="flex items-center text-sm">
                <div className="w-5 h-5 rounded-full bg-royal/20 flex items-center justify-center mr-2">
                  <FaCheckCircle className="w-3 h-3 text-royal-light" />
                </div>
                <span className="text-white/80">In-Home Training</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-5 h-5 rounded-full bg-royal/20 flex items-center justify-center mr-2">
                  <FaCheckCircle className="w-3 h-3 text-royal-light" />
                </div>
                <span className="text-white/80">Custom Workout Plans</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-5 h-5 rounded-full bg-royal/20 flex items-center justify-center mr-2">
                  <FaCheckCircle className="w-3 h-3 text-royal-light" />
                </div>
                <span className="text-white/80">Nutrition Coaching</span>
              </div>
              <div className="flex items-center text-sm">
                <div className="w-5 h-5 rounded-full bg-royal/20 flex items-center justify-center mr-2">
                  <FaCheckCircle className="w-3 h-3 text-royal-light" />
                </div>
                <span className="text-white/80">Fitness Assessments</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link
                href="#contact"
                className="bg-gradient-to-r from-royal to-royal-light px-6 py-3 rounded-lg text-white font-medium hover:opacity-90 transition-opacity shadow-lg shadow-royal/20"
              >
                Get in Touch
              </Link>
              <Link
                href="/training"
                className="bg-white/10 hover:bg-white/20 px-6 py-3 rounded-lg text-white font-medium border border-white/20 transition-colors"
              >
                View Services
              </Link>
            </div>
          </div>

          {/* Right side with ENHANCED photo styling */}
          <div className="relative">
            {/* Photo container with improved styling */}
            <div className="relative w-full h-[400px] md:h-[500px] rounded-xl overflow-hidden shadow-xl group">
              {/* Multiple layered gradients for depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent z-10"></div>
              <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent z-10"></div>

              {/* Animated vignette on hover */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 bg-radial-gradient transition-opacity duration-700 z-10"></div>

              {/* The image with improved styling and enhanced definition */}
              <Image
                src="/images/brandphoto12.jpg"
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

              {/* Name overlay at bottom of image for mobile visibility */}
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-4 md:hidden z-30">
                <h3 className="text-white font-medium text-lg">
                  Gavin Stanifer
                </h3>
                <p className="text-white/70 text-sm">
                  NASM Certified Personal Trainer
                </p>
              </div>

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
          </div>
        </div>
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
      `}</style>
    </section>
  );
}
