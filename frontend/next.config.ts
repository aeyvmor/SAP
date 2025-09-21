import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Ensure proper TypeScript handling
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Add proper ESLint configuration
  eslint: {
    ignoreDuringBuilds: false,
  },
};

export default nextConfig;
