import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "api.promiedos.com.ar",
        pathname: "/images/team/**",
      },
    ],
  },
};

export default nextConfig;
