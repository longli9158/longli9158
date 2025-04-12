#!/bin/bash
# バックエンドLambda関数のパッケージング・デプロイスクリプト

# 設定変数
DEPLOYMENT_BUCKET="neocrea-lambda-deployment"
REGION="ap-northeast-1"
STACK_NAME="ai-recruitment-system"

# カラー表示の設定
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

# 情報メッセージ
info() {
  echo -e "${GREEN}INFO: $1${NC}"
}

# 警告メッセージ
warn() {
  echo -e "${YELLOW}WARNING: $1${NC}"
}

# エラーメッセージ
error() {
  echo -e "${RED}ERROR: $1${NC}"
}

# スクリプトの開始
info "Lambda関数のパッケージングを開始します"

# デプロイバケットが存在しない場合は作成
if ! aws s3api head-bucket --bucket $DEPLOYMENT_BUCKET 2>/dev/null; then
  info "デプロイバケット '$DEPLOYMENT_BUCKET' を作成します"
  aws s3 mb s3://$DEPLOYMENT_BUCKET --region $REGION
  
  if [ $? -ne 0 ]; then
    error "バケットの作成に失敗しました。スクリプトを終了します。"
    exit 1
  fi
  
  # バケットバージョニングを有効化
  aws s3api put-bucket-versioning \
    --bucket $DEPLOYMENT_BUCKET \
    --versioning-configuration Status=Enabled
    
  # バケットのライフサイクルポリシーを設定
  aws s3api put-bucket-lifecycle-configuration \
    --bucket $DEPLOYMENT_BUCKET \
    --lifecycle-configuration file://$(dirname "$0")/lifecycle-policy.json
fi

# ビルドディレクトリの作成
BUILD_DIR="./build"
rm -rf $BUILD_DIR
mkdir -p $BUILD_DIR

# 各Lambda関数をパッケージング
for func_dir in src/lambda/*/; do
  func_name=$(basename $func_dir)
  info "パッケージング中: $func_name"
  
  # 一時ディレクトリの作成
  mkdir -p $BUILD_DIR/$func_name
  
  # 関数コードとpackage.jsonをコピー
  cp -r $func_dir/* $BUILD_DIR/$func_name/
  cp package.json $BUILD_DIR/$func_name/ 2>/dev/null || warn "package.jsonが見つかりません"
  
  # node_modulesが既に存在する場合
  if [ -d "node_modules" ]; then
    info "$func_name: 依存関係をコピー中"
    mkdir -p $BUILD_DIR/$func_name/node_modules
    
    # package.jsonの依存関係を取得してコピー
    if [ -f "$BUILD_DIR/$func_name/package.json" ]; then
      dependencies=$(node -e "const pkg=require('./$BUILD_DIR/$func_name/package.json'); console.log(Object.keys(pkg.dependencies || {}).concat(Object.keys(pkg.devDependencies || {})).join(' '))")
      
      for dep in $dependencies; do
        if [ -d "node_modules/$dep" ]; then
          cp -r node_modules/$dep $BUILD_DIR/$func_name/node_modules/
        else
          warn "$func_name: 依存関係 '$dep' がnode_modulesディレクトリに見つかりません"
        fi
      done
    else
      warn "$func_name: package.jsonが見つからないため、すべての依存関係をコピーします"
      cp -r node_modules/* $BUILD_DIR/$func_name/node_modules/
    fi
  else
    warn "node_modulesディレクトリが見つかりません。npm installを実行してください。"
  fi
  
  # ZIPファイルの作成
  info "$func_name: ZIPファイルを作成中"
  (cd $BUILD_DIR/$func_name && zip -r ../$func_name.zip . -x "*.git*" "*.DS_Store" "*.log")
  
  if [ $? -ne 0 ]; then
    error "$func_name: ZIPファイルの作成に失敗しました"
    continue
  fi
  
  # S3にアップロード
  info "$func_name: ZIPファイルをS3にアップロード中"
  aws s3 cp $BUILD_DIR/$func_name.zip s3://$DEPLOYMENT_BUCKET/lambda/$func_name.zip --region $REGION
  
  if [ $? -ne 0 ]; then
    error "$func_name: S3へのアップロードに失敗しました"
    continue
  fi
  
  info "$func_name: 正常にパッケージングされ、s3://$DEPLOYMENT_BUCKET/lambda/$func_name.zip にアップロードされました"
  
  # Lambda関数が既に存在する場合は更新
  if aws lambda get-function --function-name $STACK_NAME-$func_name --region $REGION 2>/dev/null; then
    info "$func_name: Lambda関数を更新中"
    aws lambda update-function-code \
      --function-name $STACK_NAME-$func_name \
      --s3-bucket $DEPLOYMENT_BUCKET \
      --s3-key lambda/$func_name.zip \
      --region $REGION \
      --publish
      
    if [ $? -ne 0 ]; then
      error "$func_name: Lambda関数の更新に失敗しました"
    else
      info "$func_name: Lambda関数が正常に更新されました"
    fi
  else
    warn "$func_name: Lambda関数が存在しません。CloudFormationでデプロイしてください。"
  fi
done

# ライフサイクルポリシーファイルの作成
cat > $(dirname "$0")/lifecycle-policy.json << EOL
{
  "Rules": [
    {
      "ID": "DeleteOldVersions",
      "Status": "Enabled",
      "Prefix": "lambda/",
      "NoncurrentVersionExpiration": {
        "NoncurrentDays": 30
      }
    }
  ]
}
EOL

info "すべてのLambda関数のパッケージングが完了しました！"