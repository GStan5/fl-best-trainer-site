import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useRef, useEffect } from "react";
import { FaArrowLeft } from "react-icons/fa";

// Import sub-components
import BlogHeader from "./BlogHeader";
import SeriesStrip from "./SeriesStrip";
import BlogSearch from "./BlogSearch";
import BlogFeatured from "./BlogFeatured";
import BlogList from "./BlogList";
import BlogPagination from "./BlogPagination";
import BlogSidebar from "./BlogSidebar";
import BlogPostView from "./BlogPostView";
import BackToTop from "./BackToTop";
import ReadingProgress from "./ReadingProgress";
import EmptyState from "./EmptyState";

export default function BlogSection({ posts = [] }) {
  // Ensure posts is always an array. Posts arrive as summaries (no bodies)
  // from getStaticProps; bodies load on demand when a post opens. No
  // fallback import of the post data here, so bodies stay out of the
  // client bundle entirely.
  const safePosts = Array.isArray(posts) ? posts : [];

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
  // Starts null so the first client render matches the server render; a
  // previously open post is restored in the mount effect below.
  const [selectedPost, setSelectedPost] = useState(null);
  const [postLoadError, setPostLoadError] = useState(false);
  const loadRequestRef = useRef(0);
  const [isClientSide, setIsClientSide] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [screenSize, setScreenSize] = useState("lg");
  const [isFocusMode, setIsFocusMode] = useState(false); // Add focus mode state
  const [isCollapsed, setIsCollapsed] = useState(screenSize !== "lg"); // Add isCollapsed state
  const blogContentRef = useRef(null);
  const blogSectionRef = useRef(null);

  // Fetch a post's full body and swap it in once loaded. Stale responses
  // (reader picked another post meanwhile) are ignored via the request id.
  const loadFullPost = (post) => {
    const requestId = ++loadRequestRef.current;
    fetch(`/api/blog/${post.id}`)
      .then((res) => {
        if (!res.ok) throw new Error("Post not found");
        return res.json();
      })
      .then((fullPost) => {
        if (loadRequestRef.current === requestId) {
          setSelectedPost(fullPost);
        }
      })
      .catch(() => {
        if (loadRequestRef.current === requestId) {
          setPostLoadError(true);
        }
      });
  };

  // On mount: mark client-side (sidebar renders after this) and restore a
  // previously open post, fetching its body if the saved copy has none.
  useEffect(() => {
    setIsClientSide(true);

    if (typeof window !== "undefined") {
      const savedPost = localStorage.getItem("selectedBlogPost");
      if (savedPost) {
        try {
          const parsed = JSON.parse(savedPost);
          if (parsed && parsed.id) {
            if (parsed.content) {
              setSelectedPost(parsed);
            } else {
              setSelectedPost(parsed);
              loadFullPost(parsed);
            }
          }
        } catch (e) {
          console.error("Error parsing saved post:", e);
        }
      }
    }
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
  const featuredPost = safePosts.find((post) => post.featured);
  const featuredPosts = safePosts.filter((post) => post.featured);

  // Get series posts (newest first, matching array order)
  const seriesPosts = safePosts.filter((post) => post.series);

  // Filter posts based on category and search term
  const filteredPosts = safePosts.filter((post) => {
    const matchesCategory =
      activeCategory === "all" ||
      post.category?.toLowerCase() === activeCategory.toLowerCase();
    const matchesSearch =
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase());

    return matchesCategory && matchesSearch;
  });

  // Get unique categories for filter
  const categories = [
    "all",
    ...Array.from(new Set(safePosts.map((post) => post.category))),
  ];

  // Handle selecting a post to read
  const handlePostSelect = (post) => {
    setPostLoadError(false);
    // Invalidate any in-flight body load from a previous selection.
    loadRequestRef.current += 1;

    if (post.content) {
      setSelectedPost(post);
    } else {
      // Show the post view immediately; the body loads in a moment.
      setSelectedPost(post);
      loadFullPost(post);
    }
    setSidebarCollapsed(false); // Keep sidebar expanded when selecting post

    // Scroll blog content to top when changing posts
    if (blogContentRef.current) {
      blogContentRef.current.scrollTop = 0;
    }
  };

  // Handle closing the selected post
  const handleClosePost = () => {
    setSelectedPost(null);
    setPostLoadError(false);
    // Invalidate any in-flight body load for the closed post.
    loadRequestRef.current += 1;
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

  // Handle clearing all filters
  const handleClearFilters = () => {
    setSearchTerm("");
    setActiveCategory("all");
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

  // Effect to set client side state (already handled above)
  // useEffect(() => {
  //   setIsClientSide(true);
  // }, []);

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
            <>
                {!selectedPost ? (
                  <>
                    <BlogHeader totalPosts={safePosts.length} />
                    <div className="mb-6 -mt-2">
                      <a
                        href="/blog/start-here"
                        className="text-royal-light hover:text-white text-sm font-medium"
                      >
                        New here? Start here — posts grouped by topic
                      </a>
                    </div>
                    <BlogSearch
                      searchTerm={searchTerm}
                      setSearchTerm={setSearchTerm}
                      categories={categories}
                      activeCategory={activeCategory}
                      setActiveCategory={setActiveCategory}
                      totalResults={filteredPosts.length}
                    />

                    {/* New-series strip: introduces The Daily Rep + latest post */}
                    {seriesPosts.length > 0 && (
                      <SeriesStrip
                        latestPost={seriesPosts[0]}
                        count={seriesPosts.length}
                        onSelect={handlePostSelect}
                      />
                    )}

                    {/* Show featured posts at the top only when not viewing "all" or "featured" category */}
                    {featuredPosts.length > 0 &&
                      activeCategory !== "featured" &&
                      activeCategory !== "all" && (
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
                            : `${
                                activeCategory.charAt(0).toUpperCase() +
                                activeCategory.slice(1)
                              } Posts`}
                        </h2>
                        {filteredPosts.length > 0 ? (
                          <BlogList
                            filteredPosts={filteredPosts}
                            handlePostSelect={handlePostSelect}
                          />
                        ) : (
                          <EmptyState
                            searchTerm={searchTerm}
                            activeCategory={activeCategory}
                            onClearFilters={handleClearFilters}
                          />
                        )}
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
                    loadError={postLoadError}
                  />
                )}
            </>
          </div>
        </div>
      </div>

      {/* Reading Progress Bar */}
      <ReadingProgress />

      {/* Back to Top Button */}
      <BackToTop />
    </section>
  );
}
