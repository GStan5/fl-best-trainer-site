import Head from "next/head";
import React from "react";
import dynamic from "next/dynamic";
import ContactSection from "@/components/training/ContactSection";
import Layout from "@/components/shared/Layout";
import SEO from "@/components/shared/SEO";
import { getAllPosts } from "../utils/markdown";

const BlogSection = dynamic(() => import("../components/blog/BlogSection"), {
  loading: () => (
    <div className="animate-pulse h-96 w-full bg-black/20 rounded-xl"></div>
  ),
});

export default function Blog({ posts }) {
  // Enhanced schema for blog page that includes blog posts
  const schema = {
    "@context": "https://schema.org",
    "@type": "Blog",
    headline: "FL Best Trainer Blog - Fitness & Training Tips",
    description:
      "Expert fitness advice, workout tips, and training strategies from Southwest Florida's premier personal trainer.",
    publisher: {
      "@type": "Organization",
      name: "FL Best Trainer",
      logo: {
        "@type": "ImageObject",
        url: "https://flbesttrainer.com/images/logo.png",
      },
    },
    author: {
      "@type": "Person",
      name: "Gavin Stanifer",
      jobTitle: "NASM Certified Personal Trainer",
      url: "https://flbesttrainer.com/about",
    },
    blogPost: posts.slice(0, 10).map((post) => ({
      "@type": "BlogPosting",
      headline: post.title,
      description: post.excerpt || "",
      datePublished: post.date || new Date().toISOString(),
      author: {
        "@type": "Person",
        name: "Gavin Stanifer",
      },
      url: `https://flbesttrainer.com/blog/${post.slug}`,
    })),
  };

  return (
    <Layout>
      <SEO
        title="Fitness & Training Blog | FL Best Trainer | Southwest Florida"
        description="Expert fitness advice, workout tips, and training strategies from Southwest Florida's premier personal trainer. Learn about nutrition, exercise, and wellness."
        keywords="fitness blog, workout tips, personal training advice, Southwest Florida fitness, nutrition tips, strength training, wellness advice, exercise guides"
        url="/blog"
        ogImage="/images/blog-header.jpg"
        schema={schema}
        isArticle={false} // This is a blog index, not a single article
      />

      <main>
        <BlogSection posts={posts} />
        <ContactSection />
      </main>
    </Layout>
  );
}

// This function runs at build time in production and on each request in development
export async function getStaticProps() {
  // Get posts using the util function
  // The path is relative to the pages directory
  const posts = getAllPosts();

  return {
    props: {
      posts,
    },
  };
}
