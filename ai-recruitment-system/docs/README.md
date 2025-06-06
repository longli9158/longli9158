# AI採用システム - ドキュメント

## 概要

このディレクトリには、AI採用システムに関する技術ドキュメント、ユーザーガイド、および開発者ガイドが含まれています。

## 主要ドキュメント

- **[architecture-diagram.png](./architecture-diagram.png)**: システムアーキテクチャの図
- **[user-guide.md](./user-guide.md)**: エンドユーザー向けガイド
- **[developer-guide.md](./developer-guide.md)**: 開発者向けガイド

## システムアーキテクチャ

![AI採用システムアーキテクチャ](./architecture-diagram.png)

AI採用システムは、モダンなマイクロサービスアーキテクチャに基づいて設計されています。主要なコンポーネントは以下の通りです：

1. **フロントエンドアプリケーション**: React.jsで構築され、S3とCloudFrontでホスティングされています
2. **バックエンドAPI**: AWS Lambda関数を使用し、API Gatewayを通じて公開されています
3. **AIモデル**: Amazon SageMakerでホストされた機械学習モデル
4. **データストレージ**: Amazon DynamoDBと Amazon S3を使用
5. **認証・認可**: Amazon Cognitoを使用

## ユーザーガイド

ユーザーガイドには、AI採用システムの以下の機能に関する詳細な説明が含まれています：

- 企業文化マッチング分析の使用方法
- 面接シミュレーターの操作手順
- 候補者ポータルの使用方法
- 採用分析ダッシュボードの解釈

詳細は[ユーザーガイド](./user-guide.md)を参照してください。

## 開発者ガイド

開発者ガイドには、AI採用システムの開発とカスタマイズに必要な情報が含まれています：

- 開発環境のセットアップ
- フロントエンド開発ワークフロー
- バックエンドAPI開発
- AIモデルのトレーニングとデプロイ
- テスト戦略
- CI/CDパイプライン
- コード品質とレビュープロセス

詳細は[開発者ガイド](./developer-guide.md)を参照してください。

## ドキュメント作成ガイドライン

新しいドキュメントを作成または既存のドキュメントを更新する際は、以下のガイドラインに従ってください：

1. Markdownを使用して文書を作成する
2. 各ドキュメントには目次を含める
3. 複雑な概念は図表を使用して説明する
4. コード例を提供する場合は、適切な言語の構文ハイライトを使用する
5. APIドキュメントはOpenAPI仕様に従う
6. すべてのリンクが有効であることを確認する

## 貢献方法

ドキュメントの改善に貢献するには：

1. このリポジトリをフォークする
2. 新しいブランチを作成する（`git checkout -b docs/improve-user-guide`）
3. 変更を加える
4. 変更をコミットする（`git commit -m 'Improve user guide with better examples'`）
5. ブランチをプッシュする（`git push origin docs/improve-user-guide`）
6. プルリクエストを開く 