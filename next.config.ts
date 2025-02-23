import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
    api: 'modern-compiler' // モダンAPIを使用するように設定
  },
  basePath: process.env.NEXT_PUBLIC_BASE_PATH || '',
  /* 他の設定オプションはこちらに追加 */
};

export default nextConfig;