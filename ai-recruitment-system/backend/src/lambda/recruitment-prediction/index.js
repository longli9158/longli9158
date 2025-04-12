/**
 * NeoCrea - 採用予測 Lambda 関数
 * 
 * この Lambda 関数は、候補者データを受け取り、機械学習モデルを使用して
 * 採用可能性を予測します。予測結果は DynamoDB に保存され、クライアントに返されます。
 */

const AWS = require('aws-sdk');
const sagemakerRuntime = new AWS.SageMakerRuntime();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();

// 環境変数から設定を取得
const MODEL_ENDPOINT = process.env.MODEL_ENDPOINT;
const PREDICTIONS_TABLE = process.env.PREDICTIONS_TABLE;
const MODEL_BUCKET = process.env.MODEL_BUCKET;
const MODEL_KEY = process.env.MODEL_KEY;

/**
 * 候補者データを前処理する関数
 * @param {Object} candidateData - 候補者の生データ
 * @returns {Object} - 前処理されたデータ
 */
const preprocessCandidateData = (candidateData) => {
  try {
    // 基本的な検証
    if (!candidateData) {
      throw new Error('候補者データが提供されていません');
    }

    // 必須フィールドの検証
    const requiredFields = ['skills', 'experience', 'education'];
    for (const field of requiredFields) {
      if (!candidateData[field]) {
        throw new Error(`必須フィールド ${field} が見つかりません`);
      }
    }

    // 前処理されたデータを構築
    const preprocessedData = {
      // 基本情報
      candidateId: candidateData.candidateId || '',
      jobId: candidateData.jobId || '',
      
      // スキル情報（配列を文字列に変換して処理しやすくする）
      skills: Array.isArray(candidateData.skills) 
        ? candidateData.skills.join(',') 
        : candidateData.skills,
      
      // 経験年数（数値に変換）
      yearsOfExperience: parseInt(candidateData.experience, 10) || 0,
      
      // 学歴レベル（数値にマッピング）
      educationLevel: convertEducationToLevel(candidateData.education),
      
      // 追加情報（存在する場合）
      previousCompanies: candidateData.previousCompanies || '',
      certifications: Array.isArray(candidateData.certifications)
        ? candidateData.certifications.join(',')
        : candidateData.certifications || '',
      
      // 文化適合性スコア（存在する場合）
      cultureScore: parseFloat(candidateData.cultureScore) || 0
    };

    return preprocessedData;
  } catch (error) {
    console.error('前処理中にエラーが発生しました:', error);
    throw error;
  }
};

/**
 * 学歴情報を数値レベルに変換する関数
 * @param {string} education - 学歴情報
 * @returns {number} - 学歴レベル
 */
const convertEducationToLevel = (education) => {
  // 学歴を小文字に変換して比較を容易にする
  const eduLower = (education || '').toLowerCase();
  
  // 学歴を数値レベルにマッピング
  if (eduLower.includes('phd') || eduLower.includes('博士')) {
    return 5;
  } else if (eduLower.includes('master') || eduLower.includes('修士')) {
    return 4;
  } else if (eduLower.includes('bachelor') || eduLower.includes('学士') || eduLower.includes('大学')) {
    return 3;
  } else if (eduLower.includes('associate') || eduLower.includes('短大') || eduLower.includes('専門')) {
    return 2;
  } else if (eduLower.includes('high school') || eduLower.includes('高校')) {
    return 1;
  } else {
    return 0; // 不明または該当なし
  }
};

/**
 * SageMaker エンドポイントを使用して予測を行う関数
 * @param {Object} preprocessedData - 前処理されたデータ
 * @returns {Object} - 予測結果
 */
const getPredictionFromModel = async (preprocessedData) => {
  try {
    // データを SageMaker が期待する形式に変換
    const payload = JSON.stringify({
      instances: [preprocessedData]
    });

    // SageMaker エンドポイントを呼び出すパラメータ
    const params = {
      EndpointName: MODEL_ENDPOINT,
      ContentType: 'application/json',
      Body: payload
    };

    // SageMaker エンドポイントを呼び出し
    const response = await sagemakerRuntime.invokeEndpoint(params).promise();
    
    // レスポンスを解析
    const responseBody = JSON.parse(Buffer.from(response.Body).toString());
    
    // 予測結果を構築
    const prediction = {
      matchProbability: responseBody.predictions[0].probability,
      predictedMatch: responseBody.predictions[0].label,
      confidence: responseBody.predictions[0].probability,
      modelVersion: responseBody.metadata?.version || 'unknown'
    };

    return prediction;
  } catch (error) {
    console.error('予測中にエラーが発生しました:', error);
    
    // SageMaker エンドポイントがない場合はフォールバックモデルを使用
    if (error.code === 'ValidationException' || error.code === 'ResourceNotFoundException') {
      console.log('SageMaker エンドポイントが利用できません。フォールバックモデルを使用します。');
      return getFallbackPrediction(preprocessedData);
    }
    
    throw error;
  }
};

