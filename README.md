# DNCL (ドリトル記述言語) 学習アプリ

DNCL（ドリトル記述言語）の学習を支援するWebアプリケーションです。ブラウザ上でDNCLコードを記述し、実行結果を確認することができます。

## 機能

- **コードエディター**: DNCLコードをブラウザ上で編集
- **リアルタイム実行**: 書いたコードをその場で実行して結果を確認
- **学習支援**: 
  - インデントの説明
  - その他のプログラミング概念の解説
- **エラーハンドリング**: 分かりやすい日本語エラーメッセージ
  - 構文エラー
  - 参照エラー  
  - 無限ループ検出

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **UI**: Material-UI (MUI)
- **コード実行**: Node.js vm モジュール
- **スタイリング**: CSS Modules + MUI

## セットアップ

### 必要な環境
- Node.js 18.0.0 以上
- npm, yarn, pnpm, または bun

### インストールと起動

```bash
# リポジトリをクローン
git clone https://github.com/Guri-hm/dncl.git
cd dncl

# 依存関係をインストール
npm install
# または
yarn install

# 開発サーバーを起動
npm run dev
# または
yarn dev
```

[http://localhost:3000](http://localhost:3000) をブラウザで開いてアプリケーションを確認できます。

## プロジェクト構成

```
src/
├── app/
│   ├── api/
│   │   └── execute/          # コード実行API
│   ├── components/
│   │   └── Tips/            # 学習支援コンポーネント
│   │       └── IndentHint.tsx
│   ├── globals.css
│   ├── layout.tsx
│   ├── manifest.json        # PWA設定
│   └── page.tsx
└── ...
```

## デプロイ

### Vercel（推奨）
このアプリケーションはAPIルートを使用しているため、Vercelでのデプロイが推奨されます。

```bash
# Vercel CLIをインストール
npm install -g vercel

# デプロイ
vercel
```

### その他のプラットフォーム
- Netlify
- Railway
- Render

## 開発

### 新しい機能の追加
- `src/app/components/` に新しいコンポーネントを追加
- `src/app/api/` にAPIエンドポイントを追加

### コードの実行機能
コードの実行は `/api/execute` エンドポイントで処理されます：
- サンドボックス環境で安全にコードを実行
- タイムアウト設定（1秒）で無限ループを防止
- カスタムconsole.logで出力をキャプチャ

## ライセンス

このプロジェクトはMITライセンスの下で公開されています。

## 貢献

プルリクエストやイシューの作成を歓迎します。

## 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
-