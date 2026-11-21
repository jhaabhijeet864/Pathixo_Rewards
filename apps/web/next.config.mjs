import { mkdirSync } from 'node:fs';

/** @type {import('next').NextConfig} */
const isStaticExport = process.env.STATIC_EXPORT === 'true' || process.env.GITHUB_PAGES === 'true';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || (process.env.GITHUB_PAGES === 'true' ? '/Pathixo_Rewards' : '');

const nextConfig = {
  ...(isStaticExport ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  webpack(config) {
    try {
      mkdirSync('.next/server/pages', { recursive: true });
    } catch {}
    return config;
  },
  ...(basePath ? { basePath, assetPrefix: `${basePath}/` } : {}),
  ...(isStaticExport ? { trailingSlash: true } : {}),
};

export default nextConfig;
