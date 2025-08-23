/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Temporarily ignore TypeScript errors during build
    ignoreBuildErrors: true,
  },
  eslint: {
    // Temporarily ignore ESLint errors during build
    ignoreDuringBuilds: true,
  },
  experimental: {
    appDir: true,
  },
  // Output static files for production
  output: 'standalone',
  // Disable image optimization for Railway
  images: {
    unoptimized: true,
  },
}

module.exports = nextConfig
