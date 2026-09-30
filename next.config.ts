import type { NextConfig } from 'next';
const config: NextConfig = {
  poweredByHeader: false,
  // Exact hostnames only; useful for temporary remote playtests.
  allowedDevOrigins: (process.env.DEV_ALLOWED_ORIGINS ?? '').split(',').map(host => host.trim()).filter(Boolean),
};
export default config;
