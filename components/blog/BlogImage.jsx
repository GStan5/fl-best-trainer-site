import React, { useState } from "react";
import Image from "next/image";
import { getCategoryIcon } from "./utils/categoryIcons";

export default function BlogImage({
  post,
  className = "",
  width = "100%",
  height = "200px",
  // Above-the-fold heroes (featured post, open post view) load eagerly;
  // grid cards and tooltips lazy-load. next/image serves resized,
  // modern-format versions instead of the full-size originals.
  priority = false,
  sizes = "(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw",
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
      <Image
        src={post.image}
        alt={post.title || "Blog post image"}
        fill
        sizes={sizes}
        priority={priority}
        className="object-cover"
        onError={() => setImageError(true)}
      />
    </div>
  );
}
