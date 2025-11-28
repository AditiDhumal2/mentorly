/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,  // ✅ ADD THIS LINE
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  serverExternalPackages: ['mongoose'],
  images: {
    domains: ['res.cloudinary.com'],  // ✅ ADD THIS FOR CLOUDINARY
  },
}

module.exports = nextConfig