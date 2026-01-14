import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set turbopack root to this directory to fix workspace detection warning
  turbopack: {
    root: __dirname,
  },

  // Configure allowed image domains for Next.js Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'via.placeholder.com',
      },
      {
        protocol: 'https',
        hostname: '**.amazonaws.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'velo-content.s3.us-east-1.amazonaws.com',
      },
      {
        protocol: 'https',
        hostname: 'velo-content.s3.amazonaws.com',
      },
    ],
  },
};

export default nextConfig;
