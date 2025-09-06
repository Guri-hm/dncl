import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  // 静的サイト出力（GitHub Pages用）
  output: 'export',
  // パフォーマンス最適化
  // swcMinify: true,

  // GitHub Pages用のパス設定
  basePath: '/dncl',
  assetPrefix: process.env.NEXT_PUBLIC_BASE_PATH || '',
  trailingSlash: true,

  // GitHub Pagesでは画像最適化が使えない
  images: {
    unoptimized: true
  },
  // sassOptions: {
  //   includePaths: [path.join(__dirname, 'styles')],
  //   api: 'modern-compiler'
  // },
  // experimental: {
  //   // コード分割の最適化（GitHub Pagesでも有効）
  //   optimizePackageImports: ['@mui/material', '@mui/icons-material'],
  // },
  // webpack: (config, { isServer }) => {
  //   // コード分割の設定
  //   if (!isServer) {
  //     config.optimization.splitChunks = {
  //       ...config.optimization.splitChunks,
  //       cacheGroups: {
  //         default: false,
  //         vendors: false,
  //         // MUIを別チャンクに分離
  //         mui: {
  //           name: 'mui',
  //           test: /[\\/]node_modules[\\/]@mui[\\/]/,
  //           chunks: 'all',
  //           priority: 10,
  //         },
  //         // 重いコンポーネントを別チャンクに分離
  //         heavy: {
  //           name: 'heavy-components',
  //           test: /[\\/]src[\\/]app[\\/]components[\\/](Tab|SortableTree|Challenge)[\\/]/,
  //           chunks: 'all',
  //           priority: 5,
  //         },
  //         // 共通ライブラリ
  //         common: {
  //           name: 'common',
  //           minChunks: 2,
  //           chunks: 'all',
  //           priority: 1,
  //         },
  //       },
  //     };
  //   }
  //   return config;
  // },
};

export default nextConfig;