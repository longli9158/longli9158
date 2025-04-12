# AI採用システム - フロントエンド

## 概要

AI採用システムのフロントエンドアプリケーションです。React.jsで構築され、採用プロセスの各段階をサポートするための直感的なユーザーインターフェースを提供します。

## 主要コンポーネント

- **企業文化マッチングダッシュボード**: 候補者と企業の文化適合性を視覚化
- **面接シミュレーター**: AIベースの面接練習ツール
- **候補者ポータル**: 応募者が自身の応募状況を確認できるポータル
- **採用分析ダッシュボード**: 採用データの分析と可視化

## 開発環境のセットアップ

### 前提条件

- Node.js 14.x以上
- npm 6.x以上

### インストールと実行

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm start

# ビルド
npm run build

# テスト実行
npm test
```

## フォルダ構造

```
frontend/
├── public/              # 静的ファイル
├── src/
│   ├── components/      # UIコンポーネント
│   ├── hooks/           # カスタムReactフック
│   ├── context/         # Reactコンテキスト
│   ├── pages/           # ページコンポーネント
│   ├── services/        # APIサービス
│   ├── utils/           # ユーティリティ関数
│   ├── App.jsx          # アプリルート
│   └── index.jsx        # エントリーポイント
├── package.json
├── buildspec.yml        # AWS CodeBuildの設定
└── README.md
```

## 主要技術

- React.js
- React Router
- Styled Components
- Axios
- React Query
- Jest

## デプロイ

フロントエンドアプリケーションは、AWS S3とCloudFrontを使用して静的ウェブサイトとしてデプロイされています。CI/CDパイプラインは、AWS CodePipelineとCodeBuildを使用して自動化されています。

```bash
# 本番環境用ビルド
npm run build

# AWS S3へのデプロイ
aws s3 sync build/ s3://ai-recruitment-frontend-bucket --delete
```

## 環境変数

アプリケーションは以下の環境変数を使用します：

- `REACT_APP_API_BASE_URL`: バックエンドAPIのベースURL
- `REACT_APP_AUTH_DOMAIN`: 認証ドメイン
- `REACT_APP_AUTH_CLIENT_ID`: 認証クライアントID

環境変数は`.env`ファイルまたはCI/CDパイプラインで設定できます。 