# NeoCrea AI採用システム - アーキテクチャ図

## システムアーキテクチャ概要

NeoCrea AI採用システムは、最新のAWSクラウドサービスを活用した完全サーバーレスアーキテクチャで構築されています。このドキュメントでは、システム全体のアーキテクチャと各コンポーネントの関係性を説明します。

```
                              +-------------------+
                              |    ユーザー       |
                              |  (採用担当者/     |
                              |   候補者)         |
                              +--------+----------+
                                       |
                                       | HTTPS
                                       |
                              +--------v----------+
                              |                   |
                              |   CloudFront      |
                              | ディストリビューション|
                              |                   |
                              +---------+---------+
                                        |
                      +----------------+v+----------------+
                      |                                   |
           +----------v----------+            +-----------v----------+
           |                     |            |                      |
           |    S3 バケット      |            |    API Gateway      |
           |   (フロントエンド)   |            |                      |
           |                     |            +----------+-----------+
           +---------------------+                       |
                                                +--------v--------+
                                                |                 |
                                                |  Cognito        |
                                                |  ユーザープール   |
                                                |                 |
                                                +-----------------+
                                                        |
                         +---------------------------+--+----------------------------------+
                         |                           |                                    |
              +----------v-----------+    +----------v-----------+          +------------v------------+
              |                      |    |                      |          |                         |
              | Lambda               |    | Lambda               |          | Lambda                  |
              | (候補者マッチング)    |    | (面接フィードバック)   |          | (採用予測)              |
              |                      |    |                      |          |                         |
              +----------+-----------+    +----------+-----------+          +-----------+-------------+
                         |                           |                                  |
                         |                           |                                  |
              +----------v-----------+    +----------v-----------+          +-----------v-------------+
              |                      |    |                      |          |                         |
              |  DynamoDB            |    |  S3                  |          |  DynamoDB               |
              |  (候補者データ)       |    |  (トランスクリプト)   |          |  (予測結果)             |
              |                      |    |                      |          |                         |
              +----------------------+    +----------+-----------+          +-------------------------+
                                                     |
                                          +----------v-----------+
                                          |                      |
                                          |  SageMaker           |
                                          |  エンドポイント        |
                                          |                      |
                                          +----------------------+

                          +----------------------------------------------+
                          |                                              |
                          |  Lambda                                      |
                          |  (自動フォローアップ)                         |
                          |                                              |
                          +---+------------------+---------------------+-+
                              |                  |                     |
                  +-----------v----------+ +-----v-------------+ +-----v-------------+
                  |                      | |                   | |                   |
                  |  DynamoDB            | |  SES              | |  DynamoDB         |
                  |  (候補者ステータス)   | |  (メール送信)      | |  (メール履歴)     |
                  |                      | |                   | |                   |
                  +----------------------+ +-------------------+ +-------------------+

                  +----------------------------------------------+
                  |                   CI/CD                      |
                  +----------------------------------------------+
                  |                                              |
          +-------v--------+   +-----------------+   +-----------v---------+
          |                |   |                 |   |                     |
          | CodePipeline   +-->| CodeBuild      +-->| CloudFormation      |
          |                |   |                 |   |                     |
          +----------------+   +-----------------+   +---------------------+
```

## コンポーネント詳細

### クライアント層

1. **ユーザー**:
   - 採用担当者: システムを使用して候補者を評価・管理
   - 候補者: 面接シミュレーターや自己評価ツールを使用

2. **Amazon CloudFront**:
   - グローバルなコンテンツ配信ネットワーク
   - WebアプリケーションへのHTTPS接続を提供
   - エッジロケーションを活用した高速応答
   - WAFとの統合によるセキュリティ強化

3. **Amazon S3 (フロントエンド)**:
   - Reactベースのシングルページアプリケーション(SPA)をホスティング
   - 静的コンテンツの安全な保存と配信
   - バージョニングによる変更管理

### 認証層

4. **Amazon Cognito**:
   - ユーザー登録と認証
   - JWTトークンの発行と管理
   - ソーシャルIDプロバイダー連携（オプション）
   - 多要素認証(MFA)のサポート

5. **API Gateway**:
   - RESTful APIエンドポイントの提供
   - Cognitoとの統合による認証
   - リクエスト検証とスロットリング
   - APIキーとAPIステージの管理

### バックエンド層

