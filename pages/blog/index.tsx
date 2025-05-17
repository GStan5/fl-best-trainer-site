import Head from 'next/head';
import Layout from '../../components/Layout';
import Link from 'next/link';
import { blogPosts } from '../../lib/blogPosts';

export default function BlogIndex() {
  return (
    <Layout>
      <Head>
        <title>Blog | FL Best Trainer</title>
      </Head>
      <div className="max-w-3xl mx-auto px-4 py-10">
        <h1 className="text-3xl font-bold text-blue-900 mb-6">Fitness Blog</h1>
        <ul className="space-y-6">
          {blogPosts.map((post) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`} className="text-xl font-semibold text-blue-800 hover:underline">
                {post.title}
              </Link>
              <p className="text-sm text-gray-600 mt-1">{post.summary}</p>
            </li>
          ))}
        </ul>
      </div>
    </Layout>
  );
}