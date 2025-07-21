import React, { useState } from "react";
import { motion } from "framer-motion";
import BlogImage from "./BlogImage"; // Import BlogImage component
import { FaSearch } from "react-icons/fa";

export default function BlogList({ filteredPosts, handlePostSelect }) {
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;

  // Get current posts
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);

  if (filteredPosts.length === 0) {
    return (
      <div className="text-center py-20">
        <h3 className="text-xl text-white/80">No posts found</h3>
        <p className="text-white/60 mt-2">
          Try adjusting your search or category filters
        </p>
      </div>
    );
  }

  return (
    <div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {currentPosts.map((post) => (
          <motion.div
            key={post.id}
            className="group bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden hover:border-royal/30 hover:shadow-lg hover:shadow-royal/10 transition-all duration-300"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            whileHover={{ scale: 1.02 }}
            transition={{ duration: 0.2 }}
            onClick={() => handlePostSelect(post)}
          >
            {/* Replace standard img with BlogImage component for fallback icons */}
            <div className="relative h-48">
              <BlogImage post={post} height="192px" />
              <div className="absolute bottom-3 left-3">
                <span className="bg-black/60 backdrop-blur-sm px-3 py-1 text-xs uppercase font-medium tracking-wider text-white/90 rounded-full border border-white/10">
                  {post.category}
                </span>
              </div>
              {/* Featured indicator */}
              {post.featured && (
                <div className="absolute top-3 right-3">
                  <span className="bg-royal text-white px-2 py-1 text-xs font-bold rounded-full">
                    FEATURED
                  </span>
                </div>
              )}
            </div>

            <div className="p-5">
              <h3 className="text-lg font-bold text-white group-hover:text-royal-light transition-colors mb-2">
                {post.title}
              </h3>
              <p className="text-white/70 text-sm mb-4 line-clamp-2">
                {post.excerpt}
              </p>
              <div className="flex items-center text-xs text-white/60">
                <span>{post.date}</span>
                <span className="mx-2">•</span>
                <span>{post.readTime}</span>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Pagination UI */}
      <div className="mt-8 flex justify-center">
        <div className="flex space-x-2">
          {Array.from({
            length: Math.ceil(filteredPosts.length / postsPerPage),
          }).map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentPage(index + 1)}
              className={`w-8 h-8 rounded-full ${
                currentPage === index + 1
                  ? "bg-royal text-white"
                  : "bg-black/20 text-white/70 hover:bg-royal/20"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
