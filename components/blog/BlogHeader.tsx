import { motion } from "framer-motion";

export default function BlogHeader({ totalPosts = 0 }) {
  return (
    <div className="mt-8 mb-12 text-center max-w-3xl mx-auto">
      <motion.div
        className="inline-flex items-center justify-center mb-3"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }} // Changed from whileInView to animate
        transition={{ duration: 0.4 }}
      >
        <div className="h-px w-12 bg-gradient-to-r from-transparent to-royal/70"></div>
        <span className="px-3 text-royal-light text-sm font-medium">
          INSIGHTS & TIPS
        </span>
        <div className="h-px w-12 bg-gradient-to-l from-transparent to-royal/70"></div>
      </motion.div>

      <motion.h1
        className="text-4xl md:text-5xl lg:text-6xl font-bold text-white mb-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }} // Changed from whileInView to animate
        transition={{ duration: 0.5 }}
      >
        Fitness <span className="text-royal-light">Blog</span>
      </motion.h1>

      <motion.p
        className="text-lg text-white/70 max-w-2xl mx-auto mb-3"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }} // Changed from whileInView to animate
        transition={{ duration: 0.5, delay: 0.2 }}
      >
        Practical advice, workout tips, and fitness insights to help you achieve
        your health goals
      </motion.p>

      {totalPosts > 0 && (
        <motion.div
          className="inline-flex items-center text-sm text-white/60 bg-white/5 px-3 py-1 rounded-full border border-white/10"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
        >
          <span className="text-royal-light font-medium mr-1">
            {totalPosts}
          </span>
          <span>{totalPosts === 1 ? "article" : "articles"} available</span>
        </motion.div>
      )}
    </div>
  );
}
