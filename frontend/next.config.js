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
  // Remove static export settings for Vercel deployment
  // output: 'export',
  // trailingSlash: true,
  // distDir: 'out',
  // assetPrefix: '',
  // generateEtags: false,
  // poweredByHeader: false,
  // compress: false,
  
  // Keep image optimization for Vercel
  images: {
    unoptimized: false,
  },
  
  // Enable compression for Vercel
  compress: true,
  
  // Enable prefetching for Vercel
  generateEtags: true,
  
  // Add trailing slash for better routing
  trailingSlash: false,
}

module.exports = nextConfig