6. **Lambda関数**:
   - **候補者マッチング**: 求人要件と候補者プロファイルの適合性分析
   - **面接フィードバック**: 面接トランスクリプト分析と改善提案生成
   - **採用予測**: 候補者データから採用可能性を予測
   - **自動フォローアップ**: 候補者ステータス変更に基づく自動コミュニケーション

7. **DynamoDB**:
   - **候補者テーブル**: 応募者情報と状態管理
   - **求人テーブル**: 募集職種と要件
   - **面接テーブル**: 面接スケジュールと結果
   - **予測テーブル**: AIによる評価と推奨事項
   - **メール履歴テーブル**: 候補者とのコミュニケーション記録

8. **Amazon S3 (データ)**:
   - 面接トランスクリプトの保存
   - 候補者の提出書類（履歴書、ポートフォリオなど）
   - AIモデルの訓練データセット

### AI/ML層

9. **Amazon SageMaker**:
   - カスタムAIモデルのホスティング
   - 予測推論エンドポイント
   - モデルの自動トレーニングとチューニング
   - A/Bテストによるモデル評価

10. **Amazon Comprehend**:
    - 自然言語処理(NLP)分析
    - 面接応答からの感情分析
    - キーフレーズ抽出
    - カルチャーフィット評価

### 通知層

11. **Amazon SES**:
    - 候補者への自動メール送信
    - カスタマイズ可能なメールテンプレート
    - 配信ステータスの追跡
    - バウンスとクレーム管理

### CI/CD および運用

12. **AWS CodePipeline**:
    - 継続的インテグレーション/継続的デプロイメントパイプライン
    - ソースコード変更の自動検出と処理
    - テスト自動化

13. **AWS CodeBuild**:
    - フロントエンドのビルドとテスト
    - バックエンドLambda関数のパッケージング
    - AIモデルのビルドと検証

14. **AWS CloudFormation**:
    - インフラストラクチャのコード化(IaC)
    - 環境の一貫したプロビジョニング
    - リソース変更の追跡と管理

15. **Amazon CloudWatch**:
    - システム全体のログ収集と分析
    - メトリクスの監視とアラート
    - ダッシュボードによる可視化
    - 異常検出

## 処理フロー

### 1. 候補者応募プロセス

1. 候補者が採用サイトにアクセスし、ポジションに応募
2. フロントエンドアプリがAPI Gateway経由でLambda関数を呼び出し
3. Lambda関数が候補者情報をDynamoDBに保存
4. 自動フォローアップLambda関数がDynamoDBストリームをトリガーとして起動
5. フォローアップメールがSESを通じて候補者に送信
6. メール送信履歴がDynamoDBに記録

### 2. 面接フィードバック生成

1. 採用担当者が面接トランスクリプトをアップロード
2. トランスクリプトがS3に保存
3. Lambda関数が面接フィードバックAPIを呼び出し
4. APIがSageMakerエンドポイントを使用して分析を実行
5. 分析結果がDynamoDBに保存され、フロントエンドに返される

### 3. 採用予測

1. 採用担当者が候補者の採用可能性評価をリクエスト
2. Lambda関数が候補者データと求人要件を取得
3. AIモデルが候補者スキル、面接結果、文化適合性を総合的に分析
4. 予測結果と推奨事項がDynamoDBに保存され、フロントエンドに表示

## スケーラビリティと高可用性

- **水平スケーリング**: サーバーレスアーキテクチャによる自動スケーリング
- **リージョナルレジリエンス**: 複数のアベイラビリティゾーンにまたがるデプロイ
- **DynamoDBのグローバルテーブル**: 必要に応じて複数リージョンへのレプリケーション
- **CloudFrontのグローバル配信**: ユーザーに最も近いエッジロケーションからのコンテンツ配信

## セキュリティ対策

- **ネットワークセキュリティ**: CloudFrontとWAFによる保護
- **認証と認可**: CognitoとIAMによるアクセス制御
- **データ保護**: 保存データと転送データの暗号化
- **分離**: マイクロサービスアーキテクチャによる影響範囲の限定
- **監視**: CloudWatchとGuardDutyによる継続的な監視

## まとめ

NeoCrea AI採用システムのアーキテクチャは、最新のAWSクラウドサービスを活用した完全サーバーレス設計を採用しています。このアーキテクチャにより、高いスケーラビリティ、信頼性、セキュリティを確保しながら、運用コストの最適化を実現しています。

AIモデルと従来の採用プロセスを統合することで、データ駆動型の意思決定と効率的な採用活動をサポートし、より良い採用結果につなげています。