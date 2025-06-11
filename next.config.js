/** @type {import('next').NextConfig} */
const nextConfig = {
  // output: 'export',
  // trailingSlash: true,
  // skipTrailingSlashRedirect: true,
  images: {
    // unoptimized: true,
    domains: ['play2048.co', 'tetris.com', 'www.google.com', 'www.chess.com', 'sudoku.com'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**',
      },
    ],
  },
  // Cloudflare Pages优化
  experimental: {
    esmExternals: false,
  },
}

module.exports = nextConfig 