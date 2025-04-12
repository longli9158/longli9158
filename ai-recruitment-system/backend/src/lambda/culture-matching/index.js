/**
 * 企業文化マッチングAPIハンドラー
 * 
 * このLambda関数は、候補者と企業の文化的適合性を評価するAPIエンドポイントを提供します。
 * AIモデルを呼び出し、マッチングスコアと詳細な分析結果を返します。
 */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const comprehend = new AWS.Comprehend();

// 環境変数からテーブル名を取得
const CANDIDATES_TABLE = process.env.CANDIDATES_TABLE || 'candidates';
const COMPANIES_TABLE = process.env.COMPANIES_TABLE || 'companies';
const CULTURAL_KEYWORDS = {
  'innovation': ['革新', '創造性', '先進的', 'イノベーション'],
  'teamwork': ['チームワーク', '協力', '共同作業', 'コラボレーション'],
  'customer_focus': ['顧客中心', '顧客満足', 'カスタマーエクスペリエンス'],
  'work_life_balance': ['ワークライフバランス', '柔軟性', 'フレックス'],
  'growth_mindset': ['成長', '学習', '自己啓発', 'スキルアップ'],
  'diversity': ['多様性', 'インクルージョン', '包括性'],
  'transparency': ['透明性', 'オープン', '正直'],
  'excellence': ['卓越', '品質', '高品質', 'パフォーマンス']
};

/**
 * Lambda ハンドラー関数
 * @param {Object} event - Lambda イベントオブジェクト
 * @param {Object} context - Lambda コンテキスト
 * @returns {Object} - API Gateway応答オブジェクト
 */
exports.handler = async (event, context) => {
  console.log('受信イベント:', JSON.stringify(event, null, 2));
  
  try {
    // APIリクエストからデータを抽出
    let candidateId, companyId;
    
    if (event.body) {
      // API Gateway経由の場合
      const body = JSON.parse(event.body);
      candidateId = body.candidateId;
      companyId = body.companyId;
    } else if (event.candidateId && event.companyId) {
      // 直接呼び出しの場合
      candidateId = event.candidateId;
      companyId = event.companyId;
    } else {
      throw new Error('candidateIdとcompanyIdは必須です');
    }

    // 候補者と会社のデータを取得
    const candidateData = await getCandidateData(candidateId);
    const companyData = await getCompanyData(companyId);
    
    // 文化的マッチングスコアを計算
    const matchingResult = await calculateCulturalMatch(candidateData, companyData);
    
    // 結果を保存（オプション）
    await saveMatchingResult(candidateId, companyId, matchingResult);
    
    // 成功レスポンスを返す
    return formatResponse(200, matchingResult);
  } catch (error) {
    console.error('エラー:', error);
    return formatResponse(500, { error: error.message });
  }
};

/**
 * DynamoDBから候補者データを取得
 * @param {string} candidateId - 候補者ID
 * @returns {Object} - 候補者データ
 */
async function getCandidateData(candidateId) {
  const params = {
    TableName: CANDIDATES_TABLE,
    Key: { id: candidateId }
  };
  
  try {
    const result = await dynamoDB.get(params).promise();
    if (!result.Item) {
      throw new Error(`候補者ID ${candidateId} が見つかりません`);
    }
    return result.Item;
  } catch (error) {
    console.error('候補者データ取得エラー:', error);
    throw error;
  }
}

/**
 * DynamoDBから会社データを取得
 * @param {string} companyId - 会社ID
 * @returns {Object} - 会社データ
 */
async function getCompanyData(companyId) {
  const params = {
    TableName: COMPANIES_TABLE,
    Key: { id: companyId }
  };
  
  try {
    const result = await dynamoDB.get(params).promise();
    if (!result.Item) {
      throw new Error(`会社ID ${companyId} が見つかりません`);
    }
    return result.Item;
  } catch (error) {
    console.error('会社データ取得エラー:', error);
    throw error;
  }
}

/**
 * 文化的マッチングスコアを計算
 * @param {Object} candidateData - 候補者データ
 * @param {Object} companyData - 会社データ
 * @returns {Object} - マッチング結果
 */
