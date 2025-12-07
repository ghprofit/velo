import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Set turbopack root to this directory to fix workspace detection warning
  turbopack: {
    root: __dirname,
  },
};

export default nextConfig;
