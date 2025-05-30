import { motion } from "framer-motion";
import Image from "next/image";
import {
  FaCalendarAlt,
  FaTimes,
  FaExpand,
  FaColumns,
  FaTwitter,
  FaFacebook,
  FaLinkedin,
} from "react-icons/fa";
import { getCategoryIcon } from "./utils/categoryIcons";
import ReactMarkdown from "react-markdown";
import rehypeRaw from "rehype-raw";
import rehypeSanitize from "rehype-sanitize";
import remarkGfm from "remark-gfm";
import BlogImage from "./BlogImage"; // Import the BlogImage component
import Head from "next/head";
import { useEffect, useState } from "react";

export default function BlogPostView({
  selectedPost,
  handleClosePost,
  blogContentRef,
  toggleFocusMode,
  isFocusMode,
}) {
  return (
    <>
      <Head>
        {selectedPost && (
          <>
            <title>{selectedPost.title} | FL Best Trainer Blog</title>
            <meta name="description" content={selectedPost.excerpt} />
            <meta property="og:title" content={selectedPost.title} />
            <meta property="og:description" content={selectedPost.excerpt} />
            <meta property="og:type" content="article" />
            <meta
              property="article:published_time"
              content={selectedPost.dateISO || selectedPost.date}
            />
            <meta property="article:section" content={selectedPost.category} />
            {selectedPost.image && (
              <meta property="og:image" content={selectedPost.image} />
            )}
          </>
        )}
      </Head>
      <motion.div
        key={selectedPost.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 10 }}
        transition={{ duration: 0.25, ease: "easeOut" }}
        className={`w-full max-w-[1100px] bg-black/20 backdrop-blur-sm border border-white/5 rounded-xl overflow-hidden transition-all duration-300 mt-8 md:mt-10 lg:mt-12 ${
          isFocusMode ? "mx-auto" : "mx-auto"
        }`}
      >
        {/* Blog post header bar */}
        <div className="sticky top-0 z-10 bg-gradient-to-r from-black/80 to-navy/90 backdrop-blur-md border-b border-white/10 flex justify-between items-center py-3 px-4 sm:py-4 sm:px-6 lg:px-8">
          <h2 className="text-base sm:text-lg md:text-xl lg:text-2xl font-bold text-white truncate">
            {selectedPost.title}
          </h2>
          <div className="flex items-center gap-2">
            <button
              onClick={toggleFocusMode}
              className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/30 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/50 transition-colors"
              title={isFocusMode ? "Show Sidebar" : "Focus Mode"}
            >
              {isFocusMode ? (
                <FaColumns size={12} className="sm:hidden" />
              ) : (
                <FaExpand size={12} className="sm:hidden" />
              )}
              {isFocusMode ? (
                <FaColumns size={14} className="hidden sm:block" />
              ) : (
                <FaExpand size={14} className="hidden sm:block" />
              )}
            </button>
            <button
              onClick={handleClosePost}
              className="flex-shrink-0 w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-black/30 flex items-center justify-center text-white/80 hover:text-white hover:bg-black/50 transition-colors"
            >
              <FaTimes size={12} className="sm:hidden" />
              <FaTimes size={14} className="hidden sm:block" />
            </button>
          </div>
        </div>

        {/* Blog post content */}
        <div
          ref={blogContentRef}
          className="overflow-y-auto"
          style={{ maxHeight: "calc(100vh - 100px)" }}
        >
          {/* Featured image */}
          <div className="w-full h-[300px] sm:h-[400px] md:h-[500px] relative">
            <BlogImage post={selectedPost} height="100%" />
            <div className="absolute inset-0 bg-gradient-to-b from-transparent to-black/50"></div>
          </div>

          {/* Post header with meta */}
          <div className="px-4 sm:px-6 md:px-8 lg:px-12 py-8">
            <div className="flex flex-wrap items-center gap-4 text-sm text-white/60 mb-8">
              {/* Post date */}
              <div className="flex items-center">
                <FaCalendarAlt className="mr-2" size={14} />
                <span>{selectedPost.date}</span>
              </div>

              {/* Read time */}
              <div className="flex items-center">
                <span>·</span>
                <span className="ml-4">{selectedPost.readTime}</span>
              </div>

              {/* Category */}
              <div className="flex items-center ml-0 sm:ml-auto">
                <span className="bg-royal/20 text-royal-light px-2 py-0.5 rounded-full border border-royal/30">
                  {selectedPost.category}
                </span>
              </div>
            </div>

            {/* Post content - Updated to use Markdown */}
            <div className="prose prose-invert prose-royal max-w-none">
              <ReactMarkdown
                rehypePlugins={[rehypeRaw, rehypeSanitize]}
                remarkPlugins={[remarkGfm]}
                components={{
                  // Customize heading components
                  h1: ({ node, ...props }) => (
                    <h1
                      className="text-3xl font-bold mb-4 text-white"
                      {...props}
                    />
                  ),
                  h2: ({ node, ...props }) => (
                    <h2
                      className="text-2xl font-bold mt-8 mb-4 text-white/90"
                      {...props}
                    />
                  ),
                  h3: ({ node, ...props }) => (
                    <h3
                      className="text-xl font-bold mt-6 mb-3 text-white/90"
                      {...props}
                    />
                  ),
                  // Links
                  a: ({ node, ...props }) => (
                    <a
                      className="text-royal-light hover:text-royal hover:underline"
                      {...props}
                    />
                  ),
                  // Lists
                  ul: ({ node, ...props }) => (
                    <ul className="list-disc pl-6 mb-6" {...props} />
                  ),
                  ol: ({ node, ...props }) => (
                    <ol className="list-decimal pl-6 mb-6" {...props} />
                  ),
                  // Code blocks
                  code: ({ node, inline, ...props }) =>
                    inline ? (
                      <code
                        className="bg-black/50 text-royal-light px-1 py-0.5 rounded text-sm"
                        {...props}
                      />
                    ) : (
                      <pre className="bg-black/50 text-white p-4 rounded-lg mb-6 overflow-x-auto text-sm">
                        <code {...props} />
                      </pre>
                    ),
                  // Images
                  img: ({ node, ...props }) => (
                    <div className="my-6">
                      <img className="rounded-lg max-w-full" {...props} />
                    </div>
                  ),
                  // Block quotes
                  blockquote: ({ node, ...props }) => (
                    <blockquote
                      className="border-l-4 border-royal/50 pl-4 italic text-white/80 my-6"
                      {...props}
                    />
                  ),
                }}
              >
                {selectedPost.content}
              </ReactMarkdown>
            </div>

            {/* Social sharing buttons */}
            <div className="flex space-x-4 my-6">
              <button
                onClick={() =>
                  window.open(
                    `https://twitter.com/intent/tweet?text=${selectedPost.title}&url=${window.location.href}`,
                    "_blank"
                  )
                }
                className="p-2 rounded-full bg-black/20 hover:bg-[#1DA1F2] text-white/70 hover:text-white transition-all"
                aria-label="Share on Twitter"
              >
                <FaTwitter size={16} />
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://www.facebook.com/sharer/sharer.php?u=${window.location.href}`,
                    "_blank"
                  )
                }
                className="p-2 rounded-full bg-black/20 hover:bg-[#4267B2] text-white/70 hover:text-white transition-all"
                aria-label="Share on Facebook"
              >
                <FaFacebook size={16} />
              </button>
              <button
                onClick={() =>
                  window.open(
                    `https://www.linkedin.com/sharing/share-offsite/?url=${window.location.href}`,
                    "_blank"
                  )
                }
                className="p-2 rounded-full bg-black/20 hover:bg-[#0077b5] text-white/70 hover:text-white transition-all"
                aria-label="Share on LinkedIn"
              >
                <FaLinkedin size={16} />
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    </>
  );
}
