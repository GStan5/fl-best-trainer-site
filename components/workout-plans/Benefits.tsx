import Image from "next/image";
import {
  FaCheckCircle,
  FaChartLine,
  FaClipboardCheck,
  FaUserCog,
  FaShieldAlt,
  FaDumbbell,
  FaBolt,
  FaStar,
  FaQuoteLeft,
} from "react-icons/fa";
import { motion } from "framer-motion";

export default function Benefits() {
  // Enhanced benefits with icons and more detailed descriptions
  const benefits = [
    {
      icon: <FaUserCog className="text-royal text-lg" />,
      title: "Personalized Programming",
      description: "Customized to your body type, goals, and available time",
    },
    {
      icon: <FaChartLine className="text-royal text-lg" />,
      title: "Progressive Overload",
      description: "Strategically planned progression to prevent plateaus",
    },
    {
      icon: <FaClipboardCheck className="text-royal text-lg" />,
      title: "Form Guidance",
      description:
        "Detailed instructions to ensure proper technique and safety",
    },
    {
      icon: <FaShieldAlt className="text-royal text-lg" />,
      title: "Injury Prevention",
      description:
        "Programs designed with your injury history and limitations in mind",
    },
  ];

  return (
    <div className="py-12" id="benefits">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.6 }}
        className="text-center mb-12"
      >
        <h2 className="text-3xl font-bold text-white mb-4">
          The Benefits of <span className="text-royal">Custom</span>{" "}
          <span className="text-royal">Plan Types</span>
        </h2>
        <div className="w-80 h-1 bg-gradient-to-r from-transparent via-royal to-transparent mx-auto mt-6 float-animation"></div>
        <p className="text-white/70 max-w-2xl mx-auto pt-3">
          Generic fitness programs don't account for your unique needs. My
          custom plans are designed specifically for you, ensuring better
          results with less wasted effort.
        </p>
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
        {/* Left column with feature cards */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.2 }}
          className="lg:col-span-2"
        >
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {benefits.map((benefit, index) => (
              <motion.a
                href="#pricing"
                key={index}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.4, delay: index * 0.1 + 0.3 }}
                className="bg-gradient-to-br from-white/8 to-white/5 hover:from-royal/20 hover:to-royal/10 border border-white/10 hover:border-royal/20 rounded-xl p-6 transition-all duration-300 shadow-lg shadow-black/5 hover:shadow-royal/10 cursor-pointer group"
              >
                <div className="w-12 h-12 bg-royal/20 group-hover:bg-royal/30 rounded-lg flex items-center justify-center mb-4 shadow-inner transition-all duration-300">
                  {benefit.icon}
                </div>
                <h3 className="text-xl font-semibold text-white mb-2 group-hover:text-royal transition-colors duration-300">
                  {benefit.title}
                </h3>
                <p className="text-white/70 group-hover:text-white/90 transition-colors duration-300">
                  {benefit.description}
                </p>
                <div className="mt-4 text-royal opacity-0 group-hover:opacity-100 transition-all duration-300 text-sm font-medium flex items-center justify-end">
                  View Plans <FaBolt className="ml-1" />
                </div>
              </motion.a>
            ))}
          </div>

          {/* Additional benefits list - enhanced with better styling and centered title */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.5 }}
            className="mt-8 bg-gradient-to-br from-royal/10 to-royal/5 p-6 rounded-xl border border-royal/20 shadow-lg shadow-royal/5"
          >
            <div className="flex justify-center mb-6">
              <h3 className="text-xl font-semibold text-white flex items-center">
                <FaStar className="text-royal mr-2" />
                Additional Benefits
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-royal/20 flex items-center justify-center mr-3">
                  <FaCheckCircle className="text-royal text-xs" />
                </div>
                <p className="text-white/80">Time-efficient routines</p>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-royal/20 flex items-center justify-center mr-3">
                  <FaCheckCircle className="text-royal text-xs" />
                </div>
                <p className="text-white/80">Equipment adaptability</p>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-royal/20 flex items-center justify-center mr-3">
                  <FaCheckCircle className="text-royal text-xs" />
                </div>
                <p className="text-white/80">Regular program updates</p>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-royal/20 flex items-center justify-center mr-3">
                  <FaCheckCircle className="text-royal text-xs" />
                </div>
                <p className="text-white/80">Scientific principles</p>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-royal/20 flex items-center justify-center mr-3">
                  <FaCheckCircle className="text-royal text-xs" />
                </div>
                <p className="text-white/80">Direct trainer access</p>
              </div>
              <div className="flex items-center">
                <div className="w-6 h-6 rounded-full bg-royal/20 flex items-center justify-center mr-3">
                  <FaCheckCircle className="text-royal text-xs" />
                </div>
                <p className="text-white/80">Results tracking system</p>
              </div>
            </div>
          </motion.div>
        </motion.div>

        {/* Right column with stats and testimonial - adjusted to match left column height */}
        <motion.div
          initial={{ opacity: 0, x: 20 }}
          whileInView={{ opacity: 1, x: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, delay: 0.3 }}
          className="relative h-full flex flex-col justify-between"
        >
          {/* Stats card - adjusted spacing */}
          <div className="bg-gradient-to-br from-white/15 to-white/5 backdrop-blur-sm p-7 rounded-xl border border-white/20 shadow-xl mb-5">
            <h3 className="text-2xl font-bold text-white mb-5 text-center">
              Client Success
            </h3>
            <div className="grid grid-cols-2 gap-5 text-center mb-5">
              <div>
                <div className="text-royal font-bold text-4xl mb-1">94%</div>
                <div className="text-white/70">Success Rate</div>
              </div>
              <div>
                <div className="text-royal font-bold text-4xl mb-1">3x</div>
                <div className="text-white/70">Faster Results</div>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-5 text-center">
              <div>
                <div className="text-royal font-bold text-3xl mb-1">87%</div>
                <div className="text-white/70">Stick to Plan</div>
              </div>
              <div>
                <div className="text-royal font-bold text-3xl mb-1">12+</div>
                <div className="text-white/70">Weeks Avg</div>
              </div>
            </div>
            <div className="flex justify-center mt-5">
              <FaDumbbell className="text-royal text-3xl" />
            </div>
          </div>

          {/* Client testimonial - adjusted spacing */}
          <div className="bg-gradient-to-br from-black/80 to-black/60 backdrop-blur-md p-6 rounded-xl border border-royal/30 shadow-lg mb-5 flex-grow flex flex-col justify-center">
            <div className="text-white">
              <div className="flex justify-center mb-3">
                <div className="text-royal">
                  <FaQuoteLeft className="text-2xl opacity-50" />
                </div>
              </div>
              <p className="italic text-white/90 text-center mb-4">
                "Gavin's personalized plan helped me achieve in 3 months what I
                couldn't in 2 years of generic programs. The customization made
                all the difference."
              </p>
              <div className="text-center">
                <div className="font-medium text-white">Michael R.</div>
                <div className="text-royal text-sm">
                  Lost 35 lbs in 4 months
                </div>
              </div>
            </div>
          </div>

          {/* Call to action - adjusted spacing */}
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.4, delay: 0.7 }}
          >
            <a
              href="#pricing"
              className="group block w-full bg-gradient-to-r from-royal to-royal-light text-white text-center font-semibold py-5 px-6 rounded-lg transition-all duration-300 shadow-lg shadow-royal/20 hover:shadow-xl hover:shadow-royal/30 hover:-translate-y-0.5"
            >
              <span className="flex items-center justify-center">
                See Plan Options
                <FaBolt className="ml-2 group-hover:translate-x-1 transition-transform duration-300" />
              </span>
            </a>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
