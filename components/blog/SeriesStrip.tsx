import { motion } from "framer-motion";
import { FaArrowRight } from "react-icons/fa";

export default function SeriesStrip({ latestPost, count = 0, onSelect }) {
  if (!latestPost) {
    return null;
  }

  const seriesName = latestPost.series || "The Daily Rep";

  return (
    <motion.div
      className="mb-12"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="rounded-xl border border-royal/30 bg-gradient-to-r from-royal/20 via-royal/10 to-transparent p-5 sm:p-6 flex flex-col md:flex-row md:items-center gap-4 md:gap-6">
        <div className="flex-1 min-w-0">
          <span className="text-royal-light text-xs font-semibold uppercase tracking-[0.2em]">
            New series
          </span>
          <h2 className="text-2xl sm:text-3xl font-bold text-white mt-1">
            {seriesName}
          </h2>
          <p className="text-white/70 text-sm sm:text-base mt-1">
            A new post from Gavin every day — form-first strength training for
            adults over 50.{" "}
            {count > 0 && (
              <span className="text-white/50">
                {count} {count === 1 ? "post" : "posts"} so far.
              </span>
            )}
          </p>
        </div>
        <button
          onClick={() => onSelect(latestPost)}
          className="group flex-shrink-0 text-left bg-black/30 hover:bg-black/50 border border-white/10 hover:border-royal/40 rounded-lg px-4 py-3 transition-all duration-200 max-w-full md:max-w-xs w-full md:w-auto"
        >
          <span className="block text-xs uppercase tracking-wider text-white/50 mb-1">
            Latest · {latestPost.date}
          </span>
          <span className="block text-white font-medium leading-snug">
            {latestPost.title}
          </span>
          <span className="mt-2 inline-flex items-center gap-1.5 text-royal-light text-sm font-medium">
            Read it
            <FaArrowRight
              size={12}
              className="transition-transform duration-200 group-hover:translate-x-0.5"
            />
          </span>
        </button>
      </div>
    </motion.div>
  );
}