/**
 * フォールバックモデルを使用して予測を行う関数（SageMaker が利用できない場合）
 * @param {Object} preprocessedData - 前処理されたデータ
 * @returns {Object} - 予測結果
 */
const getFallbackPrediction = async (preprocessedData) => {
  try {
    // 非常にシンプルなルールベースの予測を実装
    // 実際の環境では、S3からモデルファイルをダウンロードして使用するなど
    // より高度な実装が必要になる場合があります
    
    let matchScore = 0;
    
    // 経験年数に基づくスコア
    if (preprocessedData.yearsOfExperience >= 5) {
      matchScore += 0.4;
    } else if (preprocessedData.yearsOfExperience >= 3) {
      matchScore += 0.3;
    } else if (preprocessedData.yearsOfExperience >= 1) {
      matchScore += 0.2;
    }
    
    // 学歴レベルに基づくスコア
    matchScore += preprocessedData.educationLevel * 0.05;
    
    // スキルの数に基づくスコア
    const skillsCount = preprocessedData.skills.split(',').length;
    matchScore += Math.min(skillsCount * 0.05, 0.3);
    
    // 文化適合性スコアを考慮
    if (preprocessedData.cultureScore > 0) {
      matchScore += preprocessedData.cultureScore * 0.2;
    }
    
    // 総合スコアを0-1の範囲に正規化
    matchScore = Math.min(matchScore, 0.95);
    
    return {
      matchProbability: matchScore,
      predictedMatch: matchScore >= 0.7 ? true : false,
      confidence: 0.6, // フォールバックモデルの信頼度は低めに設定
      modelVersion: 'fallback-v1'
    };
  } catch (error) {
    console.error('フォールバック予測中にエラーが発生しました:', error);
    throw error;
  }
};

/**
 * 予測結果をDynamoDBに保存する関数
 * @param {string} candidateId - 候補者ID
 * @param {string} jobId - 求人ID
 * @param {Object} prediction - 予測結果
 * @returns {Object} - 保存結果
 */
const savePredictionToDB = async (candidateId, jobId, prediction) => {
  try {
    const timestamp = new Date().toISOString();
    
    const item = {
      predictionId: `${candidateId}-${jobId}-${timestamp}`,
      candidateId,
      jobId,
      timestamp,
      matchProbability: prediction.matchProbability,
      predictedMatch: prediction.predictedMatch,
      confidence: prediction.confidence,
      modelVersion: prediction.modelVersion
    };
    
    const params = {
      TableName: PREDICTIONS_TABLE,
      Item: item
    };
    
    await dynamoDB.put(params).promise();
    
    return { 
      status: 'success',
      predictionId: item.predictionId
    };
  } catch (error) {
    console.error('予測結果の保存中にエラーが発生しました:', error);
    throw error;
  }
};

/**
 * Lambda 関数のハンドラー
 * @param {Object} event - Lambda イベント
 * @param {Object} context - Lambda コンテキスト
 * @returns {Object} - レスポンス
 */
exports.handler = async (event, context) => {
  try {
    console.log('受信イベント:', JSON.stringify(event));
    
    // リクエストボディを解析
    let candidateData;
    if (event.body) {
      candidateData = JSON.parse(event.body);
    } else if (event.candidateData) {
      candidateData = event.candidateData;
    } else {
      throw new Error('リクエストボディに候補者データが含まれていません');
    }
    
    // 候補者IDと求人IDを取得
    const candidateId = candidateData.candidateId || event.pathParameters?.candidateId;
    const jobId = candidateData.jobId || event.pathParameters?.jobId;
    
    if (!candidateId || !jobId) {
      return {
        statusCode: 400,
        body: JSON.stringify({
          message: '候補者IDと求人IDは必須です'
        })
      };
    }
    
    // 候補者データを前処理
    const preprocessedData = preprocessCandidateData(candidateData);
    
    // モデルから予測を取得
    const prediction = await getPredictionFromModel(preprocessedData);
    
    // 予測結果をDynamoDBに保存
    const saveResult = await savePredictionToDB(candidateId, jobId, prediction);
    
    // レスポンスを構築
    const response = {
      candidateId,
      jobId,
      prediction: {
        matchProbability: prediction.matchProbability,
        predictedMatch: prediction.predictedMatch,
        confidence: prediction.confidence
      },
      timestamp: new Date().toISOString(),
      predictionId: saveResult.predictionId
    };
    
    // API Gateway からの呼び出しの場合はHTTPレスポンスを返す
    if (event.httpMethod) {
      return {
        statusCode: 200,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(response)
      };
    }
    
    // 直接呼び出しの場合はJSONオブジェクトを返す
    return response;
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    
    // API Gateway からの呼び出しの場合はHTTPエラーレスポンスを返す
    if (event.httpMethod) {
      return {
        statusCode: 500,
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          message: '予測処理中にエラーが発生しました',
          error: error.message
        })
      };
    }
    
    // 直接呼び出しの場合はエラーをスローする
    throw error;
  }
}; 