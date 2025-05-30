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
  // Initialize state with localStorage values if available
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => {
    // Only run on client side
    if (typeof window !== "undefined") {
      const savedState = localStorage.getItem("blogSidebarCollapsed");
      if (savedState !== null) {
        return JSON.parse(savedState);
      }
    }
    return false; // Default: show sidebar expanded
  });

  // Initialize sidebar width from localStorage or default
  const [sidebarWidth, setSidebarWidth] = useState(() => {
    if (typeof window !== "undefined") {
      const savedWidth = localStorage.getItem("blogSidebarWidth");
      if (savedWidth !== null) {
        return parseInt(savedWidth);
      }
    }
    return 240; // Default width
  });

  const [activeCategory, setActiveCategory] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedPost, setSelectedPost] = useState(() => {
    // Check if we previously had a selected post (optional)
    if (typeof window !== "undefined") {
      const savedPost = localStorage.getItem("selectedBlogPost");
      if (savedPost) {
        try {
          return JSON.parse(savedPost);
        } catch (e) {
          console.error("Error parsing saved post:", e);
        }
      }
    }
    return null; // Default to null if no post was saved
  });
  const [isLoaded, setIsLoaded] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState("lg");
  const [isFocusMode, setIsFocusMode] = useState(false); // Add focus mode state
  const [isCollapsed, setIsCollapsed] = useState(screenSize !== "lg"); // Add isCollapsed state
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
    // Don't collapse sidebar when closing a post
    // setSidebarCollapsed(true); // Remove or comment out this line

    // If we're in focus mode, exit it
    if (isFocusMode) {
      setIsFocusMode(false);
    }

    // Remove from localStorage
    if (typeof window !== "undefined") {
      localStorage.removeItem("selectedBlogPost");
    }
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

  // Add this effect to ensure sidebar is visible on page load for desktop
  useEffect(() => {
    // Run only on client side
    if (typeof window !== "undefined") {
      // Check if screen is large enough for sidebar
      const isLargeScreen = window.innerWidth >= 1024; // lg breakpoint

      if (isLargeScreen) {
        // Get saved state or default to expanded
        const savedState = localStorage.getItem("blogSidebarCollapsed");
        const shouldBeCollapsed =
          savedState !== null ? JSON.parse(savedState) : false;

        // Update state to match saved preference
        setSidebarCollapsed(shouldBeCollapsed);
      } else {
        // On smaller screens, always collapse
        setSidebarCollapsed(true);
      }
    }
  }, []); // Empty dependency array = run once on mount

  // Ensure sidebar is visible initially for desktop users
  useEffect(() => {
    // Only run after initial mount, in the browser
    if (typeof window !== "undefined") {
      // Check if we're on desktop
      const isDesktop = window.innerWidth >= 1024;

      // If we're on desktop and have a selected post, show sidebar
      if (isDesktop && selectedPost) {
        // Force sidebar visibility
        setSidebarCollapsed(false);

        // If localStorage has a saved state, respect it after a short delay
        const savedState = localStorage.getItem("blogSidebarCollapsed");
        if (savedState) {
          setTimeout(() => {
            setSidebarCollapsed(JSON.parse(savedState));
          }, 100);
        }
      }
    }
  }, [selectedPost]); // Only run when selectedPost changes

  // Handle back to top for mobile
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // Toggle focus mode
  const toggleFocusMode = () => {
    setIsFocusMode((prev) => !prev);
  };

  // Save selected post when it changes
  useEffect(() => {
    if (typeof window !== "undefined" && selectedPost) {
      localStorage.setItem("selectedBlogPost", JSON.stringify(selectedPost));
    }
  }, [selectedPost]);

  // State to track if we're on the client side
  const [isClientSide, setIsClientSide] = useState(false);

  // Effect to set client side state
  useEffect(() => {
    setIsClientSide(true);
  }, []);

  // Update the blog content area to include featured posts
  const featuredPosts = posts.filter((post) => post && post.featured);

  return (
    <section
      ref={blogSectionRef}
      className="pt-32 pb-20 bg-gradient-to-b from-black to-navy relative" // Increase pt-20 to pt-32
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
        {/* Fixed sidebar - always visible on desktop when client-side has loaded */}
        {isClientSide && !isMobile && (
          <BlogSidebar
            selectedPost={selectedPost}
            categories={categories}
            filteredPosts={filteredPosts}
            activeCategory={activeCategory}
            setActiveCategory={setActiveCategory}
            handlePostSelect={handlePostSelect}
            handleClosePost={handleClosePost}
            sidebarCollapsed={sidebarCollapsed}
            setSidebarCollapsed={setSidebarCollapsed}
            sidebarWidth={sidebarWidth}
            setSidebarWidth={setSidebarWidth}
            screenSize={screenSize}
            blogSectionRef={blogSectionRef}
            isMobile={isMobile}
          />
        )}

        {/* Main content area - REMOVED adjust for sidebar */}
        <div className="transition-all duration-300 w-full">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
            {isLoaded ? (
              <>
                {!selectedPost ? (
                  <>
                    <BlogHeader />
                    <BlogSearch
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      categories={categories}
                      activeCategory={activeCategory}
                      setActiveCategory={setActiveCategory}
                    />

                    {/* Always show featured posts at the top regardless of category */}
                    {featuredPosts.length > 0 && activeCategory !== "featured" && (
                      <div className="mb-12">
                        <h2 className="text-2xl font-bold text-white mb-6">
                          Featured
                        </h2>
                        <BlogFeatured
                          posts={featuredPosts}
                          handlePostSelect={handlePostSelect}
                        />
                      </div>
                    )}

                    {/* Then show filtered posts based on active category */}
                    {activeCategory === "featured" ? (
                      <BlogFeatured
                        posts={featuredPosts}
                        handlePostSelect={handlePostSelect}
                      />
                    ) : (
                      <div className="mt-8">
                        <h2 className="text-2xl font-bold text-white mb-6">
                          {activeCategory === "all"
                            ? "All Posts"
                            : `${activeCategory.charAt(0).toUpperCase() + activeCategory.slice(1)} Posts`}
                        </h2>
                        <BlogList
                          filteredPosts={filteredPosts}
                          handlePostSelect={handlePostSelect}
                        />
                      </div>
                    )}
                  </>
                ) : (
                  <BlogPostView
                    selectedPost={selectedPost}
                    handleClosePost={handleClosePost}
                    blogContentRef={blogContentRef}
                    toggleFocusMode={toggleFocusMode}
                    isFocusMode={isFocusMode}
                  />
                )}
              </>
            ) : (
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
