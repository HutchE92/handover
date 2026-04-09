import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  // For GitHub Pages deployment with a repository name
  basePath: process.env.NODE_ENV === 'production' ? '/handover' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/handover/' : '',
  // Skip static generation for dynamic routes - they will be client-side rendered
  experimental: {
    // This allows pages without generateStaticParams to be built
  }
};

export default nextConfig;
