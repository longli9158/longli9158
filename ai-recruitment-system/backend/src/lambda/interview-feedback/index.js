/**
 * 面接フィードバックAPIハンドラー
 * 
 * このLambda関数は、面接のトランスクリプトを分析して詳細なフィードバックを生成するAPIエンドポイントを提供します。
 * AIモデルを呼び出し、面接パフォーマンスのスコアと改善のためのフィードバックを返します。
 */

const AWS = require('aws-sdk');
const { v4: uuidv4 } = require('uuid');

// AWS SDK設定
const sageMaker = new AWS.SageMaker();
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const s3 = new AWS.S3();
const comprehend = new AWS.Comprehend();

// 定数
const SAGEMAKER_ENDPOINT_NAME = process.env.SAGEMAKER_ENDPOINT_NAME || 'interview-feedback-endpoint';
const INTERVIEWS_TABLE = process.env.INTERVIEWS_TABLE || 'interviews';
const FEEDBACK_TABLE = process.env.FEEDBACK_TABLE || 'interview-feedback';
const TRANSCRIPTS_BUCKET = process.env.TRANSCRIPTS_BUCKET || 'interview-transcripts';

/**
 * Lambda関数のメインハンドラー
 */
exports.handler = async (event) => {
  try {
    console.log('受信イベント:', JSON.stringify(event));
    
    // リクエストボディをJSONとしてパース
    const requestBody = JSON.parse(event.body || '{}');
    const { 
      interviewId, 
      transcript, 
      questions, 
      audioFeatures, 
      candidateId, 
      positionId 
    } = requestBody;
    
    // バリデーション
    if (!transcript || !questions || !questions.length) {
      return formatResponse(400, { 
        error: '面接トランスクリプトと質問は必須パラメータです' 
      });
    }
    
    // まず、トランスクリプトをS3に保存
    const transcriptKey = await saveTranscriptToS3(transcript, interviewId || uuidv4());
    
    // 感情分析を実行（オプション）
    let sentimentData = null;
    if (process.env.ENABLE_SENTIMENT_ANALYSIS === 'true') {
      sentimentData = await analyzeSentiment(transcript);
    }
    
    // フィードバック分析の実行
    const feedbackResult = await generateFeedback(transcript, questions, audioFeatures, sentimentData);
    
    // 結果をDynamoDBに保存
    const feedbackId = await saveFeedbackResult(
      interviewId, 
      candidateId, 
      positionId, 
      transcriptKey, 
      feedbackResult
    );
    
    // 保存されたIDを結果に追加
    const response = {
      feedbackId,
      ...feedbackResult
    };
    
    // 結果を返す
    return formatResponse(200, response);
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    return formatResponse(500, { 
      error: 'サーバーエラーが発生しました',
      details: error.message 
    });
  }
};

/**
 * 面接トランスクリプトをS3に保存
 */
async function saveTranscriptToS3(transcript, interviewId) {
  try {
    const timestamp = new Date().toISOString();
    const key = `transcripts/${interviewId}/${timestamp}.txt`;
    
    const params = {
      Bucket: TRANSCRIPTS_BUCKET,
      Key: key,
      Body: transcript,
      ContentType: 'text/plain'
    };
    
    await s3.putObject(params).promise();
    console.log(`トランスクリプトがS3に保存されました。キー: ${key}`);
    return key;
  } catch (error) {
    console.error('トランスクリプトの保存エラー:', error);
    throw error;
  }
}

/**
 * AWS Comprehendを使用して感情分析を実行
 */
async function analyzeSentiment(transcript) {
  try {
    // テキストを5000文字のチャンクに分割（Comprehendの制限）
    const chunkSize = 5000;
    const chunks = [];
    
    for (let i = 0; i < transcript.length; i += chunkSize) {
      chunks.push(transcript.slice(i, i + chunkSize));
    }
    
    // 各チャンクに対して感情分析を実行
    const sentimentPromises = chunks.map(chunk => {
      const params = {
        LanguageCode: 'ja',
        Text: chunk
      };
      return comprehend.detectSentiment(params).promise();
    });
    
    const sentimentResults = await Promise.all(sentimentPromises);
    
    // 結果を集約
    const aggregatedSentiment = {
      Sentiment: getMostFrequentSentiment(sentimentResults.map(result => result.Sentiment)),
      SentimentScore: averageSentimentScores(sentimentResults.map(result => result.SentimentScore))
    };
    
    console.log('感情分析結果:', JSON.stringify(aggregatedSentiment));
    return aggregatedSentiment;
  } catch (error) {
    console.error('感情分析エラー:', error);
    return null;
  }
}

