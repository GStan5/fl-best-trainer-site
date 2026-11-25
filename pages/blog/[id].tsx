import Head from "next/head";
import { useRef, useState } from "react";
import { useRouter } from "next/router";
import Layout from "@/components/shared/Layout";
import BlogPostView from "@/components/blog/BlogPostView";
import { getAllPosts, getPostById } from "../../utils/markdown";

const SITE = "https://www.flbesttrainer.com";

function absoluteImage(image) {
  if (!image) return undefined;
  return image.startsWith("http") ? image : `${SITE}${image}`;
}

// One real page per blog post, so each post has its own URL Google can
// index. The body is server-rendered here (no on-demand fetch), with
// Article schema and a canonical URL. The /blog list still opens posts
// in-page; these pages are what search engines and shared links land on.
export default function BlogPostPage({ post }) {
  const router = useRouter();
  const blogContentRef = useRef(null);
  const [isFocusMode, setIsFocusMode] = useState(false);

  const postUrl = `${SITE}/blog/${post.id}`;
  const parsedDate = new Date(post.date);
  const dateISO = isNaN(parsedDate.getTime())
    ? undefined
    : parsedDate.toISOString();
  const imageUrl = absoluteImage(post.image);

  const schema = {
    "@context": "https://schema.org",
    "@type": "Article",
    headline: post.title,
    description: post.excerpt || "",
    ...(imageUrl ? { image: imageUrl } : {}),
    author: {
      "@type": "Person",
      name: "Gavin Stanifer",
      url: `${SITE}/about`,
      jobTitle: "NASM Certified Personal Trainer",
      knowsAbout: [
        "Strength training for adults over 50",
        "Balance training",
        "Bone density",
        "Corrective exercise",
      ],
    },
    publisher: {
      "@type": "Organization",
      name: "FL Best Trainer",
      logo: {
        "@type": "ImageObject",
        url: `${SITE}/images/logo.png`,
      },
    },
    ...(dateISO ? { datePublished: dateISO } : {}),
    // Posts carry no modified date, so dateModified equals datePublished.
    ...(dateISO ? { dateModified: dateISO } : {}),
    mainEntityOfPage: {
      "@type": "WebPage",
      "@id": postUrl,
    },
  };

  return (
    <Layout>
      <Head>
        <link rel="canonical" href={postUrl} />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
        />
      </Head>

      <main>
        <section className="pt-32 pb-20 bg-gradient-to-b from-black to-navy relative">
          <div className="container px-4 sm:px-6 lg:px-8 mx-auto">
            <BlogPostView
              selectedPost={post}
              handleClosePost={() => router.push("/blog")}
              blogContentRef={blogContentRef}
              toggleFocusMode={() => setIsFocusMode((v) => !v)}
              isFocusMode={isFocusMode}
              standalone
            />
          </div>
        </section>
      </main>
    </Layout>
  );
}

export async function getStaticPaths() {
  const paths = getAllPosts().map((post) => ({
    params: { id: post.id },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params }) {
  const post = getPostById(params.id);

  if (!post) {
    return { notFound: true };
  }

  // Attach an ISO published date so the article meta in BlogPostView is a
  // real ISO value, not the display string.
  const parsedDate = new Date(post.date);
  const dateISO = isNaN(parsedDate.getTime())
    ? undefined
    : parsedDate.toISOString();

  return {
    props: {
      post: dateISO ? { ...post, dateISO } : post,
    },
  };
}
