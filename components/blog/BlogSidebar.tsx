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
  FaHome, // Add this import for the home icon
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
  isMobile,
}) {
  // Don't immediately return null - let the component mount first
  // if (isMobile) return null;

  // This will clean up our issue with premature hiding
  const [shouldHide, setShouldHide] = useState(false);

  // Check if we should hide the sidebar based on isMobile prop
  useEffect(() => {
    // Short delay to allow component to mount and render
    const timer = setTimeout(() => {
      setShouldHide(isMobile);
    }, 50);

    return () => clearTimeout(timer);
  }, [isMobile]);

  // ========== STATE DECLARATIONS - ALL GO HERE FIRST ==========

  // Sidebar collapse state
  const [isCollapsed, setIsCollapsed] = useState(sidebarCollapsed);

  // Sidebar width state
  const [sidebarWidthState, setSidebarWidthState] = useState(
    sidebarWidth || 240
  );

  // Tooltip states
  const [hoveredPostId, setHoveredPostId] = useState(null);
  const [tooltipRect, setTooltipRect] = useState({ top: 0, left: 0 });
  const [tooltipPosition, setTooltipPosition] = useState({
    top: false,
    right: true,
  });

  // Other states
  const [windowWidth, setWindowWidth] = useState(
    typeof window !== "undefined" ? window.innerWidth : 1200
  );
  const [isResizing, setIsResizing] = useState(false);
  const [isBrowser, setIsBrowser] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  // Refs
  const hoveredItemRefs = useRef({});
  const sidebarRef = useRef(null);

  // ========== EFFECTS - COME AFTER ALL STATE DECLARATIONS ==========

  // Set isBrowser to true after component mounts
  useEffect(() => {
    setIsBrowser(true);

    if (typeof window !== "undefined") {
      // Check localStorage for saved collapse state
      const savedState = localStorage.getItem("blogSidebarCollapsed");
      if (savedState !== null) {
        setIsCollapsed(JSON.parse(savedState));
      }

      // Check localStorage for saved width
      const savedWidth = localStorage.getItem("blogSidebarWidth");
      if (savedWidth !== null) {
        setSidebarWidthState(parseInt(savedWidth));
      }
    }
  }, []);

  // Save to localStorage when state changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("blogSidebarCollapsed", JSON.stringify(isCollapsed));
    }
  }, [isCollapsed]);

  // Sync with parent component's state
  useEffect(() => {
    setIsCollapsed(sidebarCollapsed);
  }, [sidebarCollapsed]);

  // Update parent component when local state changes
  useEffect(() => {
    setSidebarCollapsed(isCollapsed);
  }, [isCollapsed]);

  // Save sidebar width to localStorage
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("blogSidebarWidth", sidebarWidthState.toString());
    }
  }, [sidebarWidthState]);

  // Update window width on resize
  useEffect(() => {
    const handleResize = () => {
      setWindowWidth(window.innerWidth);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Fix tooltip calculation
  useEffect(() => {
    if (
      hoveredPostId &&
      hoveredItemRefs.current &&
      hoveredItemRefs.current[hoveredPostId] &&
      sidebarRef.current
    ) {
      const itemRect = hoveredItemRefs.current[hoveredPostId].getBoundingClientRect();
      const sidebarRect = sidebarRef.current.getBoundingClientRect();

      // Position at vertical center of hovered item
      const tooltipTop = itemRect.top + itemRect.height / 2;

      // Position to the right of sidebar with a small gap
      const tooltipLeft = sidebarRect.right + 15;

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

  // Add event listeners for resizing
  useEffect(() => {
    const handleResize = (e) => {
      if (isResizing) {
        const newWidth = e.clientX;
        if (newWidth >= 180 && newWidth <= 400) {
          setSidebarWidthState(newWidth);
        }
      }
    };

    const handleResizeEnd = () => {
      setIsResizing(false);
    };

    window.addEventListener("mousemove", handleResize);
    window.addEventListener("mouseup", handleResizeEnd);

    return () => {
      window.removeEventListener("mousemove", handleResize);
      window.removeEventListener("mouseup", handleResizeEnd);
    };
  }, [isResizing]);

  // Update CSS variable for sidebar width
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-current-width",
      `${isCollapsed ? 60 : sidebarWidthState}px`
    );
  }, [isCollapsed, sidebarWidthState]);

  // ========== HANDLERS ==========

  // Toggle sidebar collapse
  const toggleSidebar = () => {
    setIsCollapsed(!isCollapsed);
  };

  // Start resizing
  const startResizing = (e) => {
    e.preventDefault();
    setIsResizing(true);
  };

  // Handle search
  const handleSearch = () => {
    // Implementation here
    console.log("Search term:", searchTerm);
  };

  // Get post icon
  const getPostIcon = (category) => {
    return getCategoryIcon(category, 16);
  };

  // ========== RENDER ==========
  return (
    <>
      <motion.div
        ref={sidebarRef}
        style={{
          width: isCollapsed ? "60px" : sidebarWidthState,
          overflowX: "visible",
          transition: "width 0.3s ease-out",
          display: shouldHide ? "none" : "block",
        }}
        initial={{ x: 0, opacity: 1 }} // Use simpler initial values
        animate={{ x: 0, opacity: 1 }}
        exit={{ x: -20, opacity: 0 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`h-screen bg-black/60 backdrop-blur-lg border-r border-white/10 z-40 transition-all duration-300 ease-in-out overflow-y-auto overflow-x-visible fixed top-0 left-0 ${
          isMobile ? "border-r-2 border-royal/20" : ""
        }`}
      >
        {/* Sidebar content */}
        <div className="flex flex-col h-full py-6 px-4 pt-24 overflow-hidden">
          {/* Add sidebar toggle at the top */}
          <div
            className={`mb-6 flex ${
              isCollapsed ? "justify-center" : "justify-between"
            } items-center`}
          >
            {!isCollapsed && (
              <h3 className="text-white font-semibold">Blog Navigation</h3>
            )}
            <button
              onClick={() => setIsCollapsed(!isCollapsed)}
              className="w-8 h-8 rounded-full bg-black/40 hover:bg-royal/20 flex items-center justify-center text-white/80 hover:text-white transition-all duration-300"
              title={isCollapsed ? "Expand Sidebar" : "Collapse Sidebar"}
            >
              {isCollapsed ? (
                <FaChevronRight size={14} />
              ) : (
                <FaChevronLeft size={14} />
              )}
            </button>
          </div>

          {/* Add a divider after the toggle button */}
          <div className="h-px bg-white/10 w-full mb-6"></div>

          {/* Search input - only show when sidebar is expanded */}
          {!isCollapsed && (
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
          )}

          {/* Show search icon button in mini sidebar */}
          {isCollapsed && (
            <div className="flex justify-center mb-6">
              <button
                onClick={() => setSearchTerm("")}
                className="w-8 h-8 rounded-full bg-black/40 hover:bg-royal/20 flex items-center justify-center text-white/70 hover:text-white transition-colors"
                title="Search Posts"
              >
                <FaSearch size={14} />
              </button>
            </div>
          )}

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

              // Add special color handling for "all" category
              const iconColorClass =
                category === "all"
                  ? "text-royal-light" // Always blue for "all" category
                  : activeCategory === category
                  ? "text-white"
                  : "text-white/80 group-hover:text-white";

              return (
                <button
                  key={category}
                  onClick={() => setActiveCategory(category)}
                  className={`w-full flex items-center py-2 ${
                    isCollapsed ? "px-0 justify-center" : "px-3"
                  } rounded-lg ${
                    isCollapsed ? "rounded-full" : ""
                  } transition-all group ${
                    activeCategory === category
                      ? "bg-royal text-white" // Keep active state consistent
                      : `hover:bg-white/5 hover:text-white ${
                          category !== "all" && !isCollapsed
                            ? categoryClasses.replace("bg-", "hover:bg-")
                            : ""
                        }`
                  }`}
                  title={
                    isCollapsed
                      ? category === "all"
                        ? "All Posts"
                        : category
                      : ""
                  }
                >
                  {/* Show category icon with improved visibility */}
                  <span
                    className={`${isCollapsed ? "" : "mr-3"} ${iconColorClass}`}
                  >
                    {category === "all" ? (
                      <FaListUl size={14} /> // Changed from FaSearch to FaListUl for better representation
                    ) : (
                      getCategoryIcon(category, 14)
                    )}
                  </span>

                  {/* Only show text when sidebar is expanded - improved visibility */}
                  {!isCollapsed && (
                    <span
                      className={`capitalize ${
                        category === "all"
                          ? "text-white font-medium" // Change from "text-royal-light" to "text-white"
                          : "text-white/90"
                      }`}
                    >
                      {category === "all" ? "All Posts" : category}
                    </span>
                  )}
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
                  } rounded-lg transition-all duration-300 group
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
                          : "bg-black/40 group-hover:bg-black/60"
                      }`}
                  >
                    {/* Improve icon visibility */}
                    <span
                      className={
                        selectedPost && selectedPost.id === post.id
                          ? "text-royal-light"
                          : "text-white/80 group-hover:text-royal-light"
                      }
                    >
                      {getPostIcon(post.category)}
                    </span>
                  </div>
                  {!isCollapsed && (
                    <span
                      className={`text-sm truncate flex-1 text-left ${
                        selectedPost && selectedPost.id === post.id
                          ? "text-royal-light"
                          : "text-white/80 group-hover:text-white"
                      }`}
                    >
                      {post.title}
                    </span>
                  )}
                </button>
              </div>
            ))}
          </div>

          {/* Footer buttons section */}
          <div className="pt-4 flex flex-col gap-2">
            {/* Home button - Always show this */}
            <button
              onClick={() => {
                // Clear selected post but keep sidebar open
                handleClosePost();
                // Ensure sidebar remains visible
                setIsCollapsed(false);
              }}
              className={`w-full py-2 ${
                isCollapsed ? "px-0 justify-center" : "px-3"
              } rounded-lg flex items-center bg-black/40 text-white/70 hover:bg-royal/20 hover:text-white transition-all duration-200 border border-white/10 hover:border-royal/30`}
              title="Blog Home"
            >
              <FaHome className={`w-3 h-3 ${isCollapsed ? "" : "mr-2"}`} />
              {!isCollapsed && <span className="text-sm">Blog Home</span>}
            </button>

            {/* Back button - Only show when post is selected */}
            {selectedPost && (
              <button
                onClick={handleClosePost}
                className={`w-full py-2 ${
                  isCollapsed ? "px-0 justify-center" : "px-3"
                } rounded-lg flex items-center bg-black/40 text-white/70 hover:bg-royal/20 hover:text-white transition-all duration-200 border border-white/10 hover:border-royal/30`}
                title="Back to Blog Home"
              >
                <FaArrowLeft className={`w-3 h-3 ${isCollapsed ? "" : "mr-2"}`} />
                {!isCollapsed && <span className="text-sm">Close Post</span>}
              </button>
            )}
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
              left: isCollapsed ? "60px" : `${sidebarWidthState}px`,
              transform: "translateY(-50%)",
              transition: "left 0.3s ease-out",
            }}
          >
            <button
              className="h-32 w-14 flex items-center justify-center bg-gradient-to-r from-black/90 to-royal/30 hover:to-royal/40 border-t border-r border-b border-royal/40 hover:border-royal/60 rounded-r-md transition-all duration-300"
              onClick={toggleSidebar}
              style={{
                boxShadow: "0 0 20px rgba(0,0,0,0.6)",
              }}
            >
              <div className="flex items-center justify-center w-full h-full">
                {isCollapsed ? (
                  <FaChevronRight size={24} className="text-royal-light" />
                ) : (
                  <FaChevronLeft size={24} className="text-royal-light" />
                )}
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
