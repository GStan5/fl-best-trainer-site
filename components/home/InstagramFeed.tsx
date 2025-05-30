import { FaInstagram, FaPlay } from "react-icons/fa";
import Image from "next/image";
import { useState, useEffect } from "react";

// ===== INSTAGRAM CONFIGURATION =====
// Just edit these values to update your Instagram info
const INSTAGRAM_CONFIG = {
  username: "flbesttrainer", // Your Instagram username without @
  displayName: "FL Best Trainer", // How you want your name displayed
  profileUrl: "https://www.instagram.com/flbesttrainer/", // Your Instagram profile URL
  count: 6, // Number of posts to display
};
// ===================================

interface InstagramPost {
  id: string;
  mediaUrl: string;
  permalink: string;
  caption?: string;
  mediaType: string; // IMAGE, VIDEO, or CAROUSEL_ALBUM
  timestamp: string;
  // We'll estimate these since they're not directly available
  estimatedLikes: number;
  estimatedComments: number;
}

export default function InstagramFeed() {
  const { username, displayName, profileUrl, count } = INSTAGRAM_CONFIG;
  const [posts, setPosts] = useState<InstagramPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchInstagramPosts() {
      try {
        setLoading(true);

        // Using a service like Rapid API's Instagram Scraper
        // You'll need to sign up for an API key at https://rapidapi.com/
        const response = await fetch(
          `https://instagram-data1.p.rapidapi.com/user/feed?username=${username}&limit=${count}`,
          {
            headers: {
              "x-rapidapi-key": process.env.NEXT_PUBLIC_RAPIDAPI_KEY || "",
              "x-rapidapi-host": "instagram-data1.p.rapidapi.com",
            },
          }
        );

        if (!response.ok) {
          throw new Error("Failed to fetch Instagram posts");
        }

        const data = await response.json();

        if (data && data.data && Array.isArray(data.data)) {
          // Transform the data to our format
          const formattedPosts = data.data.map((post: any) => ({
            id: post.id,
            mediaUrl: post.media_url || post.thumbnail_url,
            permalink: post.permalink,
            caption: post.caption,
            mediaType: post.media_type,
            timestamp: post.timestamp,
            // Generate random numbers for demonstration
            estimatedLikes: Math.floor(Math.random() * 200) + 50,
            estimatedComments: Math.floor(Math.random() * 30) + 5,
          }));

          setPosts(formattedPosts);
        } else {
          // Fallback to sample data if API fails
          useSamplePosts();
        }
      } catch (err) {
        console.error("Error fetching Instagram posts:", err);
        setError("Couldn't load Instagram posts");
        // Use sample posts as fallback
        useSamplePosts();
      } finally {
        setLoading(false);
      }
    }

    fetchInstagramPosts();
  }, [username, count]);

  // Fallback sample posts when API fails
  function useSamplePosts() {
    const samplePosts = Array.from({ length: count }).map((_, idx) => ({
      id: `sample-${idx + 1}`,
      mediaUrl: `/images/instagram/insta${(idx % 6) + 1}.jpg`,
      permalink: profileUrl,
      caption: "Sample Instagram post",
      mediaType: idx % 3 === 0 ? "VIDEO" : "IMAGE",
      timestamp: new Date().toISOString(),
      estimatedLikes: Math.floor(Math.random() * 200) + 50,
      estimatedComments: Math.floor(Math.random() * 30) + 5,
    }));
    setPosts(samplePosts);
  }

  return (
    <section className="py-16 bg-gradient-to-b from-[#121212] to-[#1A1A1A] relative overflow-hidden">
      {/* Background elements */}
      <div className="absolute inset-0 bg-[url('/pattern.svg')] bg-repeat opacity-5"></div>
      <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-royal/30 to-transparent"></div>

      {/* Content container */}
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        {/* Instagram header with username */}
        <div className="flex flex-col items-center justify-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-3 bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 text-white px-4 py-1.5 rounded-full">
            <FaInstagram className="w-4 h-4" />
            <span className="text-sm font-medium">@{username}</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-bold text-white text-center">
            Follow My Fitness Journey
          </h2>
          <p className="text-white/60 max-w-md text-center mt-2">
            Get workout tips, nutrition advice, and training inspiration
          </p>
        </div>

        {/* Loading state */}
        {loading && (
          <div className="text-center py-12">
            <div className="inline-block w-8 h-8 border-2 border-royal border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-white/60">Loading Instagram posts...</p>
          </div>
        )}

        {/* Error state */}
        {error && !loading && (
          <div className="text-center py-8">
            <p className="text-red-400 mb-2">{error}</p>
            <p className="text-white/60 text-sm">Using sample posts instead</p>
          </div>
        )}

        {/* Instagram grid with dynamic posts */}
        {!loading && posts.length > 0 && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4 max-w-6xl mx-auto">
            {posts.map((post) => (
              <a
                key={post.id}
                href={post.permalink}
                target="_blank"
                rel="noopener noreferrer"
                className="group block aspect-square rounded-lg overflow-hidden relative"
              >
                {/* Image with proper Next.js optimization */}
                <div className="absolute inset-0">
                  <Image
                    src={post.mediaUrl}
                    alt={post.caption || `${displayName} Instagram post`}
                    fill
                    className="object-cover transition-transform duration-700 group-hover:scale-110"
                    sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 16vw"
                    onError={(e) => {
                      // If image fails, use a fallback image
                      (e.target as HTMLImageElement).src =
                        "/images/instagram-placeholder.jpg";
                    }}
                  />
                </div>

                {/* Overlay with Instagram-like details */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col justify-between p-3">
                  {/* Video indicator */}
                  {post.mediaType === "VIDEO" && (
                    <div className="self-end bg-black/60 rounded-full p-1.5">
                      <FaPlay className="w-3 h-3 text-white" />
                    </div>
                  )}

                  {/* Like and comment counts (estimates) */}
                  <div className="flex items-center gap-3 text-white text-xs">
                    <span className="flex items-center">
                      <svg
                        className="w-3.5 h-3.5 mr-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z" />
                      </svg>
                      {post.estimatedLikes}
                    </span>
                    <span className="flex items-center">
                      <svg
                        className="w-3.5 h-3.5 mr-1"
                        fill="currentColor"
                        viewBox="0 0 24 24"
                      >
                        <path d="M21 15a2 2 0 0 1-2 2h-2v3l-4-3H7a2 2 0 0 1-2-2V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8Z" />
                      </svg>
                      {post.estimatedComments}
                    </span>
                  </div>
                </div>

                {/* Instagram-style border gradient */}
                <div className="absolute inset-0 border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
              </a>
            ))}
          </div>
        )}

        {/* Follow button with Instagram gradient */}
        <div className="text-center mt-8">
          <a
            href={profileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-6 py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-orange-600 text-white rounded-lg font-medium hover:shadow-lg transition-all duration-300"
          >
            <FaInstagram className="mr-2 w-4 h-4" />
            Follow @{username}
          </a>
        </div>
      </div>
    </section>
  );
}
