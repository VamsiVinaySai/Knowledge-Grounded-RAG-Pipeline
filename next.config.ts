import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    // Optimize server components
    serverComponentsExternalPackages: ["@supabase/ssr"],
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "*.supabase.co",
      },
    ],
  },
};

export default nextConfig;
