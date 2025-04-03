/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias = {
      ...config.resolve.alias,
      mui: '@mui',
    };
    return config;
  },
};

module.exports = nextConfig;
