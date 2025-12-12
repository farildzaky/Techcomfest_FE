import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // 1. Konfigurasi Gambar (Supaya gambar dari Cloudinary/API bisa muncul)
  images: {
    remotePatterns: [
            {
                protocol: 'http', // API Anda mengembalikan link http
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
            {
                protocol: 'https', // Jaga-jaga jika ada link https nanti
                hostname: 'res.cloudinary.com',
                port: '',
                pathname: '/**',
            },
        ],
  },

  // 2. Proxy API (Agar tidak terkena CORS saat fetch ke backend)
  async rewrites() {
    return [
      {
        source: '/api/proxy/:path*',
        destination: 'https://api.inkluzi.my.id/api/v1/:path*',
      },
    ];
  },

  // 3. Konfigurasi Header untuk Mengizinkan CORS (PENTING UNTUK HP)
  async headers() {
    return [
      {
        // Mencocokkan semua rute API
        source: "/api/:path*",
        headers: [
          { key: "Access-Control-Allow-Credentials", value: "true" },
          { key: "Access-Control-Allow-Origin", value: "*" }, // Mengizinkan semua origin (termasuk IP HP)
          { key: "Access-Control-Allow-Methods", value: "GET,DELETE,PATCH,POST,PUT" },
          { key: "Access-Control-Allow-Headers", value: "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version" },
        ]
      }
    ]
  }
};

export default nextConfig;