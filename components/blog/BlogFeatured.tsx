import { motion } from "framer-motion";
import { FaCalendarAlt, FaArrowRight } from "react-icons/fa";
import { getCategoryIcon } from "./utils/categoryIcons";
import BlogImage from "./BlogImage"; // Import the BlogImage component
import { useMediaQuery } from "react-responsive"; // Import the useMediaQuery hook

export default function BlogFeatured({ posts = [], handlePostSelect }) {
  // Add a guard clause at the top
  if (!posts || !posts.length) {
    return (
      <div className="text-white/60 text-center py-10">
        No featured posts available
      </div>
    );
  }

  const featuredPost = posts[0]; // Assuming the first post is the featured one

  // Check if the screen size is mobile
  const isMobile = useMediaQuery({ maxWidth: 767 });

  return (
    <motion.div
      className="mb-16"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
    >
      {/* Added onClick handler to the entire container and cursor-pointer class */}
      <div className="featured-post-border-container">
        <div
          className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-black/40 to-navy/40 backdrop-blur-sm shadow-xl cursor-pointer hover:shadow-royal/10 transition-all duration-300"
          onClick={() => handlePostSelect(featuredPost)}
        >
          <div className="absolute inset-0 bg-gradient-to-br from-royal/10 to-transparent opacity-30"></div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* Image section with fallback icon */}
            <div className="relative h-64 lg:h-auto overflow-hidden bg-gradient-to-br from-black/80 to-navy/80">
              <BlogImage
                post={featuredPost}
                className="rounded-xl overflow-hidden"
                height={isMobile ? "200px" : "400px"}
              />

              <div className="absolute top-4 left-4">
                <span className="bg-royal px-3 py-1 text-xs uppercase font-semibold tracking-wider text-white rounded-full">
                  Featured
                </span>
              </div>

              <div className="absolute bottom-4 left-4">
                <span className="bg-black/60 backdrop-blur-sm px-3 py-1 text-xs uppercase font-medium tracking-wider text-white/90 rounded-full border border-white/10">
                  {featuredPost.category}
                </span>
              </div>
            </div>

            {/* Content section */}
            <div className="p-8 lg:p-10 flex flex-col justify-center">
              <div className="flex items-center text-sm text-white/70 mb-3">
                <FaCalendarAlt className="text-royal-light mr-2" />
                <span>{featuredPost.date}</span>
                <span className="px-2">•</span>
                <span>{featuredPost.readTime}</span>
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white mb-4 group-hover:text-royal-light transition-colors">
                {featuredPost.title}
              </h2>

              <p className="text-white/80 mb-6">{featuredPost.excerpt}</p>

              {/* 
                Keep the button but make it a div to prevent nested interactive elements 
                We've added the onClick handler to the entire card above
              */}
              <div className="inline-flex items-center text-royal-light group w-fit">
                Read Full Article
                <FaArrowRight className="ml-2 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}