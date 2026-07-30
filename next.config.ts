import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "autonexabrasil.com.br",
      },
    ],
  },
};

export default nextConfig;
