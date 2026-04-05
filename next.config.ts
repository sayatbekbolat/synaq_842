import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile device access during development
  allowedDevOrigins: ['172.20.10.11', '10.41.154.213'],
};

export default nextConfig;
