# NeoCrea AI採用システム

## プロジェクト概要

NeoCrea AI採用システムは、最新の人工知能技術を活用して採用プロセスを効率化・高度化するためのプラットフォームです。このシステムは以下の主要機能を提供します：

- **企業文化マッチング分析**: 候補者のプロファイルと企業文化の適合性を評価
- **面接シミュレーター**: AIを活用した面接練習と自動フィードバック
- **候補者ポータル**: 応募者向けの統合インターフェース
- **採用分析ダッシュボード**: 採用データの可視化と意思決定支援
- **自動フォローアップ**: 候補者ステータスに基づく自動コミュニケーション

## 使用技術

- **フロントエンド**: React.js, Redux, Material-UI, TypeScript
- **バックエンド**: AWS Lambda, API Gateway, DynamoDB
- **AI/ML**: TensorFlow/PyTorch, AWS SageMaker, Amazon Comprehend
- **インフラ**: AWS CloudFormation, AWS CodePipeline, CloudFront, S3
- **認証**: Amazon Cognito
- **通知**: Amazon SES

## ディレクトリ構造

```
ai-recruitment-system/
├── .github/                            # GitHub Actions設定
├── frontend/                           # フロントエンドアプリケーション
│   ├── public/
│   ├── src/
│   │   ├── components/                 # UIコンポーネント
│   │   │   ├── CultureMatchingDashboard.jsx   # 企業文化マッチング分析UI
│   │   │   ├── InterviewSimulator.jsx         # 面接シミュレーターUI
│   │   │   ├── CandidatePortal.jsx            # 候補者ポータルUI
│   │   │   └── RecruitmentAnalyticsDashboard.jsx # 採用分析ダッシュボード
│   │   ├── hooks/                     # カスタムフック
│   │   ├── context/                   # Reactコンテキスト
│   │   ├── pages/                     # ページコンポーネント
│   │   ├── services/                  # APIサービス
│   │   ├── utils/                     # ユーティリティ関数
│   │   ├── App.jsx                    # アプリルート
│   │   └── index.jsx                  # エントリーポイント
│   ├── package.json
│   ├── buildspec.yml                  # フロントエンドビルド設定
│   └── README.md
├── backend/                           # バックエンドサービス
│   ├── src/
│   │   ├── lambda/                    # Lambda関数
│   │   │   ├── auto-follow-up/        # 自動フォローアップ
│   │   │   ├── culture-matching/      # 文化マッチングAPI
│   │   │   ├── interview-feedback/    # 面接フィードバックAPI
│   │   │   ├── candidate-matching/    # 候補者マッチングAPI
│   │   │   └── recruitment-prediction/ # 採用予測API
│   │   ├── lib/                       # 共通ライブラリ
│   │   └── utils/                     # ユーティリティ関数
│   ├── package.json
│   ├── buildspec.yml                  # バックエンドデプロイ設定
│   └── README.md
├── ai_model/                          # AIモデル
│   ├── src/
│   │   ├── culture_matching_model.py  # 文化マッチングモデル
│   │   ├── interview_feedback_model.py # 面接フィードバックモデル
│   │   └── recruitment_prediction_model.py # 採用予測モデル
│   ├── scripts/
│   │   ├── train_culture_matching_model.py # トレーニングスクリプト
│   │   ├── train_interview_feedback_model.py
│   │   └── train_recruitment_prediction_model.py
│   ├── notebooks/                     # Jupyter Notebooks
│   ├── data/                          # サンプルデータ
│   ├── requirements.txt
│   ├── buildspec.yml                  # モデルトレーニング設定
│   └── README.md
├── infrastructure/                    # インフラストラクチャコード
│   ├── cloudformation-template.yaml   # メインインフラ定義
│   ├── codepipeline.yaml             # CI/CDパイプライン定義
│   ├── deployment-guide.md           # デプロイガイド
│   ├── cost-optimization.md          # コスト最適化戦略
│   ├── security-best-practices.md    # セキュリティベストプラクティス
│   ├── architecture-diagram.md       # アーキテクチャ図と説明
│   └── README.md                     # インフラ概要
├── api/                              # API仕様
│   ├── schemas/                      # JSONスキーマ
│   └── swagger.yaml                  # API仕様書
├── docs/                             # ドキュメント
│   ├── architecture-diagram.png      # アーキテクチャ図
│   ├── user-guide.md                 # ユーザーガイド
│   └── developer-guide.md            # 開発者ガイド
└── README.md                         # プロジェクト概要
```

## 主要機能の説明

### 1. 企業文化マッチング分析

企業の文化的価値観と候補者の価値観・行動特性の適合性を分析します。

- **使用技術**: Amazon Comprehend, カスタムTensorFlowモデル
- **主要コンポーネント**: 
  - `culture-matching` Lambda関数
  - `CultureMatchingDashboard` React コンポーネント

```python
# 企業文化マッチングモデルの例（簡略化）
def analyze_culture_fit(candidate_data, company_values):
    # 候補者の経験からキーワードを抽出
    candidate_keywords = extract_keywords_from_experience(candidate_data)
    
    # 会社の価値観との適合度を計算
    match_score = calculate_semantic_similarity(candidate_keywords, company_values)
    
    # 詳細な適合性分析を生成
    detailed_analysis = generate_fit_analysis(candidate_data, company_values, match_score)
    
    return {
        'overallScore': match_score,
        'detailedAnalysis': detailed_analysis
    }
```

