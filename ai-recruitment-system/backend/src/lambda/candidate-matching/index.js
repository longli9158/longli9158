/**
 * NeoCrea - 候補者マッチング Lambda 関数
 * 
 * この Lambda 関数は、求人要件と候補者のプロフィールデータを比較して、
 * 最適なマッチングを行い、求人に最も適した候補者リストを返します。
 */

const AWS = require('aws-sdk');
const dynamoDB = new AWS.DynamoDB.DocumentClient();
const sagemakerRuntime = new AWS.SageMakerRuntime();
const s3 = new AWS.S3();

// 環境変数から設定を取得
const CANDIDATES_TABLE = process.env.CANDIDATES_TABLE;
const JOBS_TABLE = process.env.JOBS_TABLE;
const MATCHES_TABLE = process.env.MATCHES_TABLE;
const MODEL_ENDPOINT = process.env.MODEL_ENDPOINT;
const MODEL_BUCKET = process.env.MODEL_BUCKET;
const MODEL_KEY = process.env.MODEL_KEY;

/**
 * Lambda 関数のハンドラー
 * @param {Object} event - Lambda イベント
 * @param {Object} context - Lambda コンテキスト
 * @returns {Object} - レスポンス
 */
exports.handler = async (event, context) => {
  try {
    console.log('受信イベント:', JSON.stringify(event));
    
    // リクエストからジョブIDを取得
    let jobId;
    if (event.body) {
      const body = JSON.parse(event.body);
      jobId = body.jobId;
    } else if (event.jobId) {
      jobId = event.jobId;
    } else if (event.pathParameters && event.pathParameters.jobId) {
      jobId = event.pathParameters.jobId;
    }
    
    if (!jobId) {
      return formatResponse(400, {
        message: '求人IDが提供されていません'
      });
    }
    
    // 求人情報を取得
    const jobData = await getJobData(jobId);
    
    // 求人に関連するスキル要件を抽出
    const jobRequirements = extractJobRequirements(jobData);
    
    // 候補者リストを取得
    const candidates = await getCandidates();
    
    // 候補者と求人の最適マッチングを計算
    const matchedCandidates = await matchCandidatesToJob(candidates, jobRequirements, jobId);
    
    // マッチング結果をDynamoDBに保存
    await saveMatchResults(jobId, matchedCandidates);
    
    // レスポンスを返す
    return formatResponse(200, {
      jobId: jobId,
      matchedCandidates: matchedCandidates.slice(0, 10), // 上位10件のみ返す
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('エラーが発生しました:', error);
    return formatResponse(500, {
      message: 'マッチング処理中にエラーが発生しました',
      error: error.message
    });
  }
};

/**
 * 求人データを取得する関数
 * @param {string} jobId - 求人ID
 * @returns {Object} - 求人データ
 */
async function getJobData(jobId) {
  const params = {
    TableName: JOBS_TABLE,
    Key: { id: jobId }
  };
  
  const result = await dynamoDB.get(params).promise();
  if (!result.Item) {
    throw new Error(`求人ID ${jobId} のデータが見つかりません`);
  }
  
  return result.Item;
}

/**
 * すべての候補者データを取得する関数
 * @returns {Array} - 候補者データの配列
 */
async function getCandidates() {
  const params = {
    TableName: CANDIDATES_TABLE,
    // ステータスが「アクティブ」の候補者のみ取得
    FilterExpression: 'attribute_exists(status) AND status = :status',
    ExpressionAttributeValues: {
      ':status': 'active'
    }
  };
  
  let allCandidates = [];
  let lastEvaluatedKey;
  
  // 複数ページにわたって候補者データを取得
  do {
    if (lastEvaluatedKey) {
      params.ExclusiveStartKey = lastEvaluatedKey;
    }
    
    const result = await dynamoDB.scan(params).promise();
    if (result.Items && result.Items.length > 0) {
      allCandidates = allCandidates.concat(result.Items);
    }
    
    lastEvaluatedKey = result.LastEvaluatedKey;
  } while (lastEvaluatedKey);
  
  return allCandidates;
}

/**
 * 求人データから要件を抽出する関数
 * @param {Object} jobData - 求人データ
 * @returns {Object} - 求人要件
 */
function extractJobRequirements(jobData) {
  return {
    requiredSkills: jobData.requiredSkills || [],
    preferredSkills: jobData.preferredSkills || [],
    minExperience: jobData.minExperience || 0,
    maxExperience: jobData.maxExperience,
    educationLevel: jobData.educationLevel,
    location: jobData.location,
    jobType: jobData.type,
    department: jobData.department,
    companyValues: jobData.companyValues || []
  };
}

/**
 * 候補者を求人要件とマッチングする関数
 * @param {Array} candidates - 候補者の配列
 * @param {Object} jobRequirements - 求人要件
 * @param {string} jobId - 求人ID
 * @returns {Array} - マッチングスコア付きの候補者配列
 */
async function matchCandidatesToJob(candidates, jobRequirements, jobId) {
  try {
    // モデルエンドポイントが利用可能かチェック
    const useModel = await isModelEndpointAvailable(MODEL_ENDPOINT);
    
    // マッチング結果を格納する配列
    const matchedCandidates = [];
    
    // 各候補者に対してマッチングスコアを計算
    for (const candidate of candidates) {
      let matchScore;
      let matchReasons = [];
      
      if (useModel) {
        // 機械学習モデルを使用してマッチングを行う
        const modelResult = await getModelPrediction(candidate, jobRequirements, jobId);
        matchScore = modelResult.score;
        matchReasons = modelResult.reasons || [];
      } else {
        // ルールベースのマッチングを実行
        const ruleBasedResult = calculateRuleBasedMatch(candidate, jobRequirements);
        matchScore = ruleBasedResult.score;
        matchReasons = ruleBasedResult.reasons;
      }
      
      // マッチング結果を配列に追加
      if (matchScore > 0.3) { // しきい値を設定して、ある程度マッチする候補者のみを返す
        matchedCandidates.push({
          candidateId: candidate.id,
          candidateName: `${candidate.firstName} ${candidate.lastName}`,
          matchScore: matchScore,
          matchRank: 0, // 後でランク付けするためのプレースホルダー
          matchReasons: matchReasons
        });
      }
    }
    
    // マッチングスコアでソートして、ランクを付ける
    matchedCandidates.sort((a, b) => b.matchScore - a.matchScore);
    matchedCandidates.forEach((candidate, index) => {
      candidate.matchRank = index + 1;
    });
    
    return matchedCandidates;
  } catch (error) {
    console.error('マッチング計算中にエラーが発生しました:', error);
    throw error;
  }
}

/**
 * SageMakerエンドポイントが利用可能かどうかを確認する関数
 * @param {string} endpointName - エンドポイント名
 * @returns {boolean} - 利用可能かどうか
 */
async function isModelEndpointAvailable(endpointName) {
  if (!endpointName) return false;
  
  try {
    const sageMaker = new AWS.SageMaker();
    const params = {
      EndpointName: endpointName
    };
    
    const result = await sageMaker.describeEndpoint(params).promise();
    return result.EndpointStatus === 'InService';
  } catch (error) {
    console.log('モデルエンドポイントが利用できません:', error.message);
    return false;
  }
}

/**
 * SageMakerモデルを使用して予測を取得する関数
 * @param {Object} candidate - 候補者データ
 * @param {Object} jobRequirements - 求人要件
 * @param {string} jobId - 求人ID
 * @returns {Object} - 予測結果
 */
async function getModelPrediction(candidate, jobRequirements, jobId) {
  try {
    // 入力データを準備
    const inputData = prepareModelInput(candidate, jobRequirements);
    
    // SageMakerエンドポイントに送信するペイロードを作成
    const payload = JSON.stringify({
      instances: [inputData]
    });
    
    // SageMaker呼び出しのパラメータを設定
    const params = {
      EndpointName: MODEL_ENDPOINT,
      ContentType: 'application/json',
      Body: payload
    };
    
    // SageMakerエンドポイントを呼び出し
    const response = await sagemakerRuntime.invokeEndpoint(params).promise();
    const responseBody = JSON.parse(Buffer.from(response.Body).toString());
    
    return {
      score: responseBody.predictions[0].score,
      reasons: responseBody.predictions[0].reasons || [],
      confidence: responseBody.predictions[0].confidence || 0.8
    };
  } catch (error) {
    console.error('モデル予測中にエラーが発生しました:', error);
    
    // エラーが発生した場合はルールベースの結果を返す
    return calculateRuleBasedMatch(candidate, jobRequirements);
  }
}

/**
 * モデル入力データを準備する関数
 * @param {Object} candidate - 候補者データ
 * @param {Object} jobRequirements - 求人要件
 * @returns {Object} - モデル入力データ
 */
function prepareModelInput(candidate, jobRequirements) {
  // 候補者のスキル
  const candidateSkills = candidate.skills || [];
  const candidateSkillNames = candidateSkills.map(skill => skill.name.toLowerCase());
  
  // 求人の必須スキルと優先スキル
  const requiredSkillNames = jobRequirements.requiredSkills.map(skill => skill.name.toLowerCase());
  const preferredSkillNames = jobRequirements.preferredSkills.map(skill => skill.name.toLowerCase());
  
  // スキルの一致数を計算
  const requiredSkillsMatch = requiredSkillNames.filter(skill => candidateSkillNames.includes(skill)).length;
  const preferredSkillsMatch = preferredSkillNames.filter(skill => candidateSkillNames.includes(skill)).length;
  
  // モデル入力データを構築
  return {
    candidate_experience: candidate.yearsOfExperience || 0,
    job_min_experience: jobRequirements.minExperience || 0,
    job_max_experience: jobRequirements.maxExperience || 99,
    candidate_education_level: convertEducationToLevel(candidate.education),
    job_education_level: convertEducationToLevel(jobRequirements.educationLevel),
    required_skills_count: requiredSkillNames.length,
    preferred_skills_count: preferredSkillNames.length,
    required_skills_match: requiredSkillsMatch,
    preferred_skills_match: preferredSkillsMatch,
    location_match: candidate.location === jobRequirements.location ? 1 : 0,
    job_type_match: candidate.preferredJobType === jobRequirements.jobType ? 1 : 0
  };
}

/**
 * 学歴情報を数値レベルに変換する関数
 * @param {string} education - 学歴情報
 * @returns {number} - 学歴レベル（0-5）
 */
function convertEducationToLevel(education) {
  if (!education) return 0;
  
  const eduLower = education.toLowerCase();
  
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
    return 0;
  }
}

/**
 * ルールベースのマッチングスコアを計算する関数
 * @param {Object} candidate - 候補者データ
 * @param {Object} jobRequirements - 求人要件
 * @returns {Object} - マッチングスコアと理由
 */
function calculateRuleBasedMatch(candidate, jobRequirements) {
  // 各マッチング要素のスコアと理由を格納する変数
  let totalScore = 0;
  const reasons = [];
  
  // --------------- スキルマッチング ---------------
  const skillMatchResult = calculateSkillMatch(candidate, jobRequirements);
  totalScore += skillMatchResult.score * 0.4; // スキルは40%のウェイト
  reasons.push(...skillMatchResult.reasons);
  
  // --------------- 経験年数 ---------------
  const experienceMatchResult = calculateExperienceMatch(candidate, jobRequirements);
  totalScore += experienceMatchResult.score * 0.25; // 経験は25%のウェイト
  reasons.push(...experienceMatchResult.reasons);
  
  // --------------- 学歴 ---------------
  const educationMatchResult = calculateEducationMatch(candidate, jobRequirements);
  totalScore += educationMatchResult.score * 0.15; // 学歴は15%のウェイト
  reasons.push(...educationMatchResult.reasons);
  
  // --------------- その他の要素 ---------------
  const otherFactorsResult = calculateOtherFactorsMatch(candidate, jobRequirements);
  totalScore += otherFactorsResult.score * 0.2; // その他の要素は20%のウェイト
  reasons.push(...otherFactorsResult.reasons);
  
  // 結果を返す
  return {
    score: Math.min(totalScore, 1.0), // 最大値は1.0
    reasons: reasons
  };
}

/**
 * スキルマッチスコアを計算する関数
 * @param {Object} candidate - 候補者データ
 * @param {Object} jobRequirements - 求人要件
 * @returns {Object} - スキルマッチスコアと理由
 */
function calculateSkillMatch(candidate, jobRequirements) {
  const candidateSkills = candidate.skills || [];
  const candidateSkillNames = candidateSkills.map(skill => skill.name.toLowerCase());
  
  const requiredSkills = jobRequirements.requiredSkills || [];
  const preferredSkills = jobRequirements.preferredSkills || [];
  
  const requiredSkillNames = requiredSkills.map(skill => skill.name.toLowerCase());
  const preferredSkillNames = preferredSkills.map(skill => skill.name.toLowerCase());
  
  // 必須スキルと優先スキルの一致数を計算
  const matchedRequiredSkills = requiredSkillNames.filter(skill => candidateSkillNames.includes(skill));
  const matchedPreferredSkills = preferredSkillNames.filter(skill => candidateSkillNames.includes(skill));
  
  // 一致率を計算
  const requiredMatchRate = requiredSkillNames.length > 0 
    ? matchedRequiredSkills.length / requiredSkillNames.length 
    : 1.0;
  
  const preferredMatchRate = preferredSkillNames.length > 0 
    ? matchedPreferredSkills.length / preferredSkillNames.length 
    : 1.0;
  
  // 最終スコアを計算（必須スキルは70%、優先スキルは30%のウェイト）
  const skillScore = (requiredMatchRate * 0.7) + (preferredMatchRate * 0.3);
  
  // 理由を生成
  const reasons = [];
  
  if (matchedRequiredSkills.length > 0) {
    reasons.push(`必須スキル ${matchedRequiredSkills.join(', ')} が一致`);
  }
  
  if (requiredSkillNames.length > 0 && matchedRequiredSkills.length < requiredSkillNames.length) {
    const missingSkills = requiredSkillNames.filter(skill => !candidateSkillNames.includes(skill));
    reasons.push(`必須スキル ${missingSkills.join(', ')} が不足`);
  }
  
  if (matchedPreferredSkills.length > 0) {
    reasons.push(`優先スキル ${matchedPreferredSkills.join(', ')} が一致`);
  }
  
  return {
    score: skillScore,
    reasons: reasons
  };
}

/**
 * 経験年数マッチスコアを計算する関数
 * @param {Object} candidate - 候補者データ
 * @param {Object} jobRequirements - 求人要件
 * @returns {Object} - 経験年数マッチスコアと理由
 */
function calculateExperienceMatch(candidate, jobRequirements) {
  const candidateExperience = candidate.yearsOfExperience || 0;
  const minExperience = jobRequirements.minExperience || 0;
  const maxExperience = jobRequirements.maxExperience || 99;
  
  let experienceScore = 0;
  const reasons = [];
  
  // 要求される最小経験年数を満たしているか
  if (candidateExperience >= minExperience) {
    // 最小経験年数を満たしている場合
    if (maxExperience < 99 && candidateExperience <= maxExperience) {
      // 経験年数が範囲内にある場合は満点
      experienceScore = 1.0;
      reasons.push(`経験年数 ${candidateExperience} 年は求人の要件（${minExperience}〜${maxExperience}年）を満たしています`);
    } else if (maxExperience < 99 && candidateExperience > maxExperience) {
      // 経験年数が上限を超えている場合は減点（上限の2倍までは許容）
      const overExperienceRatio = Math.min(1, (maxExperience * 2 - candidateExperience) / maxExperience);
      experienceScore = 0.7 + (overExperienceRatio * 0.3); // 最低でも0.7
      reasons.push(`経験年数 ${candidateExperience} 年は求人の上限（${maxExperience}年）を超えています`);
    } else {
      // 上限が指定されていない場合は満点
      experienceScore = 1.0;
      reasons.push(`経験年数 ${candidateExperience} 年は求人の最小要件（${minExperience}年）を満たしています`);
    }
  } else {
    // 最小経験年数を満たしていない場合
    // 経験年数の差に基づいてスコアを計算（最小との差が3年以内なら部分的にマッチ）
    const experienceGap = minExperience - candidateExperience;
    if (experienceGap <= 3) {
      experienceScore = 0.6 * (1 - experienceGap / 3);
      reasons.push(`経験年数 ${candidateExperience} 年は求人の最小要件（${minExperience}年）をわずかに下回っています`);
    } else {
      experienceScore = 0;
      reasons.push(`経験年数 ${candidateExperience} 年は求人の最小要件（${minExperience}年）を大幅に下回っています`);
    }
  }
  
  return {
    score: experienceScore,
    reasons: reasons
  };
}

/**
 * 学歴マッチスコアを計算する関数
 * @param {Object} candidate - 候補者データ
 * @param {Object} jobRequirements - 求人要件
 * @returns {Object} - 学歴マッチスコアと理由
 */
function calculateEducationMatch(candidate, jobRequirements) {
  const candidateEducation = candidate.education || '';
  const requiredEducation = jobRequirements.educationLevel || '';
  
  if (!requiredEducation) {
    // 要求される学歴がない場合は満点
    return {
      score: 1.0,
      reasons: ['求人に特定の学歴要件がありません']
    };
  }
  
  const candidateLevel = convertEducationToLevel(candidateEducation);
  const requiredLevel = convertEducationToLevel(requiredEducation);
  
  let educationScore = 0;
  const reasons = [];
  
  if (candidateLevel >= requiredLevel) {
    // 要求される学歴以上の場合は満点
    educationScore = 1.0;
    reasons.push(`学歴（${candidateEducation}）は求人の要件（${requiredEducation}）を満たしています`);
  } else {
    // 要求される学歴未満の場合はレベルの差に基づいてスコアを計算
    const levelDifference = requiredLevel - candidateLevel;
    if (levelDifference === 1) {
      educationScore = 0.5;
      reasons.push(`学歴（${candidateEducation}）は求人の要件（${requiredEducation}）をわずかに下回っています`);
    } else {
      educationScore = 0.2;
      reasons.push(`学歴（${candidateEducation}）は求人の要件（${requiredEducation}）を下回っています`);
    }
  }
  
  return {
    score: educationScore,
    reasons: reasons
  };
}

/**
 * その他の要素のマッチスコアを計算する関数
 * @param {Object} candidate - 候補者データ
 * @param {Object} jobRequirements - 求人要件
 * @returns {Object} - その他の要素のマッチスコアと理由
 */
function calculateOtherFactorsMatch(candidate, jobRequirements) {
  let otherFactorsScore = 0;
  const reasons = [];
  let factorCount = 0;
  
  // 地域のマッチング
  if (candidate.location && jobRequirements.location) {
    factorCount++;
    if (candidate.location.toLowerCase() === jobRequirements.location.toLowerCase()) {
      otherFactorsScore += 1.0;
      reasons.push(`勤務地（${candidate.location}）が一致しています`);
    } else {
      reasons.push(`勤務地（${candidate.location}と${jobRequirements.location}）が一致していません`);
    }
  }
  
  // 雇用形態のマッチング
  if (candidate.preferredJobType && jobRequirements.jobType) {
    factorCount++;
    if (candidate.preferredJobType.toLowerCase() === jobRequirements.jobType.toLowerCase()) {
      otherFactorsScore += 1.0;
      reasons.push(`雇用形態（${jobRequirements.jobType}）が希望と一致しています`);
    } else {
      reasons.push(`雇用形態（${jobRequirements.jobType}）が希望（${candidate.preferredJobType}）と一致していません`);
    }
  }
  
  // 部署/職種のマッチング
  if (candidate.preferredDepartment && jobRequirements.department) {
    factorCount++;
    if (candidate.preferredDepartment.toLowerCase() === jobRequirements.department.toLowerCase()) {
      otherFactorsScore += 1.0;
      reasons.push(`部署/職種（${jobRequirements.department}）が希望と一致しています`);
    } else {
      reasons.push(`部署/職種（${jobRequirements.department}）が希望（${candidate.preferredDepartment}）と一致していません`);
    }
  }
  
  // 平均スコアを計算
  const finalScore = factorCount > 0 ? otherFactorsScore / factorCount : 0.5;
  
  if (factorCount === 0) {
    reasons.push('その他の要素（勤務地、雇用形態、部署など）の情報が不足しています');
  }
  
  return {
    score: finalScore,
    reasons: reasons
  };
}

/**
 * マッチング結果をDynamoDBに保存する関数
 * @param {string} jobId - 求人ID
 * @param {Array} matchedCandidates - マッチング結果
 */
async function saveMatchResults(jobId, matchedCandidates) {
  try {
    const timestamp = new Date().toISOString();
    const matchId = `${jobId}-${timestamp}`;
    
    const params = {
      TableName: MATCHES_TABLE,
      Item: {
        id: matchId,
        jobId: jobId,
        timestamp: timestamp,
        matchedCandidates: matchedCandidates,
        matchCount: matchedCandidates.length
      }
    };
    
    await dynamoDB.put(params).promise();
    console.log(`マッチング結果を保存しました: ${matchId}`);
    
  } catch (error) {
    console.error('マッチング結果の保存中にエラーが発生しました:', error);
    throw error;
  }
}

/**
 * HTTPレスポンスを整形する関数
 * @param {number} statusCode - ステータスコード
 * @param {Object} body - レスポンスボディ
 * @returns {Object} - 整形されたレスポンス
 */
function formatResponse(statusCode, body) {
  return {
    statusCode: statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization'
    },
    body: JSON.stringify(body)
  };
} 