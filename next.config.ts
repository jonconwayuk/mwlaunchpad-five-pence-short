import type { NextConfig } from "next";

// NEXT_DIST_DIR lets parallel build agents run their own dev servers without sharing .next.
const nextConfig: NextConfig = {
  distDir: process.env.NEXT_DIST_DIR ?? ".next",
};

export default nextConfig;
