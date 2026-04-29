import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactCompiler: true,
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3021',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
        port: '3021',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'test.ahlanbek.com',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'lh3.googleusercontent.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'moldroguerie.ma',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'http',
        hostname: 'moldroguerie.ma',
        pathname: '/api/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'i.pinimg.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'images.pexels.com',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'cdn.pixabay.com',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
