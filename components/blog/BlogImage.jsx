import React, { useState } from "react";
import { getCategoryIcon } from "./utils/categoryIcons";

export default function BlogImage({
  post,
  className = "",
  width = "100%",
  height = "200px",
}) {
  const [imageError, setImageError] = useState(false);

  // Check if post exists, image exists and hasn't errored
  if (!post || !post.image || imageError) {
    return (
      <div
        className={`flex items-center justify-center bg-gradient-to-br from-black/80 to-navy/90 ${className}`}
        style={{ width, height }}
      >
        <div className="transform scale-150">
          {getCategoryIcon(post?.category, 40)}
        </div>
      </div>
    );
  }

  return (
    <div className={`relative ${className}`} style={{ width, height }}>
      <img
        src={post.image}
        alt={post.title || "Blog post image"}
        className="w-full h-full object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
