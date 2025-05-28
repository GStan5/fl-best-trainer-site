import React from "react";
import { motion } from "framer-motion";
import { FaCalendarAlt, FaClock } from "react-icons/fa";
import { getCategoryStyles } from "./utils/categoryIcons";
import BlogImage from "./BlogImage"; // Import the BlogImage component

export default function BlogPostCard({ post, onClick, isFeatured = false }) {
  const categoryClasses = getCategoryStyles(post.category);

  return (
    <motion.div
      className={`group bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden ${
        isFeatured ? "lg:col-span-2" : ""
      }`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: 20 }}
      whileHover={{ scale: 1.02 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
    >
      {/* Replace the existing image section with BlogImage component */}
      <BlogImage 
        post={post} 
        height="200px" 
      />
      
      <div className="p-6">
        {/* Category tag */}
        <div className="mb-4">
          <span className={`px-3 py-1 rounded-full text-xs border ${categoryClasses}`}>
            {post.category}
          </span>
        </div>

        {/* Title */}
        <h3 className="text-xl font-bold text-white mb-3 group-hover:text-royal-light transition-colors">
          {post.title}
        </h3>

        {/* Excerpt */}
        <p className="text-white/70 text-sm mb-4 line-clamp-2">{post.excerpt}</p>

        {/* Meta info */}
        <div className="flex items-center text-xs text-white/60">
          <div className="flex items-center">
            <FaCalendarAlt className="mr-1" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center ml-4">
            <FaClock className="mr-1" />
            <span>{post.readTime}</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}