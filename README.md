# DNCL学習アプリ

<div align="center">
  <img src="public/title_character.webp" alt="DNCL学習アプリのマスコット" width="200" height="auto">
</div>

## デモページ

[https://dncl.solopg.com/](https://dncl.solopg.com/) でアプリのデモを公開しています。ブラウザからすぐに体験できます。

共通テストで使われる疑似言語DNCLの学習を支援するWebアプリケーションです。ブラウザ上でDNCLコードを記述し、実行結果を確認することができます。

## 機能

- **ビジュアルコードエディター**: ドラッグ&ドロップでDNCLコードを構築
  - 追加したカードを子カードごと複製し、関数の定義・呼び出しも再編集可能
  - 使用上限は、折りたたんだ子カードや複製にも適用
- **サンプルコード**: 変数、条件分岐、繰り返し、関数の例をエディターにセット
- **リアルタイム実行**: 書いたコードをその場で実行して結果を確認
- **学習モードハブ**: 課題、コードの結果予想、DNCLゲームから学び方を選択
- **課題モード**: 段階的なDNCLの練習問題に挑戦
- **コードの結果予想**: DNCLコードを実際に変換・実行し、コンソールに表示される結果を選択
- **DNCLゲーム**: 方向転換・前進・繰り返し・壁条件のカードでゴールを目指す
  - 向きは上下左右、繰り返し回数は1〜30回から選択
  - 女の子は向いている方向にだけ前進し、正面・背面・横向きの待機／歩行画像で表示
  - 「目の前に壁がある／ない」で条件分岐や条件付き繰り返し（マップの端も壁）
  - 繰り返し・条件のカードには対応する終わりのカードを配置
  - 前進カードの上限はステージ順に1枚・2枚・2枚。1回の実行は30歩まで
  - カード変更時はスタートから実行し、移動の再生完了後に次のステージを解放
  - ゲーム専用カードはブラウザ内の回数制限付き実行処理で評価（通常のエディターは従来のAPIを使用）
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
│   │   ├── problems/         # 課題一覧
│   │   ├── predict/          # コードの結果予想モード
│   │   ├── game/             # DNCLの実行結果で遊ぶゲーム
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

フロントエンドとAPIは別々に公開します。

### フロントエンド（GitHub Pages）

GitHub Actions の設定は `.github/workflows/deploy.yml` にあります。通常のビルドは静的エクスポートで、出力先は `out` です。API は静的サイトに含まれず、`NEXT_PUBLIC_API_BASE_URL` に設定した IIS の API を呼び出します。

### API（Windows Server / IIS）

IIS 用は静的エクスポートではなく、`/next/dncl` をベースパスとする Next.js サーバーです。`/next/dncl` や `/next/dncl/edit` などの API 以外のページは JSON の 404 を返します。フロントエンドは引き続き `https://dncl.solopg.com/` を使用します。

更新手順：

1. ビルド用の Windows 環境で依存関係をインストールし、`npm run build:iis` を実行します。続けて `npm run test:iis` で、ローカルの IIS 用ビルドのルーティング、API、カスタム ESLint ルール、CORS を確認できます。このテストは IIS 自体の設定を検査するものではありません。
2. サーバーの IIS アプリケーションを停止し、**今回のビルドで生成された `.next` 全体**を `C:\next\dncl` に反映します。古い `.next` と新しい `.next` のファイルを混在させないでください。
3. 同じバージョンの `next.config.js`、`package.json`、`package-lock.json`、`.eslintrc.js`、`eslint-plugin-custom-rules` と、対応する `node_modules` も配置します。ビルド環境とサーバーは互換性のある Node.js バージョン・OS・CPU アーキテクチャを使用してください。`eslint` ディレクトリ内の独自フォーマッターは現在の API では使用していません。`out`、`src`、テスト用 `api-test.js` は API の実行に不要です。既存の IIS 用 `web.config` は保持してください。
4. `web.config` の `httpPlatformHandler` が `C:\next\dncl` を作業ディレクトリとして `next start` を起動し、IIS が指定するポートに接続することを確認します。起動時の環境変数に `BUILD_TARGET=iis` を設定します。`ESLINT_MODE=build` はビルド専用で、サーバー起動時には設定しないでください。これが残ると API のカスタムルールが無効になります。
5. IIS アプリケーションを再開し、`https://solopg.com/next/dncl` が 404、両 `/api/execute` と `/api/lint` の POST と OPTIONS が正常に応答することを確認します。サイトのエディターと結果予想ページからも実行してください。

`BUILD_TARGET` は、例えば既存の `web.config` の `<httpPlatform>` 内に次のように設定します。すでに `<environmentVariables>` がある場合は、その中に `<environmentVariable>` だけを追加してください。

```xml
<environmentVariables>
  <environmentVariable name="BUILD_TARGET" value="iis" />
</environmentVariables>
```

画像のサーバー配置にある `web.config` はこのリポジトリにはないため、上記の IIS 設定は実機での確認が必要です。IIS が OPTIONS を Next.js に転送し、404 や API のエラー応答を別の HTML に置き換えないことも確認してください。

両 API は `https://dncl.solopg.com` に対する CORS ヘッダーを返します。IIS 側でも同じヘッダーを付ける場合は重複に注意してください。CORS はブラウザによる読み取りの制御であり、API の認証ではありません。

## 開発

### 新しい機能の追加
- `src/app/components/` に新しいコンポーネントを追加
- `src/app/api/` にAPIエンドポイントを追加
- チャレンジ問題は `src/app/components/Challenge/Challenges.tsx` で管理

### コードの実行機能
コードの実行は以下のAPIエンドポイントで処理されます：
- `/api/execute` - JavaScriptに変換済みのコードを実行
- `/api/lint` - ESLintによる構文チェック

特徴：
- Node.js の `vm` でコードを実行（信頼できないコードに対する完全なセキュリティ境界ではありません）
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
