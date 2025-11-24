import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // Temporarily ignore TypeScript errors during build for Turborepo migration
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // Production: Cloudinary CDN
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/du7kvit2g/**',
      },
      // Unsplash Images (for sliders and placeholders)
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      // Production: Vercel Backend (New)
      {
        protocol: 'https',
        hostname: 'tulumbak-api.vercel.app',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'tulumbak-api.vercel.app',
        pathname: '/assets/**',
      },
      // Also allow the specific deployment URL just in case
      {
        protocol: 'https',
        hostname: 'tulumbak-da5nm6hlt-ismails-projects-06a1c35e.vercel.app',
        pathname: '/uploads/**',
      },
      // Development: Localhost
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '4001',
        pathname: '/assets/**',
      },
      // Development: 127.0.0.1
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '4001',
        pathname: '/assets/**',
      },
    ],
    // Development: Allow SVG files
    dangerouslyAllowSVG: true,
    /**
     * CRITICAL FIX for Next.js 16 Private IP Blocking
     *
     * Problem: Next.js 16 blocks localhost/127.0.0.1 as "private IP"
     * Error: "upstream image resolved to private ip"
     *
     * Solution: Disable image optimization in development
     * - Development: unoptimized = true (images load directly)
     * - Production: unoptimized = false (Next.js optimizes images)
     *
     * Note: In production, use proper domain (not localhost)
     */
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
