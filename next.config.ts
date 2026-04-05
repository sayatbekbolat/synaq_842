import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow mobile device access during development
  allowedDevOrigins: ['172.20.10.11', '10.41.154.213'],

  async headers() {
    return [
      {
        // Apply these headers to all routes
        source: '/:path*',
        headers: [
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-eval' 'unsafe-inline' https://telegram.org",
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https:",
              "font-src 'self' data:",
              "connect-src 'self' https://*.supabase.co wss://*.supabase.co https://telegram.org",
              "frame-src 'self' https://oauth.telegram.org",
            ].join('; '),
          },
        ],
      },
    ];
  },
};

export default nextConfig;
