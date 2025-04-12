# AI採用システム - API仕様

## 概要

AI採用システムのAPI仕様は、フロントエンドとバックエンドの間の契約を定義します。このディレクトリには、API仕様書とJSONスキーマが含まれています。

## 主要コンポーネント

- **[swagger.yaml](./swagger.yaml)**: OpenAPI 3.0形式のAPI仕様書
- **[schemas/](./schemas/)**: JSONスキーマ定義

## API概要

AI採用システムは以下の主要なAPIエンドポイントを提供します：

### 企業文化マッチングAPI

候補者と企業の文化適合性を評価します。

- **エンドポイント**: `POST /api/culture-matching`
- **リクエスト**:
  ```json
  {
    "candidateId": "c123456",
    "companyId": "comp789",
    "assessmentType": "comprehensive"
  }
  ```
- **レスポンス**:
  ```json
  {
    "matchScore": 85,
    "analysisDetails": {
      "strengths": ["チームワーク", "イノベーション思考"],
      "improvements": ["プロセス重視"],
      "recommendations": ["ロールに関する追加情報の提供"]
    }
  }
  ```

### 面接フィードバックAPI

面接のフィードバックを生成・分析します。

- **エンドポイント**: `POST /api/interview-feedback`
- **リクエスト**:
  ```json
  {
    "interviewId": "i789012",
    "transcript": "面接の書き起こしテキスト...",
    "questions": ["質問1", "質問2", "質問3"],
    "audioFeatures": {
      "tonality": [0.6, 0.3, 0.1],
      "speakingRate": 120,
      "pauses": [1.2, 0.8, 2.1]
    }
  }
  ```
- **レスポンス**:
  ```json
  {
    "overallScore": 82,
    "categoryScores": {
      "communication": 85,
      "technicalKnowledge": 80,
      "problemSolving": 78
    },
    "feedback": {
      "strengths": ["明確なコミュニケーション", "技術的背景の説明"],
      "improvements": ["具体的な例を増やす", "質問への直接的な回答"],
      "suggestions": ["STAR手法を使った回答構成の改善"]
    }
  }
  ```

### 採用予測API

候補者の採用可能性を予測します。

- **エンドポイント**: `POST /api/recruitment-prediction`
- **リクエスト**:
  ```json
  {
    "candidateId": "c123456",
    "positionId": "p456789",
    "resumeData": {
      "skills": ["Python", "機械学習", "データ分析"],
      "experience": 5,
      "education": "修士"
    },
    "interviewScores": [85, 78, 92],
    "cultureFitScore": 85
  }
  ```
- **レスポンス**:
  ```json
  {
    "hireChance": 0.78,
    "prediction": "採用",
    "confidenceScore": 0.82,
    "keyFactors": [
      {"factor": "技術スキル", "impact": 0.4},
      {"factor": "面接パフォーマンス", "impact": 0.3},
      {"factor": "文化適合性", "impact": 0.2}
    ]
  }
  ```

### 自動フォローアップAPI

応募者へのフォローアップを自動化します。

- **エンドポイント**: `POST /api/auto-followup`
- **リクエスト**:
  ```json
  {
    "candidateId": "c123456",
    "applicationStatus": "面接後",
    "lastInteractionDate": "2023-03-15",
    "customMessage": "追加情報のお願い"
  }
  ```
- **レスポンス**:
  ```json
  {
    "followupId": "f246810",
    "status": "送信予定",
    "scheduledDate": "2023-03-18",
    "messagePreview": "面接へのご参加ありがとうございました。次のステップとして..."
  }
  ```

## API使用方法

### 認証

すべてのAPIリクエストには認証が必要です。JWT認証を使用し、Authorizationヘッダーに Bearer トークンを含める必要があります：

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### エラーレスポンス

エラーが発生した場合、APIは適切なHTTPステータスコードと以下の形式のJSONレスポンスを返します：

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Invalid input data",
    "details": ["candidateId is required", "interviewScores must be an array"]
  }
}
```

## OpenAPIドキュメントの使用

OpenAPI仕様書は、Swagger UIを使用して視覚的に表示できます：

```bash
# Swagger UIのDockerイメージを使用して仕様書を表示
docker run -p 8080:8080 -e SWAGGER_JSON=/api/swagger.yaml -v $(pwd):/api swaggerapi/swagger-ui
```

その後、ブラウザで http://localhost:8080 にアクセスしてAPI仕様書を確認できます。

## 開発者向け情報

APIを実装または使用する開発者は、以下の点に注意してください：

1. すべてのリクエストとレスポンスはUTF-8エンコーディングを使用します
2. 日付と時刻はISO 8601形式（YYYY-MM-DDTHH:MM:SSZ）を使用します
3. ページネーションが必要なエンドポイントでは、`page`と`limit`クエリパラメータがサポートされています 