import Head from "next/head";
import React from "react";
import BlogSection from "../components/blog/BlogSection";
import ContactSection from "@/components/training/ContactSection";
import Layout from "@/components/shared/Layout";
import { getAllPosts } from "../utils/markdown";

export default function Blog({ posts }) {
  return (
    <Layout>
      <Head>
        <title>Fitness Blog | In-Home Personal Trainer</title>
        <meta
          name="description"
          content="Explore fitness tips, workout advice, and health insights from certified personal trainer Gavin Stanifer."
        />
      </Head>

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
