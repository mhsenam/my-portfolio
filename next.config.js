/** @type {import('next').NextConfig} */
const nextConfig = {
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

module.exports = nextConfig; 