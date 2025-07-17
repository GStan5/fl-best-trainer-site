import { useState, useEffect } from "react";
import {
  FaQuoteRight,
  FaStar,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

// You'll need to install this package: npm install react-swipeable
import { useSwipeable } from "react-swipeable";

const testimonials = [
  {
    name: "Jackie Berling",
    age: "65",
    location: "Longboat Key, FL",
    achievement: "Strength, Balance & Flexibility Improvement",
    quote:
      "I have been training with Gavin for over six months and have noticed a significant improvement in my strength, toning, balance, and flexibility. We train three days a week for a well-rounded routine that targets my overall body. Gavin is laser focused on correct technique to avoid injuries. Having worked at a medically accredited fitness facility in California, compared to other fitness professionals, I am impressed by Gavin’s unique ability to convey how a specific muscle or balance exercise should feel when done correctly as well as its benefit to me. I am “so focused” on each exercise the training session flies by! I believe this ability that sets him apart from other fitness professionals. I am grateful to Gavin for the positive results I see and feel.",
    rating: 5,
    since: "2024",
  },
  {
    name: "Mary Jo Burgiel.",
    age: "64",
    location: "Longboat Key, FL",
    achievement: "Muscle gain & Injury prevention",
    quote:
      "I am 64 and never had worked with a Personal Trainer before.  Gavin was exceptional at understanding my goals and ensuring most importantly that I did not get hurt.  He's young, smart, and excellent with all age groups. Highly Recommend!",
    rating: 5,
    since: "2024",
  },
  {
    name: "Meryl & Mel Langbort.",
    age: "91 & 92",
    location: "Sarasota, FL",
    achievement: "Physical issues overcome & Enhanced Mobility",
    quote:
      "As Seniors in our 90s, We are very pleased to be training with Gavin Stanifer.  He is very knowledgable and works with us individually on our phusical issues as well as challenging us to maintain and enhance our flexibility and strenth",
    rating: 5,
    since: "2024",
  },
  {
    name: "Gillian Marto",
    age: "50",
    location: "Longboat Key, FL",
    achievement: "Strength & Confidence Transformation",
    quote:
      "Working with Gavin has been an absolute game-changer for me! I've always been hesitant about weight training, mainly because I was afraid of injuring my back or doing something wrong. But from day one, Gavin put those fears to rest with his calm, encouraging demeanor and expert knowledge of proper form and technique. \nI train with him three days a week, and in a relatively short amount of time, I've seen incredible improvements in both my strength and flexibility. My stamina has grown, and I'm lifting weights I never thought I could handle—safely and confidently. Gavin's approach is all about building strength the right way. He's incredibly attentive and makes sure every movement is done with perfect form, which has not only protected me from injury but has made me stronger, faster. What really sets Gavin apart is his patience, kindness, and the way he genuinely cares about your progress. He pushes you just enough to break through mental and physical barriers, but never in a way that feels overwhelming. He makes the sessions challenging, but also motivating and fun. Thanks to Gavin, I feel empowered in the gym, stronger in my daily life, and honestly amazed by what my body is capable of. If you're looking for a knowledgeable, kind, and effective personal trainer who truly knows what he's doing—Gavin is the one. Highly, highly recommend!",
    rating: 5,
    since: "2024",
  },
];

export default function TestimonialCarousel() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [direction, setDirection] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  const [expandedQuote, setExpandedQuote] = useState<number | null>(null);

  // Auto-rotate testimonials - with pause on hover
  useEffect(() => {
    if (isPaused) return;

    const timer = setInterval(() => {
      if (!isAnimating) {
        setDirection(1);
        setActiveIndex((prev) => (prev + 1) % testimonials.length);
        // Close any expanded quote when carousel moves
        setExpandedQuote(null);
      }
    }, 10000);

    return () => clearInterval(timer);
  }, [isAnimating, isPaused]);

  // Add keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft" && expandedQuote === null) goToPrev();
      if (e.key === "ArrowRight" && expandedQuote === null) goToNext();
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [expandedQuote]);

  // Add swipe handlers for mobile
  const swipeHandlers = useSwipeable({
    onSwipedLeft: () => goToNext(),
    onSwipedRight: () => goToPrev(),
    preventScrollOnSwipe: true,
    trackMouse: false,
  });

  // Handle manual navigation
  const goToNext = () => {
    if (isAnimating) return;
    setDirection(1);
    setActiveIndex((prev) => (prev + 1) % testimonials.length);
    // Close any expanded quote when manually navigating
    setExpandedQuote(null);
  };

  const goToPrev = () => {
    if (isAnimating) return;
    setDirection(-1);
    setActiveIndex(
      (prev) => (prev - 1 + testimonials.length) % testimonials.length
    );
    // Close any expanded quote when manually navigating
    setExpandedQuote(null);
  };

  // Calculate positions for all cards
  const getTestimonialCards = () => {
    return testimonials.map((testimonial, idx) => {
      // Calculate the adjusted index relative to active
      let relativeIndex =
        (idx - activeIndex + testimonials.length) % testimonials.length;

      // Ensure we get -1, 0, 1 for prev, active, next in a 3-item carousel
      if (relativeIndex > testimonials.length / 2) {
        relativeIndex -= testimonials.length;
      }
      if (relativeIndex < -testimonials.length / 2) {
        relativeIndex += testimonials.length;
      }

      return {
        testimonial,
        index: idx,
        relativeIndex,
      };
    });
  };

  const handleAnimationStart = () => setIsAnimating(true);
  const handleAnimationComplete = () => setIsAnimating(false);

  return (
    <section
      id="testimonials"
      className="relative py-24 bg-gradient-to-b from-black to-[#1A1A1A] overflow-hidden"
    >
      {/* Enhanced Background Elements */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal/50 to-transparent"></div>
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal/50 to-transparent"></div>

      {/* Decorative animated glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[70%] h-[50%] bg-royal/5 rounded-full blur-[120px] animate-pulse-slow"></div>

      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative">
        {/* Section Header */}
        <motion.div
          className="text-center mb-16"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8 }}
        >
          <div className="inline-flex items-center justify-center mb-3">
            <div className="h-px w-12 bg-gradient-to-r from-transparent to-royal/70"></div>
            <span className="px-3 text-royal-light text-sm font-medium">
              TESTIMONIALS
            </span>
            <div className="h-px w-12 bg-gradient-to-l from-transparent to-royal/70"></div>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            Client{" "}
            <span className="text-royal-light" style={{ whiteSpace: "nowrap" }}>
              Success
            </span>{" "}
            Stories
          </h2>

          <p className="text-base sm:text-lg text-white/70 mx-auto max-w-2xl">
            Real results from real people who trusted their fitness journey with
            Gavin Stanifer
          </p>
        </motion.div>

        {/* Carousel Container */}
        <div
          className="max-w-6xl mx-auto relative px-4 sm:px-6"
          role="region"
          aria-label="Testimonials carousel"
        >
          {/* 3D carousel container - Improved mobile handling */}
          <div
            {...swipeHandlers}
            className="relative h-[400px] xs:h-[450px] sm:h-[450px] md:h-[420px] overflow-visible flex items-center justify-center"
            style={{
              perspective: window.innerWidth < 640 ? "800px" : "1200px", // Less extreme perspective on mobile
            }}
          >
            {/* Navigation Arrows - Adjust position for mobile */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 flex justify-between pointer-events-none z-30 px-1 xs:px-2 sm:px-8">
              <button
                onClick={goToPrev}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 backdrop-blur flex items-center justify-center border border-white/10 shadow-lg hover:bg-royal/20 text-white hover:text-royal-light transition-all transform hover:scale-105 active:scale-95 pointer-events-auto"
                aria-label="Previous testimonial"
              >
                <FaChevronLeft className="text-xs sm:text-base" />
              </button>
              <button
                onClick={goToNext}
                className="w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 backdrop-blur flex items-center justify-center border border-white/10 shadow-lg hover:bg-royal/20 text-white hover:text-royal-light transition-all transform hover:scale-105 active:scale-95 pointer-events-auto"
                aria-label="Next testimonial"
              >
                <FaChevronRight className="text-xs sm:text-base" />
              </button>
            </div>

            {/* Carousel Track - Relative container for all cards */}
            <div
              className="relative w-full h-full flex items-center justify-center"
              style={{ transformStyle: "preserve-3d" }}
              onMouseEnter={() => setIsPaused(true)}
              onMouseLeave={() => setIsPaused(false)}
            >
              {/* Map through all testimonials and position them in 3D space */}
              {getTestimonialCards().map(
                ({ testimonial, index, relativeIndex }) => {
                  // Calculate position and styles based on relative index
                  const isActive = relativeIndex === 0;
                  const isPrev =
                    relativeIndex === -1 ||
                    (testimonials.length === 2 && relativeIndex === 1);
                  const isNext =
                    relativeIndex === 1 ||
                    (testimonials.length === 2 && relativeIndex === -1);

                  // Z depth is highest for active, lower for adjacent cards
                  const zIndex = isActive ? 20 : isPrev || isNext ? 10 : 5;

                  // Scale based on position - active is full size, others are smaller
                  const scale = isActive ? 1 : isPrev || isNext ? 0.85 : 0.7;

                  // Opacity based on position
                  const opacity = isActive ? 1 : isPrev || isNext ? 0.7 : 0.4;

                  // Calculate card width
                  const cardWidth = (() => {
                    if (isActive) return "80%"; // Wider on mobile, smaller on larger screens
                    if (isPrev || isNext) return "50%";
                    return "40%";
                  })();
                  const maxWidth = isActive ? "580px" : "400px";

                  // Calculate z offset (depth) - THIS WAS MISSING
                  const zOffset = isActive ? 0 : isPrev || isNext ? -50 : -150;

                  // Rotation to create circular effect - THIS WAS MISSING
                  const yRotation = isActive
                    ? 0
                    : isPrev
                    ? 45
                    : isNext
                    ? -45
                    : relativeIndex < -1
                    ? 65
                    : -65;

                  return (
                    <motion.div
                      key={index}
                      className="absolute transform-gpu cursor-pointer"
                      style={{
                        width: cardWidth,
                        maxWidth: maxWidth,
                        zIndex: zIndex,
                      }}
                      initial={false}
                      animate={{
                        // Adjust x position for smaller screens
                        x: isActive
                          ? 0
                          : isPrev
                          ? "-65%" // Less space on small screens, more on large
                          : isNext
                          ? "65%" // Less space on small screens, more on large
                          : relativeIndex < -1
                          ? "-80%"
                          : "80%",
                        y: 0,
                        z: zOffset,
                        // Reduce rotation angles on small screens to avoid excessive distortion
                        rotateY:
                          window.innerWidth < 640 ? yRotation * 0.6 : yRotation,
                        scale,
                        opacity,
                      }}
                      transition={{
                        type: "spring",
                        stiffness: 300,
                        damping: 30,
                        mass: 1.2,
                      }}
                      onClick={() => {
                        if (!isActive && !isAnimating) {
                          setDirection(relativeIndex > 0 ? 1 : -1);
                          setActiveIndex(index);
                        }
                      }}
                      onAnimationStart={handleAnimationStart}
                      onAnimationComplete={handleAnimationComplete}
                      whileHover={!isActive ? { scale: scale * 1.05 } : {}}
                      aria-hidden={!isActive}
                    >
                      {/* Enhance the card content for mobile */}
                      <div
                        className={`bg-gradient-to-br ${
                          isActive
                            ? "from-black to-navy-dark/90" // Darker background for better readability
                            : "from-black/90 to-navy-dark/60"
                        } backdrop-blur-md rounded-2xl border shadow-xl w-full
                        ${
                          isActive
                            ? "p-4 sm:p-7 md:p-8 border-white/15 shadow-2xl" // Reduced padding on mobile
                            : "p-3 sm:p-6 border-white/5"
                        }`}
                        style={{ transformStyle: "preserve-3d" }}
                      >
                        <FaQuoteRight
                          className={`absolute top-3 sm:top-4 right-3 sm:right-4 text-royal/10 
                            ${
                              isActive
                                ? "w-8 h-8 sm:w-12 sm:h-12"
                                : "w-6 h-6 sm:w-8 sm:h-8 opacity-60"
                            }`}
                        />

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.2, duration: 0.3 }}
                          className="flex items-center justify-center gap-1 mb-3 sm:mb-4"
                        >
                          {[...Array(testimonial.rating)].map((_, i) => (
                            <FaStar
                              key={i}
                              className={
                                isActive
                                  ? "w-4 h-4 sm:w-5 sm:h-5 text-royal-light"
                                  : "w-3 h-3 text-royal-light/70"
                              }
                            />
                          ))}
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.3, duration: 0.3 }}
                          className={`${
                            isActive && expandedQuote === index
                              ? "max-h-48 overflow-y-auto pr-2" // Fixed height with scroll when expanded
                              : "max-h-none overflow-visible"
                          }`}
                        >
                          <blockquote
                            className={`${
                              isActive
                                ? "text-base sm:text-lg md:text-xl text-white/90 mb-5 sm:mb-7" // Smaller font on mobile
                                : "text-xs sm:text-sm text-white/70 mb-3 sm:mb-4 line-clamp-2"
                            } italic`}
                          >
                            {isActive &&
                            testimonial.quote.length > 180 &&
                            expandedQuote !== index
                              ? `${testimonial.quote.substring(0, 180)}...`
                              : !isActive && testimonial.quote.length > 100
                              ? `${testimonial.quote.substring(0, 100)}...`
                              : testimonial.quote}

                            {isActive && testimonial.quote.length > 180 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setExpandedQuote(
                                    expandedQuote === index ? null : index
                                  );
                                }}
                                className="ml-2 text-royal-light text-sm font-medium hover:underline"
                              >
                                {expandedQuote === index
                                  ? "Show less"
                                  : "Read more"}
                              </button>
                            )}
                          </blockquote>
                        </motion.div>

                        <motion.div
                          initial={{ opacity: 0, scale: 0.8 }}
                          animate={{ opacity: 1, scale: 1 }}
                          transition={{ delay: 0.4, duration: 0.3 }}
                          className={`mx-auto mb-2 rounded-full bg-gradient-to-br from-royal/30 to-royal-light/30 flex items-center justify-center
                          ${
                            isActive
                              ? "h-10 w-10 sm:h-12 sm:w-12 mb-2 sm:mb-3"
                              : "h-7 w-7 sm:h-8 sm:w-8 mb-1 sm:mb-2"
                          }`}
                        >
                          <span
                            className={`font-bold text-royal-light
                              ${
                                isActive
                                  ? "text-lg sm:text-xl"
                                  : "text-xs sm:text-sm"
                              }`}
                          >
                            {testimonial.name.charAt(0)}
                          </span>
                        </motion.div>

                        <motion.cite
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          transition={{ delay: 0.5, duration: 0.3 }}
                          className="not-italic text-center block"
                        >
                          <span
                            className={`block font-semibold text-white
                              ${
                                isActive
                                  ? "text-lg sm:text-xl mb-1"
                                  : "text-xs sm:text-sm mb-0.5 text-white/80"
                              }`}
                          >
                            {testimonial.name}
                          </span>
                          {isActive && (
                            <div className="mt-2 flex flex-col items-center">
                              <div className="flex items-center justify-center flex-wrap gap-1 sm:gap-2 mb-2">
                                <span className="block bg-royal/20 text-royal-light text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                                  Age {testimonial.age}
                                </span>
                                <span className="block bg-royal/20 text-royal-light text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                                  {testimonial.location}
                                </span>
                              </div>
                              <div className="flex items-center justify-center">
                                <span className="block bg-emerald-500/20 text-emerald-300 text-xs sm:text-sm px-2 sm:px-3 py-0.5 sm:py-1 rounded-full">
                                  {testimonial.achievement}
                                </span>
                              </div>
                              <span className="text-xs text-white/50 mt-2">
                                Client since {testimonial.since}
                              </span>
                            </div>
                          )}
                        </motion.cite>
                      </div>

                      {/* Add reflection effect on bottom of cards */}
                      <div
                        className="absolute bottom-0 left-0 right-0 h-8 sm:h-12 bg-gradient-to-t from-royal/5 to-transparent rounded-b-2xl -z-10 opacity-30"
                        style={{
                          transform: "rotateX(80deg) translateY(18px)",
                          filter: "blur(4px)",
                        }}
                      />
                    </motion.div>
                  );
                }
              )}
            </div>
          </div>

          {/* Navigation Dots - Enhanced with animation */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6, duration: 0.4 }}
            className="flex justify-center gap-3 mt-8"
          >
            {testimonials.map((_, idx) => (
              <button
                key={idx}
                onClick={() => {
                  if (!isAnimating) {
                    setDirection(idx > activeIndex ? 1 : -1);
                    setActiveIndex(idx);
                    // Close any expanded quote when clicking dots
                    setExpandedQuote(null);
                  }
                }}
                className={`h-2.5 rounded-full transition-all duration-300 
                  ${
                    idx === activeIndex
                      ? "bg-royal-light w-8"
                      : "bg-white/20 w-2.5 hover:bg-white/40"
                  }`}
                aria-label={`Go to testimonial ${idx + 1}`}
                aria-current={idx === activeIndex ? "true" : "false"}
              />
            ))}
          </motion.div>
        </div>

        {/* Additional credibility element */}
        <motion.div
          className="mt-16 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          <p className="text-white/50 text-sm max-w-lg mx-auto">
            Clients of all ages and fitness levels have achieved their goals
            with personalized training programs designed for their unique needs.
          </p>
          <div className="mt-4 inline-block bg-black/40 backdrop-blur rounded-full px-4 py-1 text-white/70 text-xs border border-white/5">
            <span className="text-royal-light">100%</span> genuine testimonials
            from real clients
          </div>
        </motion.div>

        {/* Leave a Review Button */}
        <motion.div
          className="mt-12 text-center"
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <a
            href="https://g.page/r/CaACepEsFdx0EAE/review"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-3 px-8 py-4 bg-gradient-to-r from-royal to-royal-light text-white font-semibold rounded-full hover:shadow-lg hover:shadow-royal/25 transition-all duration-300 transform hover:scale-105 active:scale-95"
          >
            <svg
              className="w-5 h-5"
              fill="currentColor"
              viewBox="0 0 20 20"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            Leave a Review on Google
            <svg
              className="w-4 h-4 opacity-70"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          <p className="text-white/40 text-xs mt-3 max-w-md mx-auto">
            Share your experience and help others discover the transformative
            power of personalized training
          </p>
        </motion.div>
      </div>
    </section>
  );
}
