// Create a file named create-favicon.js in your project root:

const { createCanvas } = require("canvas");
const fs = require("fs");
const path = require("path");

// Create simple circular FL favicon with transparent background
const createFavicon = (size) => {
  const canvas = createCanvas(size, size);
  const ctx = canvas.getContext("2d");

  // Set up dimensions
  const centerX = size / 2;
  const centerY = size / 2;
  const radius = size * 0.45; // Circle radius

  // Create transparent background (skip the background fill)
  ctx.clearRect(0, 0, size, size);

  // Draw outer circle with gradient
  const circleGradient = ctx.createLinearGradient(0, 0, 0, size);
  circleGradient.addColorStop(0, "#3a5fcf"); // Royal light blue
  circleGradient.addColorStop(1, "#1a2d80"); // Royal dark blue

  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.fillStyle = circleGradient;
  ctx.fill();

  // Add subtle highlight on top portion
  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
  ctx.clip();
  const highlightGradient = ctx.createLinearGradient(0, 0, 0, size);
  highlightGradient.addColorStop(0, "rgba(255, 255, 255, 0.2)");
  highlightGradient.addColorStop(0.5, "rgba(255, 255, 255, 0)");
  ctx.fillStyle = highlightGradient;
  ctx.fillRect(0, 0, size, size);
  ctx.restore();

  // Add "FL" text
  const fontSize = size * (size < 32 ? 0.35 : 0.4);
  ctx.font = `bold ${fontSize}px Arial`;
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText("FL", centerX, centerY);

  return canvas.toBuffer("image/png");
};

// Create different sized favicons
const sizes = [16, 32, 180, 192, 512];
const publicDir = path.join(__dirname, "public");

// Ensure public directory exists
if (!fs.existsSync(publicDir)) {
  fs.mkdirSync(publicDir);
}

// Generate various sizes
sizes.forEach((size) => {
  const buffer = createFavicon(size);
  if (size === 16) {
    fs.writeFileSync(path.join(publicDir, "favicon-16x16.png"), buffer);
  } else if (size === 32) {
    fs.writeFileSync(path.join(publicDir, "favicon-32x32.png"), buffer);
    fs.writeFileSync(path.join(publicDir, "favicon.ico"), buffer);
  } else if (size === 180) {
    fs.writeFileSync(path.join(publicDir, "apple-touch-icon.png"), buffer);
  } else if (size === 192) {
    fs.writeFileSync(
      path.join(publicDir, "android-chrome-192x192.png"),
      buffer
    );
  } else if (size === 512) {
    fs.writeFileSync(
      path.join(publicDir, "android-chrome-512x512.png"),
      buffer
    );
  }
});

// Update webmanifest
const manifest = {
  name: "FL Best Trainer",
  short_name: "FLBestTrainer",
  icons: [
    {
      src: "/favicon-16x16.png",
      sizes: "16x16",
      type: "image/png",
    },
    {
      src: "/favicon-32x32.png",
      sizes: "32x32",
      type: "image/png",
    },
    {
      src: "/apple-touch-icon.png",
      sizes: "180x180",
      type: "image/png",
    },
    {
      src: "/android-chrome-192x192.png",
      sizes: "192x192",
      type: "image/png",
    },
    {
      src: "/android-chrome-512x512.png",
      sizes: "512x512",
      type: "image/png",
    },
  ],
  theme_color: "#1a2d80",
  background_color: "transparent",
  display: "standalone",
};

fs.writeFileSync(
  path.join(publicDir, "site.webmanifest"),
  JSON.stringify(manifest, null, 2)
);

console.log("Transparent circular FL favicon files created!");
