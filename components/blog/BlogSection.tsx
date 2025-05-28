import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { blogPosts as defaultPosts } from "./data/blogPosts"; // Keep this as fallback
import { FaArrowLeft } from "react-icons/fa";

// Import sub-components
import BlogHeader from "./BlogHeader";
import BlogSearch from "./BlogSearch";
import BlogFeatured from "./BlogFeatured";
import BlogList from "./BlogList";
import BlogPagination from "./BlogPagination";
import BlogSidebar from "./BlogSidebar";
import BlogPostView from "./BlogPostView";

export default function BlogSection({ posts = defaultPosts }) {
  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState(null);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState("lg");
  const [isFocusMode, setIsFocusMode] = useState(false); // Add focus mode state
  const [isCollapsed, setIsCollapsed] = useState(screenSize !== "lg"); // Add isCollapsed state
  const [sidebarWidth, setSidebarWidth] = useState(240); // Add sidebarWidth state
  const blogContentRef = useRef(null);
  const blogSectionRef = useRef(null);

  // Set loaded state on mount
  useEffect(() => {
    setIsLoaded(true);
  }, []);

  // Detect mobile devices
  useEffect(() => {
    const checkIfMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };

    checkIfMobile();
    window.addEventListener("resize", checkIfMobile);
    return () => window.removeEventListener("resize", checkIfMobile);
  }, []);

  // Detect screen size
  useEffect(() => {
    const checkScreenSize = () => {
      const width = window.innerWidth;
      if (width < 640) setScreenSize("sm");
      else if (width < 1024) setScreenSize("md");
      else setScreenSize("lg");
    };

    checkScreenSize();
    window.addEventListener("resize", checkScreenSize);
    return () => window.removeEventListener("resize", checkScreenSize);
  }, []);

  // Manage automatic collapsing based on screen size
  useEffect(() => {
    // Automatically collapse on smaller screens
    if (screenSize !== "lg") {
      setIsCollapsed(true);
    }
  }, [screenSize]);

  // Get featured post
  const featuredPost = posts.find((post) => post.featured);

  // Filter posts based on category and search term
  const filteredPosts = posts.filter((post) => {
    const matchesCategory =
      activeCategory === "all" || post.category === activeCategory;
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch && !post.featured;
  });

  // Get unique categories for filter
  const categories = ["all", ...new Set(posts.map((post) => post.category))];

  // Handle selecting a post to read
  const handlePostSelect = (post) => {
    setSelectedPost(post);
    setSidebarCollapsed(false); // Keep sidebar expanded when selecting post

    // Scroll blog content to top when changing posts
    if (blogContentRef.current) {
      blogContentRef.current.scrollTop = 0;
    }
  };

  // Handle closing the selected post
  const handleClosePost = () => {
    setSelectedPost(null);
    setSidebarCollapsed(false);
  };

  // Handle escape key to close post
  useEffect(() => {
    const handleEscKey = (e) => {
      if (e.key === "Escape" && selectedPost) {
        handleClosePost();
      }
    };

    window.addEventListener("keydown", handleEscKey);
    return () => window.removeEventListener("keydown", handleEscKey);
  }, [selectedPost]);

  // Make sidebar width adjustable via CSS variable
  useEffect(() => {
    document.documentElement.style.setProperty(
      "--sidebar-width",
      `${sidebarWidth}px`
    );
  }, [sidebarWidth]);

  // Handle back to top for mobile
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle focus mode
  const toggleFocusMode = () => {
    setIsFocusMode((prev) => !prev);
  };

  return (
    <section
      ref={blogSectionRef}
      className="py-20 bg-gradient-to-b from-black to-navy relative"
    >
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal/50 to-transparent"></div>
      <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal/50 to-transparent"></div>

      {/* Glowing background elements */}
      <div className="absolute -top-40 left-1/4 w-[500px] h-[500px] bg-royal/5 rounded-full blur-[150px]"></div>
      <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-royal/5 rounded-full blur-[120px]"></div>

      {/* Redesigned layout with fixed sidebar */}
      <div className="relative">
        {/* Fixed sidebar when post is selected - always visible when scrolling */}
        {selectedPost && !isMobile && (
          <BlogSidebar
            selectedPost={selectedPost}
            categories={categories}
            filteredPosts={filteredPosts}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            handlePostSelect={handlePostSelect}
            handleClosePost={handleClosePost}
            sidebarCollapsed={isCollapsed}
            setSidebarCollapsed={setIsCollapsed}
            sidebarWidth={sidebarWidth} // Add this prop
            setSidebarWidth={setSidebarWidth} // Add this prop
            blogSectionRef={blogSectionRef}
            isMobile={isMobile}
            screenSize={screenSize}
          />
        )}

        {/* Main content area - update to account for fixed sidebar */}
        <div
          className="transition-all duration-300 w-full"
          style={{
            marginLeft:
              screenSize === "lg" && !isFocusMode
                ? isCollapsed
                  ? "60px"
                  : `${sidebarWidth}px`
                : "0",
            width:
              screenSize === "lg" && !isFocusMode
                ? isCollapsed
                  ? "calc(100% - 60px)"
                  : `calc(100% - ${sidebarWidth}px)`
                : "100%",
          }}
        >
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
            {isLoaded ? (
              <>
                {/* Blog list section */}
                {!selectedPost && (
                  <>
                    <BlogHeader />
                    <BlogSearch
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      categories={categories}
                      activeCategory={activeCategory}
                      setActiveCategory={setActiveCategory}
                    />
                    {featuredPost && (
                      <BlogFeatured
                        featuredPost={featuredPost}
                        handlePostSelect={handlePostSelect}
                      />
                    )}
                    <BlogList
                      filteredPosts={filteredPosts}
                      handlePostSelect={handlePostSelect}
                    />
                    {filteredPosts.length > 0 && <BlogPagination />}
                  </>
                )}

                {/* Blog post view centered in available space */}
                <AnimatePresence>
                  {selectedPost && (
                    <div className="flex justify-center w-full">
                      <BlogPostView
                        selectedPost={selectedPost}
                        handleClosePost={handleClosePost}
                        blogContentRef={blogContentRef}
                        toggleFocusMode={toggleFocusMode}
                        isFocusMode={isFocusMode}
                      />
                    </div>
                  )}
                </AnimatePresence>

                {/* Mobile back button at the top of blog post view */}
                {selectedPost && isMobile && (
                  <div className="fixed top-0 left-0 right-0 z-50 bg-black/80 backdrop-blur-md p-4 border-b border-white/10">
                    <button
                      onClick={handleClosePost}
                      className="flex items-center text-white/80 hover:text-white"
                    >
                      <FaArrowLeft className="mr-2" />
                      <span>Back to Blog</span>
                    </button>
                  </div>
                )}
              </>
            ) : (
              // Loading state
              <div className="flex justify-center items-center py-40">
                <div className="animate-spin w-12 h-12 border-4 border-royal border-t-transparent rounded-full"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
