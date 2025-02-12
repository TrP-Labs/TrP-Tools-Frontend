import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'tr.rbxcdn.com',
        pathname: '/**'
      },
      {
        protocol: 'https',
        hostname: 'static.trptools.com',
        pathname: '/**'
      }
    ],
  },
};

export default nextConfig;