/**
 * 最も頻度の高い感情ラベルを取得
 */
function getMostFrequentSentiment(sentiments) {
  const counts = sentiments.reduce((acc, sentiment) => {
    acc[sentiment] = (acc[sentiment] || 0) + 1;
    return acc;
  }, {});
  
  return Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
}

/**
 * 感情スコアの平均を計算
 */
function averageSentimentScores(scores) {
  const sum = scores.reduce((acc, score) => {
    acc.Positive += score.Positive;
    acc.Negative += score.Negative;
    acc.Neutral += score.Neutral;
    acc.Mixed += score.Mixed;
    return acc;
  }, { Positive: 0, Negative: 0, Neutral: 0, Mixed: 0 });
  
  const count = scores.length;
  return {
    Positive: sum.Positive / count,
    Negative: sum.Negative / count,
    Neutral: sum.Neutral / count,
    Mixed: sum.Mixed / count
  };
}

/**
 * SageMakerエンドポイントを使用してフィードバックを生成
 */
async function generateFeedback(transcript, questions, audioFeatures, sentimentData) {
  try {
    // SageMakerエンドポイントに送信するデータを準備
    const payload = {
      transcript,
      questions,
      audioFeatures: audioFeatures || null,
      sentimentData: sentimentData || null
    };
    
    // SageMakerエンドポイントを呼び出す
    const response = await invokeSageMakerEndpoint(payload);
    return JSON.parse(response);
    
  } catch (error) {
    console.error('フィードバック生成エラー:', error);
    
    // フォールバック：APIが利用できない場合にモックレスポンスを返す
    console.log('APIエラー発生: モックレスポンスを返します');
    return generateMockFeedback(transcript, questions, audioFeatures, sentimentData);
  }
}

/**
 * SageMakerエンドポイントの呼び出し
 */
async function invokeSageMakerEndpoint(payload) {
  try {
    const params = {
      EndpointName: SAGEMAKER_ENDPOINT_NAME,
      Body: JSON.stringify(payload),
      ContentType: 'application/json',
      Accept: 'application/json'
    };
    
    const response = await sageMaker.invokeEndpoint(params).promise();
    return Buffer.from(response.Body).toString('utf-8');
  } catch (error) {
    console.error('SageMakerエンドポイントの呼び出しエラー:', error);
    throw error;
  }
}

/**
 * フィードバック結果をDynamoDBに保存
 */
async function saveFeedbackResult(interviewId, candidateId, positionId, transcriptKey, feedbackResult) {
  try {
    const timestamp = new Date().toISOString();
    const feedbackId = uuidv4();
    
    const params = {
      TableName: FEEDBACK_TABLE,
      Item: {
        id: feedbackId,
        interviewId: interviewId || feedbackId,
        candidateId: candidateId || 'anonymous',
        positionId: positionId || 'unspecified',
        transcriptKey,
        overallScore: feedbackResult.overallScore,
        categoryScores: feedbackResult.categoryScores,
        timestamp,
        feedback: feedbackResult.feedback
      }
    };
    
    await dynamoDB.put(params).promise();
    console.log(`フィードバック結果がDynamoDBに保存されました。ID: ${feedbackId}`);
    return feedbackId;
  } catch (error) {
    console.error('フィードバック結果の保存エラー:', error);
    throw error;
  }
}

/**
 * レスポンスフォーマットのヘルパー関数
 */
function formatResponse(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Credentials': true
    },
    body: JSON.stringify(body)
  };
}

/**
 * モックフィードバックの生成（開発・テスト用）
 */
