# AI採用システム - インフラストラクチャ

## 概要

AI採用システムのインフラストラクチャは、AWS CloudFormationを使用してInfrastructure as Code（IaC）として定義されています。このアプローチにより、環境の一貫性、再現性、およびバージョン管理が確保されます。

## 主要コンポーネント

- **[cloudformation-template.yaml](./cloudformation-template.yaml)**: メインのインフラストラクチャ定義
- **[codepipeline.yaml](./codepipeline.yaml)**: CI/CDパイプライン定義

## アーキテクチャ概要

AI採用システムは以下のAWSサービスを活用しています：

- **計算リソース**
  - AWS Lambda: バックエンドAPI
  - Amazon EC2: 必要に応じてのみ使用
  - AWS Fargate: バッチ処理タスク

- **ストレージ**
  - Amazon S3: 静的フロントエンド、データレイク
  - Amazon DynamoDB: 候補者プロファイル、ジョブデータ

- **ネットワーキング**
  - Amazon API Gateway: REST API
  - Amazon CloudFront: フロントエンドの配信
  - Amazon VPC: プライベートネットワーク

- **AI/ML**
  - Amazon SageMaker: AIモデルのホスティングと推論
  - Amazon Comprehend: 自然言語処理

- **セキュリティ**
  - AWS IAM: アクセス制御
  - Amazon Cognito: ユーザー認証
  - AWS WAF: ウェブアプリケーションファイアウォール

- **監視と運用**
  - Amazon CloudWatch: メトリクスとログ
  - AWS X-Ray: アプリケーショントレース

## デプロイ手順

### 前提条件

- AWS CLI
- 適切なAWS IAM権限

### メインインフラストラクチャのデプロイ

```bash
# CloudFormationスタックのデプロイ
aws cloudformation deploy \
  --template-file cloudformation-template.yaml \
  --stack-name ai-recruitment-system \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    Environment=Production \
    VpcId=vpc-1234567 \
    SubnetIds=subnet-1234567,subnet-7654321
```

### CI/CDパイプラインのデプロイ

```bash
# CI/CDパイプラインのデプロイ
aws cloudformation deploy \
  --template-file codepipeline.yaml \
  --stack-name ai-recruitment-cicd \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    GitHubOwner=your-github-username \
    GitHubRepo=ai-recruitment-system \
    GitHubBranch=main
```

## 環境変数

CloudFormationテンプレートは以下の環境変数をサポートしています：

- `Environment`: デプロイ環境（例：Production, Staging, Development）
- `VpcId`: VPC ID
- `SubnetIds`: サブネットIDs（カンマ区切り）
- `DomainName`: フロントエンドのドメイン名

## セキュリティベストプラクティス

- すべてのリソースはVPC内に配置され、適切なセキュリティグループが設定されています
- 最小権限の原則に基づいてIAMロールが構成されています
- センシティブデータはAWS KMSを使用して暗号化されています
- セキュリティグループは必要最小限のポートとプロトコルのみを許可します

## コスト最適化

- 本番環境では、リソースのサイズと数が最適化されています
- 開発環境では、コスト削減のためにサーバーレスアーキテクチャを最大限に活用しています
- CloudWatchアラームを設定して、予期しないコスト増加を監視しています

## 運用

- CloudFormationスタックの更新は、変更セットを使用して計画・レビューされます
- インフラストラクチャの変更はCI/CDパイプラインを通じて自動的にテスト・デプロイされます
- CloudWatchダッシュボードを使用してシステムの健全性を監視します

## 障害復旧

- 重要なデータはバックアップされ、複数のアベイラビリティゾーンにレプリケートされます
- 障害発生時の手動およびAWS自動復旧メカニズムが設定されています 