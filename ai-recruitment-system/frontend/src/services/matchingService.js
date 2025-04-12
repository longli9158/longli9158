import axios from 'axios';

// APIエンドポイントのベースURL
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.neocrea.example.com';

/**
 * 候補者と求人のマッチングを行う
 * @param {string} candidateId - 候補者ID
 * @param {string} jobId - 求人ID
 * @returns {Promise} - マッチング結果
 */
export const matchCandidateWithJob = async (candidateId, jobId) => {
  try {
    // APIエンドポイントにPOSTリクエストを送信
    const response = await axios.post(`${API_BASE_URL}/matching`, {
      candidateId,
      jobId
    });
    
    return response.data;
  } catch (error) {
    console.error('マッチング処理でエラーが発生しました:', error);
    throw new Error(error.response?.data?.message || 'マッチングリクエストの処理中にエラーが発生しました');
  }
};

/**
 * 候補者一覧を取得する
 * @param {Object} filters - 絞り込み条件（オプション）
 * @returns {Promise} - 候補者一覧
 */
export const getCandidates = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates`, { params: filters });
    return response.data;
  } catch (error) {
    console.error('候補者一覧の取得に失敗しました:', error);
    throw new Error(error.response?.data?.message || '候補者データの取得中にエラーが発生しました');
  }
};

/**
 * 求人一覧を取得する
 * @param {Object} filters - 絞り込み条件（オプション）
 * @returns {Promise} - 求人一覧
 */
export const getJobs = async (filters = {}) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/jobs`, { params: filters });
    return response.data;
  } catch (error) {
    console.error('求人一覧の取得に失敗しました:', error);
    throw new Error(error.response?.data?.message || '求人データの取得中にエラーが発生しました');
  }
};

/**
 * 候補者の詳細情報を取得する
 * @param {string} candidateId - 候補者ID
 * @returns {Promise} - 候補者の詳細情報
 */
export const getCandidateById = async (candidateId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/candidates/${candidateId}`);
    return response.data;
  } catch (error) {
    console.error(`候補者ID:${candidateId}の取得に失敗しました:`, error);
    throw new Error(error.response?.data?.message || '候補者データの取得中にエラーが発生しました');
  }
};

/**
 * 求人の詳細情報を取得する
 * @param {string} jobId - 求人ID
 * @returns {Promise} - 求人の詳細情報
 */
export const getJobById = async (jobId) => {
  try {
    const response = await axios.get(`${API_BASE_URL}/jobs/${jobId}`);
    return response.data;
  } catch (error) {
    console.error(`求人ID:${jobId}の取得に失敗しました:`, error);
    throw new Error(error.response?.data?.message || '求人データの取得中にエラーが発生しました');
  }
};

/**
 * 候補者情報を更新する
 * @param {string} candidateId - 候補者ID
 * @param {Object} data - 更新データ
 * @returns {Promise} - 更新結果
 */
export const updateCandidate = async (candidateId, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/candidates/${candidateId}`, data);
    return response.data;
  } catch (error) {
    console.error(`候補者ID:${candidateId}の更新に失敗しました:`, error);
    throw new Error(error.response?.data?.message || '候補者データの更新中にエラーが発生しました');
  }
};

/**
 * 求人情報を更新する
 * @param {string} jobId - 求人ID
 * @param {Object} data - 更新データ
 * @returns {Promise} - 更新結果
 */
export const updateJob = async (jobId, data) => {
  try {
    const response = await axios.put(`${API_BASE_URL}/jobs/${jobId}`, data);
    return response.data;
  } catch (error) {
    console.error(`求人ID:${jobId}の更新に失敗しました:`, error);
    throw new Error(error.response?.data?.message || '求人データの更新中にエラーが発生しました');
  }
};

/**
 * マッチング履歴を取得する
 * @param {string} candidateId - 候補者ID（オプション）
 * @param {string} jobId - 求人ID（オプション）
 * @returns {Promise} - マッチング履歴
 */
export const getMatchingHistory = async (candidateId, jobId) => {
  try {
    const params = {};
    if (candidateId) params.candidateId = candidateId;
    if (jobId) params.jobId = jobId;
    
    const response = await axios.get(`${API_BASE_URL}/matching/history`, { params });
    return response.data;
  } catch (error) {
    console.error('マッチング履歴の取得に失敗しました:', error);
    throw new Error(error.response?.data?.message || 'マッチング履歴の取得中にエラーが発生しました');
  }
}; 