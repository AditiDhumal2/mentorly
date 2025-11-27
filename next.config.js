 /** @type {import('next').NextConfig} */
const nextConfig = {
  // Build optimizations
  typescript: { ignoreBuildErrors: true },
  eslint: { ignoreDuringBuilds: true },
  
  // MongoDB package externalization
  serverExternalPackages: ['mongoose'],
  
  // Webpack configuration for WebSocket dependencies
  webpack: (config) => {
    config.externals.push(
      { 'utf-8-validate': 'commonjs utf-8-validate' },
      { 'bufferutil': 'commonjs bufferutil' }
    )
    return config
  },
  
  // Image optimization
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
      {
        protocol: 'http', 
        hostname: 'localhost',
        port: '3000',
      },
    ],
  },
}

module.exports = nextConfig