import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  // 🚀 REQUIRED FOR NETLIFY
  output: 'standalone',
  
  // TypeScript configuration
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // External packages for server
  serverExternalPackages: ['mongoose'],
  
  // Images configuration
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: '**', // For other images
      },
    ],
  },
  
  // ✅ CORRECTED: Server actions config for Next.js 16+
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
};

export default nextConfig;