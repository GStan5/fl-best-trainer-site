import React, { useState } from "react";
import {
  FaChevronRight,
  FaHeart,
  FaDumbbell,
  FaAppleAlt,
  FaCheck,
  FaArrowRight,
} from "react-icons/fa";
import { motion } from "framer-motion";

// Create a wrapper component to fix the type issue
const IconWrapper = ({ icon: Icon, className }) => {
  return <Icon className={className} />;
};

export default function ApproachTabs() {
  const [activeTab, setActiveTab] = useState("philosophy");

  return (
    <div className="py-10">
      <div className="flex flex-wrap -mx-4">
        {/* Tab Navigation */}
        <div className="w-full md:w-1/3 px-4 mb-8 md:mb-0">
          <div className="sticky top-24">
            <h2 className="text-2xl font-bold text-white mb-8">My Approach</h2>
            <div className="space-y-2">
              <button
                onClick={() => setActiveTab("philosophy")}
                className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${
                  activeTab === "philosophy"
                    ? "bg-royal text-white"
                    : "bg-white/5 hover:bg-white/10 text-white/80"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      activeTab === "philosophy"
                        ? "bg-white text-royal"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    {/* Replace FaHeart with the wrapper */}
                    <IconWrapper
                      icon={FaHeart}
                      className={
                        activeTab === "philosophy"
                          ? "text-royal"
                          : "text-white/60"
                      }
                    />
                  </div>
                  Philosophy
                </div>
                <FaChevronRight
                  className={`transition-transform ${
                    activeTab === "philosophy" ? "rotate-90" : ""
                  }`}
                  size={14}
                />
              </button>
              <button
                onClick={() => setActiveTab("training")}
                className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${
                  activeTab === "training"
                    ? "bg-royal text-white"
                    : "bg-white/5 hover:bg-white/10 text-white/80"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      activeTab === "training"
                        ? "bg-white text-royal"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    <FaDumbbell
                      className={
                        activeTab === "training"
                          ? "text-royal"
                          : "text-white/60"
                      }
                    />
                  </div>
                  Training Style
                </div>
                {activeTab === "training" && <FaChevronRight />}
              </button>
              <button
                onClick={() => setActiveTab("nutrition")}
                className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center justify-between ${
                  activeTab === "nutrition"
                    ? "bg-royal text-white"
                    : "bg-white/5 hover:bg-white/10 text-white/80"
                }`}
              >
                <div className="flex items-center">
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 ${
                      activeTab === "nutrition"
                        ? "bg-white text-royal"
                        : "bg-white/10 text-white/60"
                    }`}
                  >
                    <FaAppleAlt
                      className={
                        activeTab === "nutrition"
                          ? "text-royal"
                          : "text-white/60"
                      }
                    />
                  </div>
                  Nutrition Approach
                </div>
                {activeTab === "nutrition" && <FaChevronRight />}
              </button>
            </div>
          </div>
        </div>

        {/* Tab Content */}
        <div className="w-full md:w-2/3 px-4">
          {/* Philosophy Tab */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: activeTab === "philosophy" ? 1 : 0,
              y: activeTab === "philosophy" ? 0 : 10,
            }}
            transition={{ duration: 0.3 }}
            className={activeTab === "philosophy" ? "block" : "hidden"}
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaHeart className="text-royal-light" /> My Fitness Philosophy
            </h3>
            <div className="prose prose-lg prose-invert max-w-none">
              <p>
                I believe that fitness is a journey, not a destination. My
                philosophy centers around creating sustainable, enjoyable
                fitness experiences that seamlessly integrate into your
                lifestyle.
              </p>

              {/* Visual separator */}
              <div className="my-6 border-t border-white/10"></div>

              <p>
                Every client is unique, which is why I take a personalized
                approach to each training program. By understanding your
                individual goals, preferences, and limitations, I can create a
                tailored plan that keeps you motivated and delivers results.
              </p>

              {/* Fancy separator with icon */}
              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-white/10"></div>
                <div className="mx-4 text-royal-light">
                  <FaHeart />
                </div>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              <p>
                Rather than focusing on quick fixes or extreme methods, I
                emphasize building healthy habits that last a lifetime. This
                balanced approach ensures that your fitness journey is not only
                effective but sustainable for years to come.
              </p>
              <blockquote>
                "The best workout plan is the one you'll actually follow
                consistently."
              </blockquote>

              {/* Call to Action */}
              <div className="mt-8 p-4 bg-gradient-to-r from-royal/20 to-transparent rounded-lg border border-royal/20">
                <h5 className="font-medium text-white mb-2">
                  Ready to begin your fitness journey?
                </h5>
                <p className="text-white/80 text-sm mb-3">
                  Let's work together to create a personalized fitness plan that
                  aligns with your philosophy and goals.
                </p>
                <a
                  href="#contact"
                  className="inline-flex items-center text-royal-light hover:text-white transition-colors"
                >
                  <span>Start your transformation today</span>
                  <FaChevronRight className="ml-2 text-sm" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Training Style Tab */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: activeTab === "training" ? 1 : 0,
              y: activeTab === "training" ? 0 : 10,
            }}
            transition={{ duration: 0.3 }}
            className={activeTab === "training" ? "block" : "hidden"}
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaDumbbell className="text-royal-light" /> Training Style
            </h3>
            <div className="prose prose-lg prose-invert max-w-none">
              <p>
                My training style combines functional strength training,
                mobility work, and cardiovascular conditioning to create
                well-rounded fitness programs that improve both performance and
                everyday quality of life.
              </p>

              {/* Visual separator */}
              <div className="my-6 border-t border-white/10"></div>

              <p>
                As an in-home trainer, I've mastered the art of creating
                effective workouts with minimal equipment. Whether you have a
                fully equipped home gym or just a small space with basic
                equipment, I'll design a program that works within your
                constraints while still delivering excellent results.
              </p>

              {/* Fancy separator with icon */}
              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-white/10"></div>
                <div className="mx-4 text-royal-light">
                  <FaDumbbell />
                </div>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              <p>
                I emphasize proper form and controlled movements to maximize
                effectiveness and minimize injury risk. Each session includes a
                proper warm-up, a targeted workout phase, and a recovery-focused
                cooldown.
              </p>
              <h4>My sessions typically include:</h4>
              <ul>
                <li className="hover:text-royal-light transition-colors duration-300 flex items-start">
                  <span className="text-royal mr-2 mt-1">→</span>
                  <span>Dynamic warm-ups to prepare your body safely</span>
                </li>
                <li className="hover:text-royal-light transition-colors duration-300 flex items-start">
                  <span className="text-royal mr-2 mt-1">→</span>
                  <span>
                    Strength training with progressive overload principles
                  </span>
                </li>
                <li className="hover:text-royal-light transition-colors duration-300 flex items-start">
                  <span className="text-royal mr-2 mt-1">→</span>
                  <span>
                    Functional movements that improve everyday activities
                  </span>
                </li>
                <li className="hover:text-royal-light transition-colors duration-300 flex items-start">
                  <span className="text-royal mr-2 mt-1">→</span>
                  <span>Mobility work to enhance range of motion</span>
                </li>
                <li className="hover:text-royal-light transition-colors duration-300 flex items-start">
                  <span className="text-royal mr-2 mt-1">→</span>
                  <span>
                    Customized intensity levels that challenge but don't
                    overwhelm
                  </span>
                </li>
                <li className="hover:text-royal-light transition-colors duration-300 flex items-start">
                  <span className="text-royal mr-2 mt-1">→</span>
                  <span>Proper cooldown and recovery techniques</span>
                </li>
              </ul>

              {/* Call to Action */}
              <div className="mt-8 p-4 bg-gradient-to-r from-royal/20 to-transparent rounded-lg border border-royal/20">
                <h5 className="font-medium text-white mb-2">
                  Experience my training style firsthand
                </h5>
                <p className="text-white/80 text-sm mb-3">
                  Book a session to see how my training approach can be tailored
                  to your specific needs and goals.
                </p>
                <a
                  href="#contact"
                  className="inline-flex items-center text-royal-light hover:text-white transition-colors"
                >
                  <span>Schedule your first session</span>
                  <FaChevronRight className="ml-2 text-sm" />
                </a>
              </div>
            </div>
          </motion.div>

          {/* Nutrition Approach Tab */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{
              opacity: activeTab === "nutrition" ? 1 : 0,
              y: activeTab === "nutrition" ? 0 : 10,
            }}
            transition={{ duration: 0.3 }}
            className={activeTab === "nutrition" ? "block" : "hidden"}
          >
            <h3 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
              <FaAppleAlt className="text-royal-light" /> Nutrition Approach
            </h3>
            <div className="prose prose-lg prose-invert max-w-none">
              <p>
                Nutrition is a critical component of any fitness journey. My
                approach focuses on sustainable, balanced eating habits rather
                than restrictive diets or extreme measures.
              </p>

              {/* Visual separator */}
              <div className="my-6 border-t border-white/10"></div>

              <p>
                I help clients understand the fundamentals of nutrition –
                including macronutrients, portion control, meal timing, and
                hydration – and how these elements work together to support your
                fitness goals.
              </p>

              {/* Fancy separator with icon */}
              <div className="my-6 flex items-center">
                <div className="flex-1 border-t border-white/10"></div>
                <div className="mx-4 text-royal-light">
                  <FaAppleAlt />
                </div>
                <div className="flex-1 border-t border-white/10"></div>
              </div>

              <p>
                My nutrition guidance is adaptable to your preferences,
                lifestyle, and dietary restrictions. Whether you're looking to
                lose weight, build muscle, or improve athletic performance, I
                can help you develop eating patterns that support these goals
                while still enjoying food.
              </p>
              <h4>My nutrition coaching includes:</h4>
              <ul>
                <li className="hover:text-royal-light transition-colors duration-300 flex items-start">
                  <span className="text-royal mr-2 mt-1">→</span>
                  <span>
                    Customized nutrition strategies aligned with your goals
                  </span>
                </li>
                <li className="hover:text-royal-light transition-colors duration-300 flex items-start">
                  <span className="text-royal mr-2 mt-1">→</span>
                  <span>Practical meal planning advice for your lifestyle</span>
                </li>
                <li className="hover:text-royal-light transition-colors duration-300 flex items-start">
                  <span className="text-royal mr-2 mt-1">→</span>
                  <span>
                    Education on proper portion sizes and food quality
                  </span>
                </li>
                <li className="hover:text-royal-light transition-colors duration-300 flex items-start">
                  <span className="text-royal mr-2 mt-1">→</span>
                  <span>Strategies for dining out and social situations</span>
                </li>
                <li className="hover:text-royal-light transition-colors duration-300 flex items-start">
                  <span className="text-royal mr-2 mt-1">→</span>
                  <span>
                    Sustainable approaches that don't rely on deprivation
                  </span>
                </li>
                <li className="hover:text-royal-light transition-colors duration-300 flex items-start">
                  <span className="text-royal mr-2 mt-1">→</span>
                  <span>
                    Ongoing adjustments based on your progress and feedback
                  </span>
                </li>
              </ul>

              {/* Call to Action */}
              <div className="mt-8 p-4 bg-gradient-to-r from-royal/20 to-transparent rounded-lg border border-royal/20">
                <h5 className="font-medium text-white mb-2">
                  Ready for nutritional guidance?
                </h5>
                <p className="text-white/80 text-sm mb-3">
                  Learn how proper nutrition can complement your training and
                  accelerate your results.
                </p>
                <a
                  href="#contact"
                  className="inline-flex items-center text-royal-light hover:text-white transition-colors"
                >
                  <span>Get nutrition advice</span>
                  <FaChevronRight className="ml-2 text-sm" />
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
