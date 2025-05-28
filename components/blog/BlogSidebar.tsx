import React, { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import {
  FaSearch,
  FaTimes,
  FaListUl,
  FaAngleRight,
  FaArrowLeft,
  FaDumbbell,
  FaAppleAlt,
  FaBrain,
  FaBook,
  FaBed,
  FaFileAlt,
  FaChevronLeft,
  FaChevronRight,
  FaBars, // Add this import
} from "react-icons/fa";
import BlogPostTooltip from "./BlogPostTooltip";
import { getCategoryIcon, getCategoryStyles } from "./utils/categoryIcons";
import { createPortal } from "react-dom";

// Update BlogSidebar to respect mobile hiding

// Update the BlogSidebar to properly use the isMobile prop

// Update the component definition to accept and destructure the isMobile prop
export default function BlogSidebar({
  selectedPost,
  categories,
  filteredPosts,
  activeCategory,
  setActiveCategory,
  handlePostSelect,
  handleClosePost,
  sidebarCollapsed,
  setSidebarCollapsed,
  sidebarWidth,
  setSidebarWidth,
  screenSize,
  blogSectionRef,
  isMobile, // Accept the isMobile prop
}) {
  // If mobile, don't render the sidebar at all
  if (isMobile) return null;

  // Auto-collapse on small/medium screens
  const [isCollapsed, setIsCollapsed] = useState(screenSize !== "lg");

  // Update collapsed state when screen size changes
  useEffect(() => {
    if (screenSize !== "lg") {
      setIsCollapsed(true);
    }
  }, [screenSize]);

  const [hoveredPostId, setHoveredPostId] = useState(null);
  const [sidebarWidthState, setSidebarWidthState] = useState(240);
  const [isResizing, setIsResizing] = useState(false);
  const sidebarRef = useRef(null);
  const hoveredItemRefs = useRef({});
  const [tooltipPosition, setTooltipPosition] = useState({ top: 0, left: 0 });
  const [tooltipRect, setTooltipRect] = useState({ top: 0, left: 0 });
  const [isBrowser, setIsBrowser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Track window width for responsive tooltip positioning
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

  // Fix tooltip calculation to work with fixed sidebar and show tooltip to the right
  useEffect(() => {
    if (hoveredPostId && hoveredItemRefs.current[hoveredPostId]) {
      const itemRect =
        hoveredItemRefs.current[hoveredPostId].getBoundingClientRect();
      const sidebarRect = sidebarRef.current.getBoundingClientRect();

      // Always show tooltip to the right of sidebar
      // Position at vertical center of hovered item
      const tooltipTop = itemRect.top + itemRect.height / 2;

      // Position to the right of sidebar with a small gap
      // We add the sidebar width plus a small margin
      const tooltipLeft = sidebarRect.right + 15;

      // Always show tooltip to the right in this case
      setTooltipPosition({
        top: false,
        right: true,
      });

      setTooltipRect({
        top: tooltipTop,
        left: tooltipLeft,
      });
    }
  }, [hoveredPostId]);

  // Update tooltip position when hovering over a post
  useEffect(() => {
    if (hoveredPostId && hoveredItemRefs.current[hoveredPostId]) {
      const rect =
        hoveredItemRefs.current[hoveredPostId].getBoundingClientRect();

      // Log the calculated position
      console.log("Tooltip position calculated:", {
        top: rect.top + rect.height / 2,
        left: rect.right + 10,
      });

      setTooltipPosition({
        top: rect.top + rect.height / 2,
        left: rect.right + 10,
      });
    }
  }, [hoveredPostId]);

  // Map categories to appropriate icons for posts
  const getPostIcon = (category) => {
    // Use the utility function that already has the correct mapping
    return getCategoryIcon(category, 16);
  };

  // Handle mouse events for resizing
  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  const stopResizing = () => {
    setIsResizing(false);
  };

  const resize = (e) => {
    if (isResizing) {
      const newWidth = e.clientX;
      if (newWidth >= 180 && newWidth <= 400) {
        setSidebarWidthState(newWidth);
      }
    }
  };

  // Add event listeners for resizing
  useEffect(() => {
    window.addEventListener("mousemove", resize);
    window.addEventListener("mouseup", stopResizing);
    return () => {
      window.removeEventListener("mousemove", resize);
      window.removeEventListener("mouseup", stopResizing);
    };
  }, [isResizing]);

  // Add this effect to update a CSS variable for sidebar width
  useEffect(() => {
    // Update CSS variable for sidebar width to use in absolute positioning
    document.documentElement.style.setProperty(
      "--sidebar-current-width",
      `${isCollapsed ? 60 : sidebarWidthState}px`
    );
  }, [isCollapsed, sidebarWidthState]);

  // Add this useEffect to handle client-side rendering for the portal
  useEffect(() => {
    setIsBrowser(true);
  }, []);

  // Update sidebar for automatically using mini version on smaller screens

  return (
    <>
      <motion.div
        ref={sidebarRef}
        style={{
          width: isCollapsed ? "60px" : sidebarWidthState,
          overflowX: "visible",
        }}
        initial={{ x: -20, opacity: 0.8 }}
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`h-screen bg-black/60 backdrop-blur-lg border-r border-white/10 z-40 transition-all duration-300 ease-in-out overflow-y-auto overflow-x-visible fixed top-0 left-0 ${
          isMobile ? "border-r-2 border-royal/20" : ""
        }`}
      >
        {/* Sidebar content */}
        <div className="flex flex-col h-full py-6 px-4 pt-24 overflow-hidden">
          {/* Divider */}
          <div className="h-px bg-white/10 mx-auto mb-4 w-full"></div>

          {/* Search input */}
          <div className="relative mb-8">
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSearch();
              }}
              placeholder="Search blog posts..."
              className="w-full bg-black/20 text-white border border-white/10 rounded-lg py-2 pl-4 pr-10 focus:outline-none focus:border-royal/50 focus:ring-1 focus:ring-royal/30"
            />
            {searchTerm ? (
              <button
                onClick={() => setSearchTerm("")}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-white/60 hover:text-white transition-colors"
              >
                <FaTimes size={14} />
              </button>
            ) : (
              <span className="absolute right-3 top-1/2 -translate-y-1/2 text-white/40">
                <FaSearch size={14} />
              </span>
            )}
          </div>

          {/* Category filters */}
          <div
            className={`flex flex-col gap-2 mb-6 ${
              isCollapsed ? "items-center" : ""
            }`}
          >
            {categories.map((category) => {
              const categoryClasses =
                category !== "all"
                  ? getCategoryStyles(category)
                  : "bg-white/10 text-white/70";

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`w-full flex items-center py-2 px-3 rounded-lg text-left transition-all ${
                    activeCategory === category
                      ? "bg-royal text-white" // Keep active state consistent
                      : `hover:bg-white/5 hover:text-white ${
                          category !== "all"
                            ? categoryClasses.replace("bg-", "hover:bg-")
                            : ""
                        }`
                  }`}
                >
                  {/* Show category icon */}
                  <span
                    className={`mr-3 ${
                      activeCategory === category ? "text-white" : ""
                    }`}
                  >
                    {category === "all" ? (
                      <FaSearch size={14} />
                    ) : (
                      getCategoryIcon(category, 14)
                    )}
                  </span>

                  <span className="capitalize">
                    {category === "all" ? "All Posts" : category}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Divider */}
          <div className="h-px bg-white/10 mx-auto mb-4 w-full"></div>

          {/* Blog post list */}
          <div
            className={`flex flex-col gap-2 overflow-y-auto flex-1 hide-scrollbar ${
              isCollapsed ? "" : "pr-1"
            }`}
          >
            {!isCollapsed && (
              <h4 className="text-white/70 text-xs uppercase tracking-wider px-1 mb-2">
                Posts
              </h4>
            )}

            {filteredPosts.map((post) => (
              <div
                key={post.id}
                className="relative"
                ref={(el) => (hoveredItemRefs.current[post.id] = el)}
                onMouseEnter={() => !isCollapsed && setHoveredPostId(post.id)}
                onMouseLeave={() => setHoveredPostId(null)}
              >
                <button
                  onClick={() => handlePostSelect(post)}
                  className={`w-full flex items-center ${
                    isCollapsed ? "p-1 justify-center" : "p-2"
                  } rounded-lg transition-all duration-300
                    ${
                      selectedPost && selectedPost.id === post.id
                        ? "bg-gradient-to-r from-royal/20 to-black/60 border-l-2 border-l-royal"
                        : "hover:bg-black/50"
                    }`}
                  title={isCollapsed ? post.title : ""}
                >
                  <div
                    className={`${
                      isCollapsed ? "w-8 h-8" : "w-10 h-10"
                    } flex-shrink-0 rounded-md flex items-center justify-center ${
                      isCollapsed ? "" : "mr-3"
                    }
                      ${
                        selectedPost && selectedPost.id === post.id
                          ? "bg-royal/20"
                          : "bg-black/40"
                      }`}
                  >
                    {getPostIcon(post.category)}
                  </div>
                  {!isCollapsed && (
                    <span
                      className={`text-sm truncate flex-1 text-left ${
                        selectedPost && selectedPost.id === post.id
                          ? "text-royal-light"
                          : "text-white/80"
                      }`}
                    >
                      {post.title}
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Home button */}
          <div className="pt-4">
            <button
              onClick={handleClosePost}
              className={`w-full py-2 ${
                isCollapsed ? "px-0 justify-center" : "px-3"
              } rounded-lg flex items-center bg-black/40 text-white/70 hover:bg-royal/20 hover:text-white transition-all duration-200 border border-white/10 hover:border-royal/30`}
              title="Back to Blog Home"
            >
              <FaArrowLeft className={`w-3 h-3 ${isCollapsed ? "" : "mr-2"}`} />
              {!isCollapsed && <span className="text-sm">Back to Blog</span>}
            </button>
          </div>
        </div>

        {/* Resize handle */}
        <div
          className={`absolute top-0 bottom-0 -right-1 w-2 cursor-ew-resize hover:bg-royal/30 z-30 ${
            isCollapsed ? "hidden" : ""
          }`}
          onMouseDown={startResizing}
        ></div>

        {/* Tooltips container rendered via portal for better positioning */}
        {isBrowser &&
          hoveredPostId &&
          !isCollapsed &&
          !isMobile && // Don't show tooltips on mobile
          createPortal(
            <BlogPostTooltip
              post={filteredPosts.find((post) => post.id === hoveredPostId)}
              handlePostSelect={handlePostSelect}
              position={{ top: false, right: true }}
              tooltipPosition={{
                top: tooltipRect.top,
                left: tooltipRect.left + 5, // Add slight offset to avoid overlap
              }}
            />,
            document.body
          )}
      </motion.div>

      {/* Toggle button rendered completely outside the sidebar component via portal */}
      {isBrowser &&
        createPortal(
          <div
            className={`fixed z-[200] ${screenSize !== "lg" ? "hidden" : ""}`}
            style={{
              top: "50vh",
              // Use sidebarWidthState instead of sidebarWidth from props
              left: isCollapsed ? "60px" : `${sidebarWidthState}px`,
              transform: "translateY(-50%)",
              transition: "left 0.3s ease-out",
            }}
          >
            <button
              className="h-32 w-14 flex items-center justify-center bg-gradient-to-r from-black/90 to-royal/30 hover:to-royal/40 border-t border-r border-b border-royal/40 hover:border-royal/60 rounded-r-md transition-all duration-300"
              onClick={handleClosePost}
              style={{
                boxShadow: "0 0 20px rgba(0,0,0,0.6)",
              }}
            >
              <div className="flex items-center justify-center w-full h-full">
                <FaTimes size={24} className="text-royal-light" />
              </div>
            </button>
          </div>,
          document.body
        )}

      {/* Add a small floating button for mobile to expand sidebar temporarily */}
      {screenSize !== "lg" &&
        isBrowser &&
        createPortal(
          <div className="fixed z-[200] bottom-6 left-6">
            <button
              className="h-12 w-12 flex items-center justify-center bg-gradient-to-r from-black/90 to-royal/30 hover:to-royal/40 border border-royal/40 hover:border-royal/60 rounded-full transition-all duration-300"
              onClick={() => setIsCollapsed((prev) => !prev)}
              style={{
                boxShadow: "0 0 20px rgba(0,0,0,0.6)",
              }}
            >
              <div className="flex items-center justify-center w-full h-full">
                {isCollapsed ? (
                  <FaBars size={18} className="text-royal-light" />
                ) : (
                  <FaTimes size={18} className="text-royal-light" />
                )}
              </div>
            </button>
          </div>,
          document.body
        )}
    </>
  );
}
