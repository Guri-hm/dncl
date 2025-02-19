import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  sassOptions: {
    includePaths: [path.join(__dirname, 'styles')],
    api: 'modern-compiler' // モダンAPIを使用するように設定
  },
  /* 他の設定オプションはこちらに追加 */
};

export default nextConfig;