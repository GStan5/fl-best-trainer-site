import Image from "next/image";
import { FaDumbbell, FaCheckCircle } from "react-icons/fa";
import { motion } from "framer-motion";
import { useState, useEffect } from "react";

export default function Hero() {
  // Mouse position state remains the same
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
    <section className="pt-28 pb-12 md:pt-32 md:pb-16 relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-[#0A0A0A] z-0"></div>
      <div className="absolute inset-0 opacity-20 bg-grid-pattern z-0"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12 items-center">
          {/* Left column content */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="flex items-center mb-3">
              <div className="bg-royal/20 p-2 rounded-lg mr-3">
                <FaDumbbell className="text-royal text-xl" />
              </div>
              <h2 className="text-royal text-xl font-semibold tracking-wide">
                CUSTOM WORKOUT PLANS
              </h2>
            </div>

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-white mb-4">
              Expert-Designed{" "}
              <span className="text-royal">Workout Programs</span> for Your Body
            </h1>

            <p className="text-white/80 text-lg mb-6">
              Personalized workout plans tailored to your specific goals,
              experience level, and available equipment.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
              <div className="flex items-center text-white/90">
                <FaCheckCircle className="text-royal mr-3 flex-shrink-0" />
                <span>NASM Certified Programming</span>
              </div>
              <div className="flex items-center text-white/90">
                <FaCheckCircle className="text-royal mr-3 flex-shrink-0" />
                <span>Progressive Overload Focus</span>
              </div>
              <div className="flex items-center text-white/90">
                <FaCheckCircle className="text-royal mr-3 flex-shrink-0" />
                <span>Exercise Form Guides</span>
              </div>
              <div className="flex items-center text-white/90">
                <FaCheckCircle className="text-royal mr-3 flex-shrink-0" />
                <span>Continuous Support</span>
              </div>
            </div>

            <div className="flex flex-wrap gap-4">
              <a
                href="#pricing"
                className="bg-royal hover:bg-royal-light text-white font-semibold py-3 px-6 rounded-lg transition duration-300 shadow-lg shadow-royal/20"
              >
                View Workout Plans
              </a>
              <a
                href="#contact"
                className="bg-white/10 hover:bg-white/20 text-white font-semibold py-3 px-6 rounded-lg transition duration-300 border border-white/20 hover:border-white/40"
              >
                Contact Gavin Stanifer <span className="ml-1">→</span>
              </a>
            </div>
          </motion.div>

          {/* Right column with image */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            className="relative"
          >
            <div className="relative w-full h-[360px] md:h-[450px] rounded-xl overflow-hidden shadow-xl">
              {/* Image and overlays remain the same */}
              <Image
                src="/images/brandphoto3.jpg"
                alt="FL Best Trainer Workout Plans"
                fill
                style={{
                  objectFit: "cover",
                  objectPosition: "center",
                  transform: `scale(1.25) translate(${
                    mousePosition.x * -15
                  }px, ${mousePosition.y * -15}px)`,
                  transition: "transform 0.2s ease-out",
                }}
                priority
                className="group-hover:scale-105 transition-transform duration-700"
              />

              {/* Royal blue overlay with gradient */}
              <div className="absolute inset-0 opacity-60 bg-gradient-to-br from-royal/70 via-royal/30 to-black/80 mix-blend-multiply z-10"></div>

              {/* Additional texture and depth */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent z-20"></div>

              {/* Bottom fade gradient - new addition */}
              <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-transparent z-20"></div>

              {/* Premium badge with improved styling */}
              <div className="absolute bottom-6 left-6 right-6 bg-gradient-to-br from-black/50 to-black/30 backdrop-blur-md p-3 rounded-lg border border-royal/30 z-30 shadow-lg shadow-royal/10 transform transition-transform duration-300 hover:scale-102">
                <div className="flex items-center">
                  <div className="w-12 h-12 bg-gradient-to-br from-royal to-royal-light rounded-full flex items-center justify-center mr-4 flex-shrink-0 shadow-inner border-2 border-white/10">
                    <FaDumbbell className="text-white text-lg" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold text-lg mb-1">
                      Start Your Transformation
                    </h3>
                    <p className="text-white/80 text-xs">
                      Customized plans for measurable results
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom animated line - similar to about page */}
            <div className="absolute -bottom-2 left-0 right-0 h-1.5 bg-gradient-to-r from-transparent via-royal to-transparent rounded-full shadow-glow float-animation"></div>
          </motion.div>
        </div>
      </div>

      {/* No bottom gradient to maximize space */}
      <div className="absolute bottom-0 left-0 w-full h-1 bg-gradient-to-t from-[#0A0A0A] to-transparent z-10"></div>
    </section>
  );
}
