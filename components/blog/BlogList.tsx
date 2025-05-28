import { motion } from "framer-motion";
import Image from "next/image";
import { FaCalendarAlt, FaArrowRight, FaSearch } from "react-icons/fa";
import { getCategoryIcon } from "./utils/categoryIcons";

export default function BlogList({ filteredPosts, handlePostSelect }) {
  return (
    <div className="py-6">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 sm:gap-6">
        {filteredPosts.length > 0 ? (
          filteredPosts.map((post, index) => (
            <motion.div
              key={post.id}
              className="group relative rounded-xl bg-black/30 border border-white/10 hover:border-royal/30 overflow-hidden transition-all duration-300 flex flex-col"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }} // Changed from whileInView to animate
              transition={{ duration: 0.5, delay: index * 0.1 }}
              whileHover={{ y: -5 }}
              onClick={() => handlePostSelect(post)}
            >
              <div className="aspect-video relative overflow-hidden">
                {post.image ? (
                  <Image
                    src={post.image}
                    alt={post.title}
                    layout="fill"
                    objectFit="cover"
                    className="object-cover w-full h-full transform transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-navy">
                    {getCategoryIcon(post.category, 48)}
                  </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black to-transparent opacity-70"></div>
                <div className="absolute bottom-3 left-3 flex items-center">
                  <span className="bg-royal/80 text-white text-xs px-2 py-1 rounded-md">
                    {post.category}
                  </span>
                  <span className="bg-black/60 text-white/80 text-xs px-2 py-1 rounded-md ml-2">
                    {post.readTime}
                  </span>
                </div>
              </div>
              <div className="p-4 flex-1 flex flex-col">
                <h3 className="font-medium text-white mb-2 group-hover:text-royal-light transition-colors duration-300">
                  {post.title}
                </h3>
                <p className="text-white/70 text-sm line-clamp-3 mb-4">
                  {post.excerpt}
                </p>
                <div className="mt-auto pt-2 flex justify-between items-center">
                  <span className="text-xs text-white/50">{post.date}</span>
                  <button
                    onClick={() => handlePostSelect(post)}
                    className="text-xs bg-royal/20 hover:bg-royal/40 text-royal-light px-3 py-1 rounded-lg transition-colors duration-300"
                  >
                    Read More
                  </button>
                </div>
              </div>
            </motion.div>
          ))
        ) : (
          <div className="col-span-full py-12 text-center">
            <div className="inline-flex justify-center items-center w-16 h-16 rounded-full bg-black/40 mb-4">
              <FaSearch className="text-white/30 text-xl" />
            </div>
            <h3 className="text-xl font-medium text-white mb-2">
              No articles found
            </h3>
            <p className="text-white/70">
              Try adjusting your search or filter to find what you're looking
              for
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
