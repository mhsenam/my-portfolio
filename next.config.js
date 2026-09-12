/** @type {import('next').NextConfig} */
const nextConfig = {
  poweredByHeader: false,
  // The Arena live preview serves the dev server under *.e2b.app.
  allowedDevOrigins: ['*.e2b.app', 'e2b.app'],
  images: {
    // Keep existing remotePatterns if any, or use domains
    // Using remotePatterns is generally preferred for more control
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
        // Optional: You can specify port and pathname if needed
        // port: '',
        // pathname: '/account123/**',
      },
      // Add other patterns here if needed, e.g., for lh3.googleusercontent.com if using Google Avatars
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
      },
      {
        protocol: 'https',
        hostname: 'yt3.ggpht.com',
      },
      // Add YouTube thumbnail domain
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
      },
    ],
    // --- OR --- (Use only one method: remotePatterns OR domains)
    // domains: ['res.cloudinary.com', 'lh3.googleusercontent.com', 'yt3.ggpht.com'],
  },
};

// Static public assets are content-stable: let CDNs and browsers hold them
// for a month, revalidating in background. /_next/* keeps Next's own
// immutable hashed-asset headers.
nextConfig.headers = async () => [
  {
    source: '/:path((?!_next/).*\\.(?:svg|jpg|jpeg|png|webp|gif|ico|webmanifest))',
    headers: [
      {
        key: 'Cache-Control',
        value: 'public, max-age=2592000, stale-while-revalidate=604800',
      },
    ],
  },
];

module.exports = nextConfig; 