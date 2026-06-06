import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Abilita Turbopack (stabile in Next.js 16)
  experimental: {
    turbo: {},
  },
};

export default nextConfig;