### 2. 面接フィードバック生成

面接のトランスクリプトを分析し、候補者への詳細なフィードバックを生成します。

- **使用技術**: AWS SageMaker, Amazon Comprehend, BERT/GPT
- **主要コンポーネント**: 
  - `interview-feedback` Lambda関数
  - Interview Feedback SageMakerモデル

```javascript
// 面接フィードバック生成の例（簡略化）
async function generateFeedback(transcript, questions) {
  try {
    // SageMakerエンドポイントに送信するデータを準備
    const payload = {
      transcript,
      questions
    };
    
    // SageMakerエンドポイントを呼び出す
    const response = await sageMaker.invokeEndpoint({
      EndpointName: process.env.SAGEMAKER_ENDPOINT_NAME,
      Body: JSON.stringify(payload),
      ContentType: 'application/json'
    }).promise();
    
    return JSON.parse(Buffer.from(response.Body).toString());
  } catch (error) {
    console.error('フィードバック生成エラー:', error);
    throw error;
  }
}
```

### 3. 採用予測

候補者のプロファイル、スキル、面接結果を分析し、採用可能性を予測します。

- **使用技術**: TensorFlow, AWS Lambda, DynamoDB
- **主要コンポーネント**: 
  - `recruitment-prediction` Lambda関数
  - カスタム予測モデル

```javascript
// 採用予測の例（簡略化）
async function predictRecruitmentSuccess(candidateId, jobId) {
  // 候補者データと求人要件を取得
  const candidateData = await getCandidateData(candidateId);
  const jobRequirements = await getJobRequirements(jobId);
  
  // 各予測要素を計算
  const skillMatchScore = calculateSkillMatch(candidateData, jobRequirements);
  const cultureFitScore = await analyzeCultureFit(candidateData, jobRequirements);
  const interviewScore = await analyzeInterviewResults(candidateId);
  
  // 総合スコアを計算
  const overallScore = calculateOverallScore(
    skillMatchScore,
    cultureFitScore,
    interviewScore
  );
  
  // 予測理由を生成
  const predictionReasons = generatePredictionReasons(
    skillMatchScore, 
    cultureFitScore,
    interviewScore
  );
  
  return {
    score: overallScore,
    recommendation: overallScore > 0.7 ? '採用推奨' : '要検討',
    reasons: predictionReasons
  };
}
```

### 4. 自動フォローアップ

候補者のステータス変更に基づいて、自動的にフォローアップメールを送信します。

- **使用技術**: AWS Lambda, DynamoDB Streams, Amazon SES
- **主要コンポーネント**: 
  - `auto-follow-up` Lambda関数
  - メールテンプレート

```javascript
// 自動フォローアップの例（簡略化）
exports.handler = async (event) => {
  const followUpResults = [];
  
  // DynamoDBストリームからの各レコードを処理
  for (const record of event.Records) {
    const newImage = record.dynamodb.NewImage;
    const oldImage = record.dynamodb.OldImage;
    
    // レコードが更新されていない場合はスキップ
    if (!newImage || !oldImage) continue;
    
    const newItem = AWS.DynamoDB.Converter.unmarshall(newImage);
    const oldItem = AWS.DynamoDB.Converter.unmarshall(oldImage);
    
    // 候補者のステータスが変更された場合のみ処理
    if (newItem.status !== oldItem.status) {
      console.log(`候補者 ${newItem.candidateId} のステータスが ${oldItem.status} から ${newItem.status} に変更されました`);
      
      // ステータスに基づいてフォローアップメールを送信
      const result = await sendFollowUpEmail(newItem);
      followUpResults.push(result);
    }
  }
  
  return {
    statusCode: 200,
    body: JSON.stringify({
      message: '自動フォローアップ処理が完了しました',
      results: followUpResults
    })
  };
};
```

## 開発環境のセットアップ

### 前提条件

- Node.js 14.x以上
- Python 3.8以上
- AWS CLI
- AWS SAM CLI

### フロントエンド

```bash
cd frontend
npm install
npm start
```

### バックエンド

```bash
cd backend
npm install
npm run build
```

### AIモデル

```bash
cd ai_model
pip install -r requirements.txt
```

## AWSへのデプロイ

詳細なデプロイ手順は [デプロイガイド](./infrastructure/deployment-guide.md) を参照してください。基本的な手順は以下の通りです：

1. AWS環境設定
2. CloudFormationテンプレートのデプロイ
3. CI/CDパイプラインのセットアップ（オプション）
4. フロントエンドのデプロイ
5. バックエンドのデプロイ
6. AIモデルのデプロイ
7. 動作確認

## アーキテクチャ

システムアーキテクチャの詳細は [アーキテクチャ図](./infrastructure/architecture-diagram.md) を参照してください。

## セキュリティとコスト最適化

- セキュリティベストプラクティスは [セキュリティガイド](./infrastructure/security-best-practices.md) を参照してください。
- コスト最適化戦略については [コスト最適化ガイド](./infrastructure/cost-optimization.md) を参照してください。

## 貢献ガイドライン

1. このリポジトリをフォークする
2. 機能ブランチを作成する (`git checkout -b feature/amazing-feature`)
3. 変更をコミットする (`git commit -m 'Add some amazing feature'`)
4. ブランチをプッシュする (`git push origin feature/amazing-feature`)
5. プルリクエストを開く

## ライセンス

このプロジェクトは[MITライセンス](LICENSE)の下で公開されています。