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
    // Fix the serverActions configuration to be an object instead of boolean
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  // Configure turbo for development if needed
  turbo:
    process.env.NODE_ENV === 'development'
      ? {
          loaders: {
            // Add any specific loaders if needed
          },
        }
      : undefined,
};

module.exports = nextConfig;
