import Link from "next/link";
import Lottie from "lottie-react";
import workoutAnimation from "@/public/animations/chinUpAnimation.json";

interface HeroProps {
  nameBackgroundOpacity: number;
}

export default function Hero({ nameBackgroundOpacity }: HeroProps) {
  return (
    <div className="relative min-h-[100dvh] bg-[#1A1A1A] text-white overflow-hidden">
      {/* Background Effects */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-transparent to-transparent"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 pt-28 sm:pt-32 md:pt-36 lg:pt-32 pb-20 relative z-10">
        {/* Pre-heading badges */}
        <div className="flex flex-wrap items-center justify-center gap-4 sm:gap-6 lg:gap-8 mb-8 sm:mb-12">
          {[
            "NASM Certified",
            "In-Home Training",
            "10+ Years Experience",
            "Customized Workout Plans",
          ].map((badge, index) => (
            <div
              key={index}
              className="group px-3 sm:px-4 py-1 rounded-full bg-royal/10 border border-royal/20 
                backdrop-blur-sm hover:bg-royal/20 transition-all duration-300"
            >
              <span className="text-xs sm:text-sm text-royal-light font-medium group-hover:text-white whitespace-nowrap">
                {badge}
              </span>
            </div>
          ))}
        </div>

        <div className="grid lg:grid-cols-2 gap-8 sm:gap-10 lg:gap-12 2xl:gap-20 items-center">
          {/* Left Column */}
          <div className="text-center lg:text-left space-y-8 sm:space-y-10 lg:space-y-12">
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl 2xl:text-8xl font-heading font-extrabold leading-[1.1] animate-fade-in">
              Transform Your
              <br className="hidden sm:block" />
              <span className="bg-gradient-to-r from-royal to-royal-light bg-clip-text text-transparent animate-gradient">
                Fitness Journey
              </span>
            </h1>

            <div className="space-y-6 sm:space-y-8 text-white/90">
              <p className="text-lg sm:text-xl md:text-2xl 2xl:text-3xl font-light max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Expert personal training that comes to you. Achieve your fitness
                goals with customized programs.
              </p>

              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 text-sm sm:text-base 2xl:text-lg max-w-xl mx-auto lg:mx-0">
                {[
                  "Personalized Programs",
                  "In-Home Training",
                  "Expert Guidance",
                  "All Equipment Provided",
                ].map((feature, index) => (
                  <li key={index} className="flex items-center gap-2">
                    <svg
                      className="w-4 h-4 sm:w-5 sm:h-5 text-royal-light flex-shrink-0"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={2}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    <span className="text-white/80">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Right Column - Animation */}
          <div className="relative h-[300px] sm:h-[400px] lg:h-[450px] 2xl:h-[600px] flex items-center justify-center">
            <div className="relative w-full max-w-[280px] sm:max-w-[400px] lg:max-w-[500px] 2xl:max-w-[600px] p-1">
              {/* Navy Border */}
              <div className="absolute inset-x-0 top-0 h-0.5 sm:h-1 bg-gradient-to-r from-navy via-royal to-navy"></div>
              <div className="absolute inset-x-0 bottom-0 h-0.5 sm:h-1 bg-gradient-to-r from-navy via-royal to-navy"></div>
              <div className="absolute inset-y-0 left-0 w-0.5 sm:w-1 bg-gradient-to-b from-navy via-royal to-navy"></div>
              <div className="absolute inset-y-0 right-0 w-0.5 sm:w-1 bg-gradient-to-b from-navy via-royal to-navy"></div>

              {/* Animation Container */}
              <div className="relative group">
                <div
                  className="absolute -inset-0.5 bg-gradient-to-r from-royal to-royal-light rounded-xl sm:rounded-2xl 
                  blur opacity-30 group-hover:opacity-50 transition duration-500"
                ></div>
                <div className="relative">
                  <Lottie
                    animationData={workoutAnimation}
                    loop={true}
                    className="w-full h-full"
                    style={{
                      filter: "drop-shadow(0 0 20px rgba(59, 130, 246, 0.2))",
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Name and Certification Section */}
        <div className="mt-12 sm:mt-16 lg:mt-20 2xl:mt-24 max-w-[90vw] mx-auto">
          <div className="relative overflow-visible px-4 sm:px-8 lg:px-12">
            <div
              className="absolute inset-0 transition-opacity duration-500 ease-out 
              bg-gradient-to-r from-navy/40 via-royal/20 to-navy/40 
              backdrop-blur-sm rounded-full border border-white/10"
              style={{ opacity: nameBackgroundOpacity }}
            />

            <div className="relative z-10 py-6 sm:py-8 lg:py-10">
              <div className="flex flex-col items-center justify-center gap-4 sm:gap-6">
                <div className="w-full text-center">
                  <h2
                    className="inline-block whitespace-nowrap text-4xl sm:text-6xl lg:text-[clamp(2rem,6vw,6rem)] font-heading 
                    font-extrabold leading-none tracking-tight mx-auto px-4"
                  >
                    Gavin Stanifer
                  </h2>
                </div>

                <div className="w-full text-center">
                  <span
                    className="inline-block whitespace-nowrap text-lg sm:text-xl lg:text-[clamp(1.2rem,2vw,2.5rem)]
                    font-light tracking-wider text-white/90 px-4"
                  >
                    NASM Certified Personal Trainer
                  </span>
                </div>

                <Link
                  href="/about"
                  className="group inline-flex items-center whitespace-nowrap px-4 sm:px-6 py-2 lg:px-8 lg:py-3 
                    bg-royal/10 backdrop-blur-sm rounded-full 
                    border border-white/10 hover:bg-royal/20 
                    transition-all duration-300 mt-2"
                >
                  <span className="text-base sm:text-lg lg:text-xl text-royal-light group-hover:text-white transition-colors">
                    Learn More About Me
                  </span>
                  <span className="inline-block ml-2 transform group-hover:translate-x-1 transition-transform duration-300">
                    &rarr;
                  </span>
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
