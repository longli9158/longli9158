import axios from 'axios';

// APIの基本設定
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'https://api.neocrea.example.com';
const API_VERSION = 'v1';

/**
 * NeoCrea APIクライアント
 * すべてのAPIリクエストを処理する共通クライアント
 */
class ApiClient {
  constructor() {
    // axiosインスタンスの作成と基本設定
    this.client = axios.create({
      baseURL: `${API_BASE_URL}/${API_VERSION}`,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      }
    });

    // リクエストインターセプター（認証トークンの追加など）
    this.client.interceptors.request.use(
      config => {
        const token = localStorage.getItem('auth_token');
        if (token) {
          config.headers['Authorization'] = `Bearer ${token}`;
        }
        return config;
      },
      error => {
        console.error('APIリクエスト準備中にエラーが発生しました:', error);
        return Promise.reject(error);
      }
    );

    // レスポンスインターセプター（エラーハンドリングなど）
    this.client.interceptors.response.use(
      response => response,
      error => {
        // 認証エラー処理
        if (error.response && error.response.status === 401) {
          console.warn('認証エラー: トークンが無効または期限切れです');
          localStorage.removeItem('auth_token');
          window.location.href = '/login';
        }

        // その他のAPIエラー処理
        const errorMessage = error.response?.data?.message || 'APIリクエスト中にエラーが発生しました';
        console.error('APIエラー:', errorMessage, error);
        return Promise.reject(error);
      }
    );
  }

  /**
   * GET リクエスト
   * @param {string} endpoint - APIエンドポイント
   * @param {Object} params - クエリパラメータ
   * @returns {Promise} - レスポンスデータ
   */
  async get(endpoint, params = {}) {
    try {
      const response = await this.client.get(endpoint, { params });
      return response.data;
    } catch (error) {
      this.handleError(error, `GET ${endpoint}`);
      throw error;
    }
  }

  /**
   * POST リクエスト
   * @param {string} endpoint - APIエンドポイント
   * @param {Object} data - リクエストボディ
   * @returns {Promise} - レスポンスデータ
   */
  async post(endpoint, data = {}) {
    try {
      const response = await this.client.post(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error, `POST ${endpoint}`);
      throw error;
    }
  }

  /**
   * PUT リクエスト
   * @param {string} endpoint - APIエンドポイント
   * @param {Object} data - リクエストボディ
   * @returns {Promise} - レスポンスデータ
   */
  async put(endpoint, data = {}) {
    try {
      const response = await this.client.put(endpoint, data);
      return response.data;
    } catch (error) {
      this.handleError(error, `PUT ${endpoint}`);
      throw error;
    }
  }

  /**
   * DELETE リクエスト
   * @param {string} endpoint - APIエンドポイント
   * @param {Object} params - クエリパラメータ
   * @returns {Promise} - レスポンスデータ
   */
  async delete(endpoint, params = {}) {
    try {
      const response = await this.client.delete(endpoint, { params });
      return response.data;
    } catch (error) {
      this.handleError(error, `DELETE ${endpoint}`);
      throw error;
    }
  }

  /**
   * ファイルアップロード用 POST リクエスト
   * @param {string} endpoint - APIエンドポイント
   * @param {FormData} formData - フォームデータ（ファイルを含む）
   * @returns {Promise} - レスポンスデータ
   */
  async uploadFile(endpoint, formData) {
    try {
      const response = await this.client.post(endpoint, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      return response.data;
    } catch (error) {
      this.handleError(error, `FILE UPLOAD ${endpoint}`);
      throw error;
    }
  }

  /**
   * エラーハンドリング
   * @param {Error} error - エラーオブジェクト
   * @param {string} operation - 失敗した操作の説明
   */
  handleError(error, operation) {
    const status = error.response?.status;
    const message = error.response?.data?.message || error.message;
    
    console.error(`APIエラー (${operation}):`, {
      status,
      message,
      details: error.response?.data
    });
    
    // 特定のエラー処理をここに追加可能
    // 例: 特定のコンポーネントにエラーを通知する、リトライポリシーを実装するなど
  }
}

// シングルトンインスタンスをエクスポート
const apiClient = new ApiClient();
export default apiClient; 