import React, { useEffect, useState } from "react";
import { FaArrowRight, FaCalendar, FaClock } from "react-icons/fa";
import { getCategoryIcon, getCategoryStyles } from "./utils/categoryIcons";
import BlogImage from "./BlogImage";

export default function BlogPostTooltip({
  post,
  handlePostSelect,
  position = { top: false, right: true },
  tooltipPosition = null,
}) {
  if (!post) return null;

  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Adjust tooltip width based on screen size
  const getTooltipWidth = () => {
    if (windowWidth < 640) return "85vw";
    if (windowWidth < 1024) return "300px";
    return "320px";
  };

  // Arrow position classes
  const arrowClasses = position.right
    ? position.top
      ? "left-0 top-full -translate-x-1/2 -translate-y-1/2 rotate-45" // Arrow at bottom-left
      : "left-0 top-1/3 -translate-x-1/2 -translate-y-0 rotate-45" // Arrow at left
    : position.top
    ? "right-0 top-full translate-x-1/2 -translate-y-1/2 rotate-45" // Arrow at bottom-right
    : "right-0 top-1/3 translate-x-1/2 -translate-y-0 rotate-45"; // Arrow at right

  // Get category-specific styling
  const categoryClass = getCategoryStyles(post.category);

  return (
    <div
      className="fixed z-[999] bg-black/80 backdrop-blur-lg border border-white/10 rounded-lg shadow-xl overflow-hidden transition-all duration-200 pointer-events-auto"
      style={{
        top: tooltipPosition?.top - 125 || 0, // Center vertically relative to hovered item
        left: tooltipPosition?.left || 0,
        width: getTooltipWidth(),
        boxShadow:
          "0 10px 25px -5px rgba(0, 0, 0, 0.8), 0 10px 10px -5px rgba(0, 0, 0, 0.5)",
      }}
    >
      {/* Use BlogImage component with fallback icon support */}
      <div className="w-full h-32 relative">
        <BlogImage post={post} height="128px" className="w-full" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
      </div>

      <div className="p-4">
        {/* Category tag with appropriate styling */}
        <div className="mb-2">
          <span
            className={`text-xs px-2 py-1 rounded-full border ${categoryClass}`}
          >
            {post.category}
          </span>
        </div>

        {/* Post title */}
        <h3 className="text-white font-semibold line-clamp-2 mb-2">
          {post.title}
        </h3>

        {/* Post excerpt */}
        <p className="text-white/70 text-xs line-clamp-2 mb-3">
          {post.excerpt}
        </p>

        {/* Meta information with date and read time */}
        <div className="flex items-center justify-between text-xs text-white/60 mb-3">
          <div className="flex items-center">
            <FaCalendar className="mr-1" />
            <span>{post.date}</span>
          </div>
          <div className="flex items-center">
            <FaClock className="mr-1" />
            <span>{post.readTime}</span>
          </div>
        </div>

        {/* Read button */}
        <button
          onClick={() => handlePostSelect(post)}
          className="w-full py-2 bg-royal/20 hover:bg-royal/30 rounded text-royal-light text-sm flex items-center justify-center transition-colors"
        >
          Read Article
          <FaArrowRight className="ml-2" size={12} />
        </button>
      </div>
    </div>
  );
}
