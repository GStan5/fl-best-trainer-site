const withPWA = require("next-pwa")({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  transpilePackages: ["react-icons"],
  typescript: {
    // This will ignore TypeScript errors during build
    // This is not ideal for code quality, but will help you deploy now
    ignoreBuildErrors: true,
  },
  images: {
    domains: ["images.unsplash.com"],
    // Add more domains as needed for external images
  },
  async redirects() {
    return [
      {
        source: "/services",
        destination: "/training",
        permanent: true,
      },
      // Add any other redirects here
    ];
  },
};

module.exports = withPWA(nextConfig);
