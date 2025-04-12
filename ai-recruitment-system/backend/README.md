# AI採用システム - バックエンド

## 概要

AI採用システムのバックエンドは、AWS Lambdaを中心としたサーバーレスアーキテクチャで構築されています。このサービスはフロントエンドアプリケーションにAPIを提供し、AIモデルとの連携を担当します。

## 主要機能

- **自動フォローアップ機能**: 応募者へのフォローアップを自動化
- **企業文化マッチングAPI**: 候補者と企業の文化適合性を評価
- **面接フィードバックAPI**: 面接のフィードバックを生成・分析
- **採用予測API**: 候補者の採用可能性を予測

## 開発環境のセットアップ

### 前提条件

- Node.js 14.x以上
- AWS CLI
- AWS SAM CLI

### インストールと実行

```bash
# 依存関係のインストール
npm install

# ローカルでのLambda関数テスト（SAM CLIを使用）
sam local invoke AutoFollowupFunction --event events/auto-followup-event.json

# ユニットテスト実行
npm test
```

## フォルダ構造

```
backend/
├── src/
│   ├── lambda/                # Lambda関数
│   │   ├── auto-followup/     # 自動フォローアップ
│   │   ├── culture-matching/  # 文化マッチングAPI
│   │   ├── interview-feedback/ # 面接フィードバックAPI
│   │   └── recruitment-prediction/ # 採用予測API
│   ├── lib/                   # 共通ライブラリ
│   └── utils/                 # ユーティリティ関数
├── tests/                     # テストコード
├── package.json
├── buildspec.yml             # AWS CodeBuildの設定
└── README.md
```

## 主要技術

- AWS Lambda
- AWS API Gateway
- AWS DynamoDB
- AWS SQS
- Node.js/TypeScript

## デプロイ

バックエンドサービスはAWS CloudFormationを使用してデプロイされます。デプロイはAWS CodePipelineとCodeBuildで自動化されています。

```bash
# CloudFormationテンプレートのビルド
npm run build

# AWSにデプロイ
aws cloudformation deploy --template-file packaged.yaml --stack-name ai-recruitment-backend --capabilities CAPABILITY_IAM
```

## 環境変数

Lambda関数は以下の環境変数を使用します：

- `AI_MODEL_ENDPOINT`: AIモデルのSageMakerエンドポイント
- `DATABASE_TABLE`: DynamoDBテーブル名
- `SQS_QUEUE_URL`: SQSキューのURL

環境変数はCloudFormationテンプレートまたはAWSコンソールで設定できます。

## APIエンドポイント

主要なAPIエンドポイントは以下の通りです：

- POST `/api/culture-matching`: 企業文化マッチング分析
- POST `/api/interview-feedback`: 面接フィードバック生成
- POST `/api/recruitment-prediction`: 採用予測
- POST `/api/auto-followup`: 自動フォローアップトリガー

詳細なAPI仕様は `/api/swagger.yaml` を参照してください。 