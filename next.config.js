/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    domains: ["images.unsplash.com"],
    // Add more domains as needed for external images
  },
  async redirects() {
    return [
      {
        source: '/services',
        destination: '/training',
        permanent: true,
      },
      // Add any other redirects here
    ]
  },
};

module.exports = nextConfig;
