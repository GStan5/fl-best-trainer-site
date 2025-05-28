import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import {
  FaCheckCircle,
  FaDumbbell,
  FaCalendarAlt,
  FaHome,
  FaTrophy,
  FaPhone,
} from "react-icons/fa";
// Import the image at the top of your file
import brandPhoto1 from "../../public/images/brandphoto1.jpeg";

export default function TrainingHero() {
  return (
    <section className="pt-32 pb-16 relative overflow-hidden">
      {/* Background gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-black via-black to-navy z-0"></div>

      {/* Pattern overlay */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5 z-0"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="flex flex-col lg:flex-row items-center gap-8 lg:gap-16">
          {/* Left side - text content */}
          <div className="w-full lg:w-1/2 order-2 lg:order-1">
            <div className="mb-4 inline-block">
              <motion.span
                className="bg-royal/10 text-royal-light text-sm font-semibold py-1 px-3 rounded-full"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6 }}
              >
                Expert In-Home Personal Training
              </motion.span>
            </div>

            <motion.h1
              className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-6 leading-tight"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
            >
              Transform Your Body
              <span className="bg-gradient-to-r from-royal to-royal-light bg-clip-text text-transparent">
                {" "}
                Without Leaving Home
              </span>
            </motion.h1>

            <motion.p
              className="text-lg text-white/80 mb-8 max-w-2xl"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.4 }}
            >
              Experience the convenience and effectiveness of personalized
              training in the comfort of your own home. I bring years of expert
              knowledge and personalized coaching directly to you with workouts
              designed for your specific goals.
            </motion.p>

            <motion.div
              className="mb-10"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.6 }}
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {[
                  {
                    text: "Personalized Training Plans",
                    icon: (
                      <FaDumbbell className="text-royal-light mr-2 flex-shrink-0" />
                    ),
                  },
                  {
                    text: "Use Your Home Environment",
                    icon: (
                      <FaHome className="text-royal-light mr-2 flex-shrink-0" />
                    ),
                  },
                  {
                    text: "Flexible Scheduling",
                    icon: (
                      <FaCalendarAlt className="text-royal-light mr-2 flex-shrink-0" />
                    ),
                  },
                  {
                    text: "Results Guaranteed",
                    icon: (
                      <FaTrophy className="text-royal-light mr-2 flex-shrink-0" />
                    ),
                  },
                ].map((benefit, i) => (
                  <div key={i} className="flex items-center">
                    {benefit.icon}
                    <span className="text-white/90">{benefit.text}</span>
                  </div>
                ))}
              </div>
            </motion.div>

            <motion.div
              className="flex flex-col sm:flex-row gap-4 sm:gap-6"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
            >
              <a
                href="tel:+1234567890"
                className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-gradient-to-r from-royal to-royal-light hover:from-royal-light hover:to-royal text-white rounded-xl font-medium shadow-lg shadow-royal/20 transition-all duration-300 flex items-center justify-center text-center"
              >
                <FaPhone className="mr-2 animate-pulse" />
                Free Consultation Call
              </a>
              <Link
                href="#pricing"
                className="flex-1 sm:flex-none px-6 sm:px-8 py-3 sm:py-4 bg-white/10 hover:bg-white/20 border border-white/20 text-white rounded-xl font-medium transition-all duration-300 flex items-center justify-center text-center"
              >
                <FaDumbbell className="mr-2" />
                View Training Packages
              </Link>
            </motion.div>
          </div>

          {/* Right side - image */}
          <div className="w-full lg:w-1/2 order-1 lg:order-2">
            <motion.div
              className="relative rounded-2xl overflow-hidden shadow-2xl shadow-royal/30 border border-white/10 lg:h-[500px] before:absolute before:inset-0 before:rounded-2xl before:border-t-2 before:border-royal/30 before:z-10"
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8 }}
            >
              <div className="h-full relative">
                <motion.div
                  className="h-full relative"
                  initial={{ scale: 1.1 }}
                  animate={{ scale: 1 }}
                  transition={{ duration: 1.5 }}
                >
                  <Image
                    src={brandPhoto1}
                    alt="In-home personal training session"
                    placeholder="blur"
                    fill
                    priority
                    className="object-cover object-[center_top] scale-110" // Adjusted to focus on upper part
                  />

                  {/* Color overlays to match the blue theme */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-black/90 via-navy/50 to-transparent opacity-70"></div>
                  <div className="absolute inset-0 bg-gradient-to-bl from-transparent via-royal/30 to-navy/70 opacity-60"></div>
                  <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-transparent to-royal/10 opacity-70"></div>
                  <div className="absolute inset-0 bg-blue-900/20 mix-blend-color"></div>
                </motion.div>
              </div>

              {/* Stats overlay with improved spacing and visibility */}
              <div className="absolute bottom-0 left-0 right-0 p-6 flex justify-between bg-gradient-to-t from-black/80 to-transparent pt-20">
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">500+</div>
                  <div className="text-xs text-white/80 uppercase tracking-wider font-medium">
                    Happy Clients
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">12+</div>
                  <div className="text-xs text-white/80 uppercase tracking-wider font-medium">
                    Years Experience
                  </div>
                </div>
                <div className="text-center">
                  <div className="text-2xl font-bold text-white">100%</div>
                  <div className="text-xs text-white/80 uppercase tracking-wider font-medium">
                    Satisfaction
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </div>
    </section>
  );
}
