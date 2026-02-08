/** @type {import('next').NextConfig} */
const nextConfig = {
  // 🚀 REQUIRED FOR NETLIFY
  output: 'standalone',
  
  // 🛡️ TypeScript and ESLint configurations
  typescript: {
    ignoreBuildErrors: true,
  },
  
  // 🗃️ External packages for server
  serverExternalPackages: ['mongoose'],
  
  // 🖼️ Images configuration (UPDATED)
  images: {
    // ✅ Use remotePatterns instead of domains
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        pathname: '/**', // Allows all paths from Cloudinary
      },
      // Add other image hosts if needed
      {
        protocol: 'https',
        hostname: '**', // Allows all HTTPS images (for testing)
      },
    ],
  },
  
  // ⚡ Experimental features (optional)
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig