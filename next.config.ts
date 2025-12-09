import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*', 
        destination: 'https://api.inkluzi.my.id/api/v1/:path*',
      },
    ];
  },
};

export default nextConfig;