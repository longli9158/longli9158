# NeoCrea AI採用システム デプロイガイド

## 概要

このガイドでは、NeoCrea AI採用システムをAWS環境にデプロイする方法について説明します。システムは以下の主要コンポーネントで構成されています：

1. フロントエンド（React.js）
2. バックエンドAPI（AWS Lambda + API Gateway）
3. データベース（Amazon DynamoDB）
4. AIモデル（Amazon SageMaker）
5. 認証（Amazon Cognito）
6. CI/CD（AWS CodePipeline）

## 前提条件

デプロイを開始する前に、以下のツールとリソースが利用可能であることを確認してください：

- **AWS CLI**: インストール済みで、適切に設定されていること
- **AWS アカウント**: AWS環境へのアクセス権があること
- **AWS IAM権限**: CloudFormationスタックをデプロイする権限があること
- **GitHub アカウント**: CI/CDパイプラインのソースコード用（オプション）
- **ドメイン名**: カスタムドメインを使用する場合（オプション）

## デプロイ手順

### ステップ1: 環境変数の設定

以下の環境変数を設定します。これらの値はCloudFormationスタックのデプロイに使用されます。

```bash
# デプロイ環境
export ENVIRONMENT=Development  # または Staging, Production

# ネットワーク設定
export VPC_ID=vpc-xxxxxxxx
export SUBNET_IDS=subnet-xxxxxxxx,subnet-yyyyyyyy

# ドメイン設定（オプション）
export DOMAIN_NAME=example.com
export ACM_CERTIFICATE_ARN=arn:aws:acm:REGION:ACCOUNT_ID:certificate/xxxxxxxx

# CI/CD設定（オプション）
export GITHUB_OWNER=your-username
export GITHUB_REPO=ai-recruitment-system
export GITHUB_BRANCH=main
export GITHUB_TOKEN=your-github-token
export NOTIFICATION_EMAIL=your-email@example.com
```

### ステップ2: インフラストラクチャのデプロイ

CloudFormationテンプレートを使用して、基本的なインフラストラクチャをデプロイします。

```bash
# CloudFormationスタックのデプロイ
aws cloudformation deploy \
  --template-file cloudformation-template.yaml \
  --stack-name ai-recruitment-system \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    Environment=${ENVIRONMENT} \
    VpcId=${VPC_ID} \
    SubnetIds=${SUBNET_IDS} \
    DomainName=${DOMAIN_NAME:-""} \
    AcmCertificateArn=${ACM_CERTIFICATE_ARN:-""} \
    SenderEmailAddress=recruitment@example.com \
    SageMakerEndpointName=interview-feedback-endpoint

# デプロイされたスタックの出力を確認
aws cloudformation describe-stacks \
  --stack-name ai-recruitment-system \
  --query "Stacks[0].Outputs" \
  --output table
```

### ステップ3: システムパラメータの保存

CloudFormationスタックの出力値をSSMパラメータストアに保存します。これにより、CI/CDパイプラインがこれらの値を参照できるようになります。

```bash
# スタック出力をJSON形式で取得
OUTPUTS=$(aws cloudformation describe-stacks --stack-name ai-recruitment-system --query "Stacks[0].Outputs" --output json)

# 必要なパラメータをSSMに保存
aws ssm put-parameter --name "/ai-recruitment-system/ApiEndpoint" --value $(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="ApiEndpoint") | .OutputValue') --type String --overwrite
aws ssm put-parameter --name "/ai-recruitment-system/UserPoolId" --value $(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="UserPoolId") | .OutputValue') --type String --overwrite
aws ssm put-parameter --name "/ai-recruitment-system/UserPoolClientId" --value $(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="UserPoolClientId") | .OutputValue') --type String --overwrite
aws ssm put-parameter --name "/ai-recruitment-system/FrontendBucketName" --value $(echo $OUTPUTS | jq -r '.[] | select(.OutputKey=="FrontendBucketName") | .OutputValue') --type String --overwrite
```

### ステップ4: CI/CDパイプラインのデプロイ（オプション）

自動デプロイを設定するために、CI/CDパイプラインをデプロイします。

```bash
# CI/CDパイプラインのデプロイ
aws cloudformation deploy \
  --template-file codepipeline.yaml \
  --stack-name ai-recruitment-cicd \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameter-overrides \
    StackName=ai-recruitment-system \
    Environment=${ENVIRONMENT} \
    GitHubOwner=${GITHUB_OWNER} \
    GitHubRepo=${GITHUB_REPO} \
    GitHubBranch=${GITHUB_BRANCH} \
    GitHubToken=${GITHUB_TOKEN} \
    NotificationEmail=${NOTIFICATION_EMAIL:-""}

# パイプラインの出力を確認
aws cloudformation describe-stacks \
  --stack-name ai-recruitment-cicd \
  --query "Stacks[0].Outputs" \
  --output table
```

