import React from "react";
import {
  FaDumbbell,
  FaAppleAlt,
  FaBed,
  FaBrain,
  FaHeartbeat,
  FaFlask,
} from "react-icons/fa";

// Shared function to get category icon
export function getCategoryIcon(category, size = 24) {
  // Add a console.log to debug
  console.log("Getting icon for category:", category);

  const iconProps = { size, className: "text-royal" };

  // Handle null/undefined category
  if (!category) {
    return <FaDumbbell {...iconProps} />;
  }

  // Convert to lowercase for case-insensitive comparison
  const lowerCategory = category.toLowerCase();

  switch (lowerCategory) {
    case "training":
      return <FaDumbbell {...iconProps} />;
    case "nutrition":
      return <FaAppleAlt {...iconProps} />;
    case "recovery":
      return <FaBed {...iconProps} />;
    case "mindset":
      return <FaBrain {...iconProps} />;
    case "lifestyle":
      return <FaHeartbeat {...iconProps} />;
    case "science":
      return <FaFlask {...iconProps} />;
    default:
      return <FaDumbbell {...iconProps} />; // Default to training icon
  }
}

/**
 * Get the styling for category background colors
 */
export function getCategoryStyles(category) {
  // Handle null/undefined category
  if (!category) {
    return "bg-royal/20 text-royal-light border-royal/30";
  }

  // Convert to lowercase for case-insensitive comparison
  const lowerCategory = category.toLowerCase();

  switch (lowerCategory) {
    case "training":
      return "bg-royal/20 text-royal-light border-royal/30";
    case "nutrition":
      return "bg-green-700/20 text-green-300 border-green-700/30";
    case "recovery":
      return "bg-blue-700/20 text-blue-300 border-blue-700/30";
    case "mindset":
      return "bg-purple-700/20 text-purple-300 border-purple-700/30";
    case "lifestyle":
      return "bg-amber-700/20 text-amber-300 border-amber-700/30";
    case "science":
      return "bg-cyan-700/20 text-cyan-300 border-cyan-700/30";
    default:
      return "bg-royal/20 text-royal-light border-royal/30";
  }
}