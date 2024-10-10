// @ts-check


//  import('next').NextConfig


const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // output: "export",
  // Add other Next.js config options heredest: "public",
  disable: process.env.NODE_ENV === "development",
  register: true,
  skipWaiting: true,
};


export default nextConfig;


// export default withPWAConfig(nextConfig);gfh
