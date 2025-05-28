import fs from "fs";
import path from "path";
import matter from "gray-matter";
const contentDirectory = path.join(process.cwd(), "content", "blog"); // Client-side compatible markdown utility
import { blogPosts } from "../components/blog/data/blogPosts";

/**
 * Get all blog posts
 * @returns {Array} Array of blog post objects
 */
export function getAllPosts() {
  return blogPosts;
}

/**
 * Get a specific blog post by ID
 * @param {string} id - The post ID to retrieve
 * @returns {Object|undefined} The post object if found, undefined otherwise
 */
export function getPostById(id) {
  return blogPosts.find((post) => post.id === id);
}
