import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: new URL(process.env.NEXT_PUBLIC_SUPABASE_URL!).hostname,
        port: "",
        pathname: "/**/**",
      },

    ],
  },
  // server actions cap uploads at 1mb by default - the admin editor needs to accept big photos
  // so it can shrink them itself (see uploadImage in src/app/admin/actions.ts)
  experimental: {
    serverActions: { bodySizeLimit: "30mb" },
  },
  // the about page got folded into the home page in the redesign
  async redirects() {
    return [{ source: "/about", destination: "/#contact", permanent: true }];
  },
};

export default nextConfig;
