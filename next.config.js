const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'export',

  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',

  images: {
    unoptimized: true
  },

  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
    api: 'modern-compiler'
  },

  experimental: {
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },

  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          default: false,
          vendors: false,
          mui: {
            name: 'mui',
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            chunks: 'all',
            priority: 10,
          },
          heavy: {
            name: 'heavy-components',
            test: /[\\/]src[\\/]app[\\/]components[\\/](Tab|SortableTree|Challenge)[\\/]/,
            chunks: 'all',
            priority: 5,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            priority: 1,
          },
        },
      };
    }
    return config;
  },
};

module.exports = nextConfig;