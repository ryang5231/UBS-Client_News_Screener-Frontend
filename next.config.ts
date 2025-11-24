import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "export",
  images: {
    unoptimized: true,
  },

  reactStrictMode: true,
  distDir: "out",
};

export default nextConfig;