### ステップ5: 初期データのセットアップ（オプション）

DynamoDBテーブルに初期データをロードします。

```bash
# 候補者テーブルに初期データをロード
aws dynamodb batch-write-item --request-items file://setup/candidates_seed.json

# 求人テーブルに初期データをロード
aws dynamodb batch-write-item --request-items file://setup/jobs_seed.json

# その他必要なテーブルにデータをロード
```

### ステップ6: SageMakerエンドポイントのデプロイ（オプション）

SageMakerエンドポイントを手動でデプロイする場合は、以下の手順に従います。

```bash
# SageMakerモデルをデプロイ
cd ai_model/scripts
python deploy_sagemaker_model.py \
  --model-name interview-feedback-model \
  --endpoint-name interview-feedback-endpoint \
  --region ${AWS_REGION:-"us-east-1"} \
  --instance-type ml.m5.large \
  --execution-role-arn $(aws cloudformation describe-stacks --stack-name ai-recruitment-system --query "Stacks[0].Outputs[?OutputKey=='SageMakerExecutionRoleArn'].OutputValue" --output text)
```

## デプロイ後の検証

デプロイが成功したことを確認するために、以下の検証ステップを実行します：

1. **APIエンドポイントの検証**:
   ```bash
   curl -X GET $(aws ssm get-parameter --name "/ai-recruitment-system/ApiEndpoint" --query "Parameter.Value" --output text)/health
   ```

2. **Cognitoユーザープールの検証**:
   ```bash
   aws cognito-idp describe-user-pool \
     --user-pool-id $(aws ssm get-parameter --name "/ai-recruitment-system/UserPoolId" --query "Parameter.Value" --output text)
   ```

3. **フロントエンドの検証**:
   - CloudFrontディストリビューションのURLにアクセス
   - ログイン機能をテスト
   - 主要な機能が正常に動作することを確認

## トラブルシューティング

デプロイ中に問題が発生した場合は、以下を確認してください：

1. **CloudFormationスタックのエラー**:
   ```bash
   aws cloudformation describe-stack-events \
     --stack-name ai-recruitment-system \
     --query "StackEvents[?ResourceStatus=='CREATE_FAILED']"
   ```

2. **Lambda関数のログ**:
   ```bash
   aws logs get-log-events \
     --log-group-name /aws/lambda/ai-recruitment-system-<function-name> \
     --log-stream-name <log-stream-name>
   ```

3. **API Gatewayのログ**:
   CloudWatchコンソールでAPI Gatewayのログを確認

4. **S3バケットのアクセス**:
   S3バケットポリシーとIAM権限を確認

## セキュリティベストプラクティス

1. **IAM権限の最小化**:
   - 各Lambdaおよびサービスに最小限の権限を付与
   - IAMポリシーを定期的に見直し

2. **データ暗号化**:
   - S3のサーバーサイド暗号化が有効になっていることを確認
   - DynamoDBテーブルの暗号化が有効になっていることを確認

3. **APIセキュリティ**:
   - Cognitoによる認証が正しく設定されていることを確認
   - WAFルールを適用して、APIを保護

4. **監視とアラート**:
   - CloudWatchアラームを設定して、異常なアクティビティを検出
   - CloudTrailを有効にして、API呼び出しを監視

## システム更新手順

システムを更新する場合は、以下の手順に従います：

1. コードの変更をGitHubリポジトリにプッシュ
2. CI/CDパイプラインが自動的に変更を検出し、デプロイ
3. 必要に応じて、CloudFormationテンプレートを手動で更新

```bash
aws cloudformation update-stack \
  --stack-name ai-recruitment-system \
  --template-body file://cloudformation-template.yaml \
  --capabilities CAPABILITY_NAMED_IAM \
  --parameters ParameterKey=Environment,ParameterValue=${ENVIRONMENT}
```

## バックアップと復元

1. **DynamoDBテーブルのバックアップ**:
   ```bash
   aws dynamodb create-backup \
     --table-name ai-recruitment-system-Candidates \
     --backup-name candidates-backup-$(date +%Y%m%d)
   ```

2. **S3バケットのバックアップ**:
   ```bash
   aws s3 sync s3://ai-recruitment-system-frontend-${AWS_ACCOUNT_ID} s3://backup-bucket/frontend-backup-$(date +%Y%m%d)
   ```

3. **復元手順**:
   - DynamoDBバックアップから復元
   - S3バケットのデータを復元

## 結論

このデプロイガイドに従うことで、NeoCrea AI採用システムを安全かつ効率的にAWS環境にデプロイすることができます。問題が発生した場合は、トラブルシューティングセクションを参照してください。また、定期的にシステムの更新とセキュリティレビューを行うことをお勧めします。