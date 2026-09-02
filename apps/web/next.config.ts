import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: [
    '@ai-scanner/shared',
    '@ai-scanner/parser',
    '@ai-scanner/security',
    '@ai-scanner/scanner-core',
    '@ai-scanner/ai',
    '@ai-scanner/reports',
  ],
  experimental: {
    serverActions: {
      bodySizeLimit: '50mb',
    },
  },
};

export default nextConfig;
