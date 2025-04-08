/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'i.ytimg.com',
        port: '', // Leave empty for default ports (80/443)
        pathname: '/vi/**', // Allows any path starting with /vi/
      },
      {
        protocol: 'https',
        hostname: 'avatars.githubusercontent.com', // Added for GitHub avatars from Home page
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com', // Added for Google avatars (from Firebase Auth/Profile)
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https', // Protocol for YouTube channel avatars
        hostname: 'yt3.ggpht.com',
        port: '',
        pathname: '/**', // Allow any path for avatars
      }
      // Add other domains if needed in the future
    ],
  },
};

export default nextConfig; 