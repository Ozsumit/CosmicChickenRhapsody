// @ts-check

import withPWA from "next-pwa";

//  import('next').NextConfig

const runtimeCaching = [
  {
    urlPattern: /^https?.*/, // Cache all requests to external APIs
    handler: "NetworkFirst",
    options: {
      cacheName: "external-cache",
      expiration: {
        maxEntries: 50,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      },
    },
  },
  {
    urlPattern: "/",
    handler: "NetworkFirst", // Serve from network first, fallback to cache
    options: {
      cacheName: "homepage-cache",
      expiration: {
        maxEntries: 1,
        maxAgeSeconds: 24 * 60 * 60, // 1 day
      },
    },
  },
  {
    urlPattern: /\/_next\/image/,
    handler: "CacheFirst", // Cache optimized images
    options: {
      cacheName: "image-cache",
      expiration: {
        maxEntries: 100,
        maxAgeSeconds: 7 * 24 * 60 * 60, // 1 week
      },
    },
  },
  {
    urlPattern: /\/page.tsx/,
    handler: "CacheFirst", // Offline fallback page
    options: {
      cacheName: "offline-cache",
      expiration: {
        maxEntries: 1,
      },
    },
  },
];
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // output: "export",
  // Add other Next.js config options here
};

const withPWAConfig = withPWA({
  dest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
});

export default nextConfig;


// export default withPWAConfig(nextConfig);gfh
