import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // 86 keeps the pale skies in the landing images free of banding.
    qualities: [75, 86],
  },
};

export default nextConfig;