function generateMockFeedback(transcript, questions, audioFeatures, sentimentData) {
  // トランスクリプトの長さと質問数に基づいて基本スコアを計算
  const wordCount = transcript.split(/\s+/).length;
  const baseScore = Math.min(60 + (wordCount / 100), 85);
  
  // 各カテゴリのスコアを計算
  const communicationScore = Math.min(baseScore + 5, 100);
  const technicalKnowledgeScore = Math.min(baseScore - 2, 100);
  const problemSolvingScore = Math.min(baseScore - 5, 100);
  const culturalFitScore = Math.min(baseScore + 8, 100);
  const enthusiasmScore = Math.min(baseScore + 10, 100);
  const experienceRelevanceScore = Math.min(baseScore - 3, 100);
  
  // 感情データがある場合は活用
  let sentimentBonus = 0;
  if (sentimentData) {
    sentimentBonus = Math.round((sentimentData.SentimentScore.Positive - sentimentData.SentimentScore.Negative) * 10);
  }
  
  // 音声特性がある場合は活用
  let audioBonus = 0;
  if (audioFeatures) {
    // 明瞭さがあれば加算
    if (audioFeatures.clarity) {
      audioBonus += audioFeatures.clarity * 5;
    }
    
    // 話速が適切な範囲（120-160 wpm）にあれば加算
    if (audioFeatures.speakingRate) {
      const optimalSpeakingRate = audioFeatures.speakingRate >= 120 && audioFeatures.speakingRate <= 160;
      audioBonus += optimalSpeakingRate ? 5 : 0;
    }
  }
  
  // 最終的な総合スコア（0-100の範囲に収める）
  const overallScore = Math.min(
    Math.max(
      Math.round((
        communicationScore + 
        technicalKnowledgeScore + 
        problemSolvingScore + 
        culturalFitScore + 
        enthusiasmScore + 
        experienceRelevanceScore
      ) / 6) + sentimentBonus + audioBonus,
      0
    ),
    100
  );
  
  // スコアに基づいて強みと改善点を選択
  const strengths = [];
  const improvements = [];
  
  // スコアが80以上の上位2カテゴリを強みに
  const categoryScores = {
    communication: communicationScore,
    technicalKnowledge: technicalKnowledgeScore,
    problemSolving: problemSolvingScore,
    culturalFit: culturalFitScore,
    enthusiasm: enthusiasmScore,
    experienceRelevance: experienceRelevanceScore
  };
  
  const sortedCategories = Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1]);
  
  // 上位2カテゴリを強みとして抽出
  sortedCategories.slice(0, 2).forEach(([category, score]) => {
    if (score >= 75) {
      strengths.push(getFeedbackForCategory(category, 'high'));
    } else if (score >= 60) {
      strengths.push(getFeedbackForCategory(category, 'medium'));
    }
  });
  
  // 下位2カテゴリを改善点として抽出
  sortedCategories.slice(-2).forEach(([category, score]) => {
    if (score < 70) {
      improvements.push(getFeedbackForCategory(category, 'low'));
    } else if (score < 80) {
      improvements.push(getFeedbackForCategory(category, 'medium'));
    }
  });
  
  // 少なくとも1つの強みと改善点があることを確認
  if (strengths.length === 0) {
    strengths.push("コミュニケーションは明確ですが、時々詳細が不足しています");
  }
  
  if (improvements.length === 0) {
    improvements.push("技術的な概念をより詳細に説明するとよいでしょう");
  }
  
  // 標準的な提案
  const suggestions = [
    "STAR手法（状況、タスク、行動、結果）を使った回答構成の改善",
    "この分野でのより具体的な関心領域を特定するとよいでしょう"
  ];
  
  return {
    overallScore,
    categoryScores,
    feedback: {
      strengths,
      improvements,
      suggestions
    }
  };
}

/**
 * カテゴリとレベルに基づいてフィードバックテキストを取得
 */
function getFeedbackForCategory(category, level) {
  const feedbackTemplates = {
    communication: {
      high: "明確で簡潔なコミュニケーションスキルを示しています",
      medium: "コミュニケーションは明確ですが、時々詳細が不足しています",
      low: "回答がしばしば不明確または不完全です"
    },
    technicalKnowledge: {
      high: "該当分野における強固な技術的理解を示しています",
      medium: "基本的な技術的理解を示していますが、一部の高度な概念でギャップがあります",
      low: "基本的な技術的概念の理解に課題があります"
    },
    problemSolving: {
      high: "問題を効果的に分析し、構造化されたアプローチで解決しています",
      medium: "基本的な問題解決能力を示していますが、より複雑なケースでは詳細が不足しています",
      low: "問題の分析と解決に体系的なアプローチが欠けています"
    },
    culturalFit: {
      high: "企業の価値観と使命に強い共感を示しています",
      medium: "企業の価値観に対する基本的な理解を示しています",
      low: "企業の価値観や文化への関心や理解が限られています"
    },
    enthusiasm: {
      high: "役割と会社に対する強い情熱と熱意を示しています",
      medium: "役割に対する興味を示していますが、より深い熱意が見られるとよいでしょう",
      low: "役割や会社に対する熱意が限定的です"
    },
    experienceRelevance: {
      high: "この役割に直接関連する豊富な経験を持っています",
      medium: "関連する経験を持っていますが、一部の主要分野では限られています",
      low: "この役割に直接関連する経験が限られています"
    }
  };
  
  return feedbackTemplates[category]?.[level] || `${category}のレベルは${level}です`;
} 