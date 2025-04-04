/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  // Explicitly use webpack (default)
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      mui: '@mui',
    };
    return config;
  },
  // Configure proper experimental options
  experimental: {
    // Explicitly disable turbopack
    serverActions: true,
    // Other valid experimental options can go here
  },
};

module.exports = nextConfig;
