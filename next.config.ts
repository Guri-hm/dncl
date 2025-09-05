import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  experimental: {
    // コード分割の最適化
    optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  },
  webpack: (config, { isServer }) => {
    // コード分割の設定
    if (!isServer) {
      config.optimization.splitChunks = {
        ...config.optimization.splitChunks,
        cacheGroups: {
          default: false,
          vendors: false,
          // MUIを別チャンクに分離
          mui: {
            name: 'mui',
            test: /[\\/]node_modules[\\/]@mui[\\/]/,
            chunks: 'all',
            priority: 10,
          },
          // 重いコンポーネントを別チャンクに分離
          heavy: {
            name: 'heavy-components',
            test: /[\\/]src[\\/]app[\\/]components[\\/](Tab|SortableTree|Challenge)[\\/]/,
            chunks: 'all',
            priority: 5,
          },
          // 共通ライブラリ
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
  // 静的最適化
  swcMinify: true,
  // 画像最適化
  images: {
    formats: ['image/webp', 'image/avif'],
  },
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
    api: 'modern-compiler' // モダンAPIを使用するように設定
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  /* 他の設定オプションはこちらに追加 */
};

export default nextConfig;