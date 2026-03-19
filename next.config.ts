import type { NextConfig } from "next";

const nextConfig: NextConfig = {
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: process.env.NEXT_PUBLIC_SUPABASE_URL!,
        port: '',
        pathname: '/**/**',
      },
    ],
    }
};

export default nextConfig;
