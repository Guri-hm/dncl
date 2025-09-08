# DNCL学習アプリ

<div align="center">
  <img src="public/webp/title_character.webp" alt="DNCL学習アプリのマスコット" width="200" height="auto">
</div>

## デモページ

[https://dncl.solopg.com/](https://dncl.solopg.com/) でアプリのデモを公開しています。ブラウザからすぐに体験できます。

共通テストで使われる疑似言語DNCLの学習を支援するWebアプリケーションです。ブラウザ上でDNCLコードを記述し、実行結果を確認することができます。

## 機能

- **ビジュアルコードエディター**: ドラッグ&ドロップでDNCLコードを構築
- **リアルタイム実行**: 書いたコードをその場で実行して結果を確認
- **チャレンジモード**: 段階的な学習のための練習問題
- **学習支援**: 
  - ビジュアルなヒント表示
  - 構文チェック機能
  - 分かりやすい日本語エラーメッセージ
- **エラー検証**: 無限ループ検出、構文エラーのチェック

## 技術スタック

- **フレームワーク**: Next.js 15 (App Router)
- **言語**: TypeScript
- **UI**: Material-UI (MUI) v6
- **ドラッグ&ドロップ**: @dnd-kit
- **コード実行**: Node.js vm モジュール
- **テスト**: Jest + React Testing Library
- **リンター**: ESLint (カスタムルール含む)
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
│   │   ├── execute/          # コード実行API
│   │   └── lint/             # ESLintチェックAPI
│   ├── components/
│   │   ├── Challenge/        # チャレンジモードのコンポーネント
│   │   ├── Dialog/           # コード入力ダイアログ
│   │   ├── Tab/              # タブベースのエディター
│   │   ├── Tips/             # 学習支援コンポーネント
│   │   └── TreeItem/         # ドラッグ&ドロップ要素
│   ├── chlng/
│   │   └── [slug]/           # 動的チャレンジページ
│   ├── edit/                 # メインエディターページ
│   ├── enum/                 # 列挙型定義
│   ├── hooks/                # カスタムフック
│   ├── types/                # 型定義
│   ├── utilities/            # ユーティリティ関数
│   ├── globals.css
│   ├── layout.tsx
│   └── page.tsx
├── eslint-plugin-custom-rules/ # カスタムESLintルール
└── public/                   # 静的ファイル
    ├── dict/                 # Kuroshiro辞書ファイル
    └── *.svg, *.png         # アイコン・画像
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
- チャレンジ問題は `src/app/components/Challenge/Challenges.tsx` で管理

### コードの実行機能
コードの実行は以下のAPIエンドポイントで処理されます：
- `/api/execute` - DNCLコードをJavaScriptに変換して実行
- `/api/lint` - ESLintによる構文チェック

特徴：
- サンドボックス環境で安全にコードを実行
- タイムアウト設定（1秒）で無限ループを防止
- カスタムconsole.logで出力をキャプチャ
- リアルタイムの構文チェック

### テスト
```bash
# 全テストの実行
npm run test

# 特定テストの実行
npm run test:validation
npm run test:syntax
npm run test:integration

# カバレッジレポート
npm run test:coverage
```

## ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で公開されています。

## 貢献

プルリクエストやイシューの作成を歓迎します。バグ報告や機能提案もお気軽にどうぞ。

### 開発の流れ
1. このリポジトリをフォーク
2. 機能ブランチを作成 (`git checkout -b feature/amazing-feature`)
3. 変更をコミット (`git commit -m 'Add some amazing feature'`)
4. ブランチにプッシュ (`git push origin feature/amazing-feature`)
5. プルリクエストを作成

## 参考資料

- [Next.js Documentation](https://nextjs.org/docs)
- [DNCL (Data Network Communication Language)](https://www.mext.go.jp/a_menu/shotou/zyouhou/detail/1375607.htm)
- [Material-UI Documentation](https://mui.com/)
- [dnd kit Documentation](https://docs.dndkit.com/)