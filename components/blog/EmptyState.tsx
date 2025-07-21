import { motion } from "framer-motion";
import { FaSearch, FaBook } from "react-icons/fa";

export default function EmptyState({
  searchTerm,
  activeCategory,
  onClearFilters,
}) {
  const hasFilters = searchTerm || activeCategory !== "all";

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="text-center py-16 px-4"
    >
      <div className="max-w-md mx-auto">
        <div className="mb-6">
          {hasFilters ? (
            <FaSearch className="w-16 h-16 text-white/30 mx-auto" />
          ) : (
            <FaBook className="w-16 h-16 text-white/30 mx-auto" />
          )}
        </div>

        <h3 className="text-2xl font-bold text-white mb-4">
          {hasFilters ? "No articles found" : "No articles yet"}
        </h3>

        <p className="text-white/60 mb-6 leading-relaxed">
          {hasFilters ? (
            <>
              No articles match your current filters. Try adjusting your search
              or browse all categories.
            </>
          ) : (
            <>
              We're working on adding more great content. Check back soon for
              new fitness tips and insights!
            </>
          )}
        </p>

        {hasFilters && (
          <button
            onClick={onClearFilters}
            className="bg-royal/20 hover:bg-royal/30 text-royal-light border border-royal/30 px-6 py-3 rounded-lg transition-all duration-300 hover:scale-105"
          >
            Clear all filters
          </button>
        )}
      </div>
    </motion.div>
  );
}
