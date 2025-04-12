#!/usr/bin/env python
# -*- coding: utf-8 -*-

"""
NeoCrea - 候補者マッチングモデルトレーニングパイプライン
このスクリプトは求人と候補者のマッチングに使用する機械学習モデルをトレーニングします。
"""

import os
import json
import logging
import argparse
import pandas as pd
import numpy as np
import boto3
import pickle
from datetime import datetime
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split, GridSearchCV
from sklearn.metrics import accuracy_score, precision_score, recall_score, f1_score
from sklearn.ensemble import RandomForestClassifier
import xgboost as xgb
from pathlib import Path

# ロギング設定
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

class CandidateMatchingModel:
    """
    求人と候補者のマッチングを予測するモデル
    """
    
    def __init__(self, model_type='xgboost', model_params=None):
        """
        モデルの初期化
        
        Args:
            model_type (str): 使用するモデル種類 ('xgboost' または 'random_forest')
            model_params (dict): モデルのハイパーパラメータ
        """
        self.model_type = model_type
        self.model_params = model_params or {}
        self.model = None
        self.feature_scaler = StandardScaler()
        
    def preprocess_data(self, data):
        """
        データの前処理
        
        Args:
            data (pd.DataFrame): 生データ
            
        Returns:
            pd.DataFrame: 前処理済みデータ
        """
        logger.info("データ前処理を開始します")
        
        # 欠損値の処理
        for col in data.columns:
            if data[col].dtype == 'object':
                data[col] = data[col].fillna('')
            else:
                data[col] = data[col].fillna(data[col].median())
        
        # カテゴリ変数の処理（One-Hot エンコーディング）
        categorical_cols = [
            col for col in data.columns 
            if data[col].dtype == 'object' and col != 'match_result'
        ]
        
        if categorical_cols:
            data = pd.get_dummies(data, columns=categorical_cols, drop_first=True)
        
        logger.info(f"前処理完了: {data.shape[0]} 行, {data.shape[1]} 列")
        return data
    
    def split_features_target(self, data):
        """
        特徴量とターゲット変数に分割
        
        Args:
            data (pd.DataFrame): 前処理済みデータ
            
        Returns:
            tuple: (X, y) - 特徴量とターゲット変数
        """
        if 'match_result' not in data.columns:
            raise ValueError("データセットにターゲット変数 'match_result' が含まれていません")
        
        X = data.drop('match_result', axis=1)
        y = data['match_result']
        
        return X, y
    
    def train(self, X_train, y_train):
        """
        モデルのトレーニング
        
        Args:
            X_train (pd.DataFrame): トレーニング特徴量
            y_train (pd.Series): トレーニングターゲット
            
        Returns:
            object: トレーニング済みモデル
        """
        logger.info(f"{self.model_type} モデルのトレーニングを開始します")
        
        # 特徴量のスケーリング
        X_train_scaled = self.feature_scaler.fit_transform(X_train)
        
        # モデルの選択とトレーニング
        if self.model_type == 'xgboost':
            # XGBoostのデフォルトパラメータ
            default_params = {
                'learning_rate': 0.1,
                'max_depth': 6,
                'min_child_weight': 1,
                'gamma': 0,
                'subsample': 0.8,
                'colsample_bytree': 0.8,
                'objective': 'binary:logistic',
                'n_estimators': 100,
                'eval_metric': 'logloss'
            }
            
            # ユーザー指定パラメータで上書き
            params = {**default_params, **self.model_params}
            self.model = xgb.XGBClassifier(**params)
            
        elif self.model_type == 'random_forest':
            # RandomForestのデフォルトパラメータ
            default_params = {
                'n_estimators': 100,
                'max_depth': 10,
                'min_samples_split': 2,
                'min_samples_leaf': 1,
                'random_state': 42
            }
            
            # ユーザー指定パラメータで上書き
            params = {**default_params, **self.model_params}
            self.model = RandomForestClassifier(**params)
            
        else:
            raise ValueError(f"サポートされていないモデルタイプです: {self.model_type}")
        
        # モデルのトレーニング
        self.model.fit(X_train_scaled, y_train)
        logger.info("モデルトレーニングが完了しました")
        
        return self.model
    
    def evaluate(self, X_test, y_test):
        """
        モデルの評価
        
        Args:
            X_test (pd.DataFrame): テスト特徴量
            y_test (pd.Series): テストターゲット
            
        Returns:
            dict: 評価メトリクス
        """
        if self.model is None:
            raise ValueError("モデルがトレーニングされていません。先に train() メソッドを実行してください。")
        
        logger.info("モデル評価を開始します")
        
        # 特徴量のスケーリング
        X_test_scaled = self.feature_scaler.transform(X_test)
        
        # 予測
        y_pred = self.model.predict(X_test_scaled)
        
        # メトリクスの計算
        metrics = {
            'accuracy': accuracy_score(y_test, y_pred),
            'precision': precision_score(y_test, y_pred, average='weighted'),
            'recall': recall_score(y_test, y_pred, average='weighted'),
            'f1_score': f1_score(y_test, y_pred, average='weighted')
        }
        
        logger.info(f"評価結果: {metrics}")
        return metrics
    
    def save_model(self, model_dir):
        """
        モデルの保存
        
        Args:
            model_dir (str): モデルを保存するディレクトリパス
            
        Returns:
            str: 保存したモデルのパス
        """
        if self.model is None:
            raise ValueError("モデルがトレーニングされていません。先に train() メソッドを実行してください。")
        
        # ディレクトリの作成（存在しない場合）
        os.makedirs(model_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        model_filename = f"candidate_matching_model_{self.model_type}_{timestamp}.pkl"
        model_path = os.path.join(model_dir, model_filename)
        
        # モデルとスケーラーを辞書として保存
        model_data = {
            'model': self.model,
            'scaler': self.feature_scaler,
            'model_type': self.model_type,
            'features': self.feature_names if hasattr(self, 'feature_names') else None,
            'metadata': {
                'created_at': timestamp,
                'model_params': self.model_params
            }
        }
        
        with open(model_path, 'wb') as f:
            pickle.dump(model_data, f)
        
        logger.info(f"モデルを保存しました: {model_path}")
        return model_path
    
    @classmethod
    def load_model(cls, model_path):
        """
        保存されたモデルのロード
        
        Args:
            model_path (str): モデルファイルのパス
            
        Returns:
            CandidateMatchingModel: ロードされたモデルインスタンス
        """
        with open(model_path, 'rb') as f:
            model_data = pickle.load(f)
        
        # モデルインスタンスの作成
        instance = cls(model_type=model_data['model_type'])
        instance.model = model_data['model']
        instance.feature_scaler = model_data['scaler']
        
        if 'features' in model_data and model_data['features'] is not None:
            instance.feature_names = model_data['features']
        
        logger.info(f"モデルをロードしました: {model_path}")
        return instance
    
    def predict(self, features):
        """
        新しいデータで予測を実行
        
        Args:
            features (pd.DataFrame): 予測用特徴量
            
        Returns:
            np.array: 予測結果
        """
        if self.model is None:
            raise ValueError("モデルがトレーニングされていません。先に train() メソッドを実行してください。")
        
        # 特徴量のスケーリング
        features_scaled = self.feature_scaler.transform(features)
        
        # 予測確率
        probabilities = self.model.predict_proba(features_scaled)
        
        # 予測クラス
        predictions = self.model.predict(features_scaled)
        
        return {'class': predictions, 'probability': probabilities}
    
    def upload_to_s3(self, model_path, bucket_name, s3_key_prefix='models/'):
        """
        トレーニングしたモデルをS3にアップロード
        
        Args:
            model_path (str): モデルファイルのローカルパス
            bucket_name (str): S3バケット名
            s3_key_prefix (str): S3内のキープレフィックス
            
        Returns:
            str: モデルのS3 URI
        """
        try:
            s3 = boto3.client('s3')
            model_filename = os.path.basename(model_path)
            s3_key = f"{s3_key_prefix}{model_filename}"
            
            # モデルをS3にアップロード
            s3.upload_file(model_path, bucket_name, s3_key)
            
            s3_uri = f"s3://{bucket_name}/{s3_key}"
            logger.info(f"モデルをS3にアップロードしました: {s3_uri}")
            
            return s3_uri
        except Exception as e:
            logger.error(f"S3へのアップロード中にエラーが発生しました: {str(e)}")
            raise


def load_data_from_s3(bucket_name, object_key):
    """
    S3からデータをロード
    
    Args:
        bucket_name (str): S3バケット名
        object_key (str): S3オブジェクトキー
        
    Returns:
        pd.DataFrame: ロードされたデータ
    """
    try:
        s3 = boto3.client('s3')
        response = s3.get_object(Bucket=bucket_name, Key=object_key)
        
        if object_key.endswith('.csv'):
            return pd.read_csv(response['Body'])
        elif object_key.endswith('.json'):
            return pd.read_json(response['Body'])
        else:
            raise ValueError(f"サポートされていないファイル形式です: {object_key}")
            
    except Exception as e:
        logger.error(f"S3からのデータロード中にエラーが発生しました: {str(e)}")
        raise


def main():
    """
    メイン実行関数
    """
    parser = argparse.ArgumentParser(description='候補者マッチングモデルトレーニング')
    
    # 必須引数
    parser.add_argument('--data-path', type=str, required=True, 
                        help='トレーニングデータのパス（ローカルまたはS3 URI）')
    
    # オプション引数
    parser.add_argument('--model-dir', type=str, default='./models',
                        help='モデルを保存するディレクトリ')
    parser.add_argument('--model-type', type=str, default='xgboost',
                        choices=['xgboost', 'random_forest'],
                        help='使用するモデルタイプ')
    parser.add_argument('--test-size', type=float, default=0.2,
                        help='テストセットの割合')
    parser.add_argument('--s3-upload', action='store_true',
                        help='トレーニング後モデルをS3にアップロードするかどうか')
    parser.add_argument('--s3-bucket', type=str,
                        help='S3バケット名（--s3-uploadが指定された場合に必要）')
    
    args = parser.parse_args()
    
    try:
        # データの読み込み
        if args.data_path.startswith('s3://'):
            # S3からデータを取得
            parts = args.data_path.replace('s3://', '').split('/', 1)
            bucket_name = parts[0]
            object_key = parts[1]
            data = load_data_from_s3(bucket_name, object_key)
        else:
            # ローカルファイルからデータを読み込み
            if args.data_path.endswith('.csv'):
                data = pd.read_csv(args.data_path)
            elif args.data_path.endswith('.json'):
                data = pd.read_json(args.data_path)
            else:
                raise ValueError(f"サポートされていないファイル形式です: {args.data_path}")
        
        logger.info(f"データの読み込みが完了しました: {data.shape[0]} 行, {data.shape[1]} 列")
        
        # モデルインスタンスの作成
        model = CandidateMatchingModel(model_type=args.model_type)
        
        # データの前処理
        processed_data = model.preprocess_data(data)
        
        # 特徴量とターゲットに分割
        X, y = model.split_features_target(processed_data)
        
        # トレーニングセットとテストセットに分割
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=args.test_size, random_state=42
        )
        
        # モデルのトレーニング
        model.train(X_train, y_train)
        
        # モデルの評価
        metrics = model.evaluate(X_test, y_test)
        
        # 結果の出力
        results = {
            'model_type': args.model_type,
            'data_size': len(data),
            'train_size': len(X_train),
            'test_size': len(X_test),
            'metrics': metrics
        }
        
        print(json.dumps(results, indent=2))
        
        # モデルの保存
        model_path = model.save_model(args.model_dir)
        
        # S3へのアップロード（オプション）
        if args.s3_upload:
            if not args.s3_bucket:
                raise ValueError("--s3-uploadが指定されている場合、--s3-bucketも指定する必要があります")
            
            s3_uri = model.upload_to_s3(model_path, args.s3_bucket)
            logger.info(f"モデルのS3 URI: {s3_uri}")
        
    except Exception as e:
        logger.error(f"エラーが発生しました: {str(e)}")
        raise


if __name__ == '__main__':
    main() 