async function calculateCulturalMatch(candidateData, companyData) {
  // 会社の文化的価値観を抽出
  const companyValues = companyData.culturalValues || [];
  const companyDescription = companyData.description || '';
  
  // 候補者のカルチャーに関する情報を抽出
  const candidateValues = candidateData.preferredValues || [];
  const candidateBackground = [
    candidateData.personalStatement || '',
    candidateData.coverLetter || '',
    (candidateData.interviews || []).map(i => i.transcript || '').join(' ')
  ].join(' ');
  
  // テキスト分析を使用して候補者の価値観を検出
  const detectedValues = await detectCulturalValues(candidateBackground);
  
  // 価値観ごとのマッチングスコアを計算
  const valueScores = {};
  const allValues = [...new Set([...companyValues, ...Object.keys(detectedValues)])];
  
  allValues.forEach(value => {
    const companyHasValue = companyValues.includes(value);
    const candidateHasValue = candidateValues.includes(value) || detectedValues[value] > 0.3;
    
    if (companyHasValue && candidateHasValue) {
      // 両方が価値を持っている場合、高いスコア
      valueScores[value] = {
        score: Math.min(1, detectedValues[value] || 0.8),
        match: true
      };
    } else if (companyHasValue && !candidateHasValue) {
      // 会社は価値を持っているが候補者は持っていない場合
      valueScores[value] = {
        score: 0.2,
        match: false
      };
    } else if (!companyHasValue && candidateHasValue) {
      // 候補者は価値を持っているが会社は持っていない場合、中程度のスコア
      valueScores[value] = {
        score: 0.5,
        match: false
      };
    } else {
      valueScores[value] = {
        score: 0,
        match: false
      };
    }
  });
  
  // 総合スコアを計算（0〜100）
  const totalScore = Math.round(
    (Object.values(valueScores).reduce((sum, item) => sum + item.score, 0) / 
    Math.max(1, Object.keys(valueScores).length)) * 100
  );
  
  // 一致した価値観数をカウント
  const matchedValuesCount = Object.values(valueScores).filter(item => item.match).length;
  
  return {
    overallMatchScore: totalScore,
    matchedValuesCount: matchedValuesCount,
    totalValuesCount: allValues.length,
    valueScores: valueScores,
    recommendation: getRecommendation(totalScore),
    timestamp: new Date().toISOString()
  };
}

/**
 * テキストから文化的価値観を検出
 * @param {string} text - 分析するテキスト
 * @returns {Object} - 検出された価値観とその確信度
 */
async function detectCulturalValues(text) {
  if (!text || text.trim().length === 0) {
    return {};
  }
  
  // AWS Comprehendを使用してキーフレーズとセンチメントを抽出
  try {
    // キーフレーズの検出
    const keyPhrasesResponse = await comprehend.detectKeyPhrases({
      Text: text.substring(0, 5000), // 5000文字制限
      LanguageCode: 'ja'
    }).promise();
    
    const keyPhrases = keyPhrasesResponse.KeyPhrases.map(kp => kp.Text.toLowerCase());
    
    // 各文化的価値観に対してキーワードマッチングを実行
    const valueScores = {};
    
    Object.entries(CULTURAL_KEYWORDS).forEach(([value, keywords]) => {
      let score = 0;
      
      // キーワードとキーフレーズのマッチングを確認
      keywords.forEach(keyword => {
        const keywordLower = keyword.toLowerCase();
        // テキスト内にキーワードが存在するかチェック
        if (text.toLowerCase().includes(keywordLower)) {
          score += 0.3;
        }
        
        // キーフレーズとのマッチングをチェック
        keyPhrases.forEach(phrase => {
          if (phrase.includes(keywordLower)) {
            score += 0.2;
          }
        });
      });
      
      // スコアを正規化（0〜1）
      valueScores[value] = Math.min(1, score);
    });
    
    return valueScores;
  } catch (error) {
    console.error('テキスト分析エラー:', error);
    // エラーの場合は空のオブジェクトを返す
    return {};
  }
}

/**
 * マッチング結果に基づいて推奨事項を生成
 * @param {number} score - マッチングスコア
 * @returns {string} - 推奨事項
 */
function getRecommendation(score) {
  if (score >= 80) {
    return '非常に高いカルチャーマッチ - 積極的に採用を検討することをお勧めします';
  } else if (score >= 60) {
    return '良好なカルチャーマッチ - 候補者と会社の価値観は概ね一致しています';
  } else if (score >= 40) {
    return '中程度のカルチャーマッチ - 追加の面接で価値観の一致を確認することをお勧めします';
  } else {
    return 'カルチャーマッチが低い - 組織文化との不一致がある可能性があります';
  }
}

/**
 * マッチング結果をDynamoDBに保存（オプション）
 * @param {string} candidateId - 候補者ID
 * @param {string} companyId - 会社ID
 * @param {Object} matchingResult - マッチング結果
 */
async function saveMatchingResult(candidateId, companyId, matchingResult) {
  // 保存先テーブルが定義されていない場合はスキップ
  const MATCHING_RESULTS_TABLE = process.env.MATCHING_RESULTS_TABLE;
  if (!MATCHING_RESULTS_TABLE) {
    return;
  }
  
  const params = {
    TableName: MATCHING_RESULTS_TABLE,
    Item: {
      id: `${candidateId}-${companyId}`,
      candidateId: candidateId,
      companyId: companyId,
      result: matchingResult,
      createdAt: new Date().toISOString()
    }
  };
  
  try {
    await dynamoDB.put(params).promise();
    console.log('マッチング結果を保存しました');
  } catch (error) {
    console.error('マッチング結果保存エラー:', error);
    // 保存に失敗しても処理は続行
  }
}

/**
 * API Gateway応答オブジェクトを作成
 * @param {number} statusCode - HTTPステータスコード
 * @param {Object} body - レスポンスボディ
 * @returns {Object} - API Gateway応答オブジェクト
 */
function formatResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(body)
  };
} 