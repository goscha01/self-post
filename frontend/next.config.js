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
  // Export static files for backend serving
  output: 'export',
  trailingSlash: true,
  // Disable image optimization for static export
  images: {
    unoptimized: true,
  },
  // Ensure proper static export
  distDir: 'out',
}

module.exports = nextConfig
