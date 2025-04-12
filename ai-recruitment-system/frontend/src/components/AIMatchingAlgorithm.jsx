import React, { useState, useEffect } from 'react';
import { 
  Users, Briefcase, Code, Database, Cloud, Heart, Clock, 
  ChevronDown, Search, Filter, Download, CheckCircle, XCircle 
} from 'lucide-react';
import CandidateMatchingForm from './matching/CandidateMatchingForm';
import JobRequirementsForm from './matching/JobRequirementsForm';
import MatchingResults from './matching/MatchingResults';
import MatchingVisualizer from './matching/MatchingVisualizer';
// マッチングサービスのインポート
import { 
  matchCandidateWithJob, 
  getCandidates, 
  getJobs, 
  getCandidateById, 
  getJobById 
} from '../services/matchingService';
import { Box, Button, Typography, Paper, CircularProgress, Grid } from '@mui/material';
// APIクライアントの設定
import axios from 'axios';

// APIベースURLを設定
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || 'http://localhost:3001/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// エラーハンドリングインターセプターの追加
api.interceptors.response.use(
  response => response,
  error => {
    console.error('API Error:', error);
    // APIエラーを処理
    return Promise.reject(error);
  }
);

const AIMatchingAlgorithm = () => {
  // 状態変数
  const [activeTab, setActiveTab] = useState('candidates'); // candidates, jobs, results
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  
  // 候補者と求人データ
  const [candidates, setCandidates] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [selectedCandidate, setSelectedCandidate] = useState(null);
  const [selectedJob, setSelectedJob] = useState(null);
  
  // マッチング結果
  const [matchingResults, setMatchingResults] = useState(null);
  
  // ステート変数の初期化
  const [isLoading, setIsLoading] = useState(false);
  const [matchResults, setMatchResults] = useState(null);
  
  // 初期データの読み込み
  useEffect(() => {
    // APIからデータを取得
    const loadInitialData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // 候補者と求人データの取得
        const [candidatesData, jobsData] = await Promise.all([
          getCandidates(),
          getJobs()
        ]);
        
        if (candidatesData.length > 0 && jobsData.length > 0) {
          setCandidates(candidatesData);
          setJobs(jobsData);
          setSelectedCandidate(candidatesData[0]);
          setSelectedJob(jobsData[0]);
        } else {
          // データが取得できない場合はエラーを表示
          if (candidatesData.length === 0) {
            setError('候補者データが見つかりませんでした');
          } else if (jobsData.length === 0) {
            setError('求人データが見つかりませんでした');
          }
          
          // モックデータをフォールバックとして使用
          const mockCandidates = [
            {
              id: 'c1',
              name: '山田太郎',
              skills: {
                'プログラミング言語': ['Python', 'JavaScript', 'Java'],
                'フレームワーク': ['React', 'Django', 'Spring'],
                'データベース': ['MySQL', 'MongoDB'],
                'クラウド': ['AWS', 'Docker'],
                'ソフトスキル': ['コミュニケーション', 'チームワーク'],
                'ビジネス': ['プロジェクト管理']
              },
              experience_analysis: {
                total_years: 5,
                industries: {'IT': 3, '金融': 2},
                has_management_exp: true,
                avg_project_scale: 8
              },
              values: [
                'イノベーション重視', 
                '働きやすい環境', 
                '継続的な学習', 
                'チームワーク'
              ]
            },
            {
              id: 'c2',
              name: '鈴木花子',
              skills: {
                'プログラミング言語': ['JavaScript', 'TypeScript', 'Ruby'],
                'フレームワーク': ['React', 'Vue.js', 'Ruby on Rails'],
                'データベース': ['PostgreSQL', 'Redis'],
                'クラウド': ['AWS', 'Heroku'],
                'ソフトスキル': ['コミュニケーション', 'リーダーシップ', '問題解決'],
                'ビジネス': ['マーケティング', 'プロジェクト管理']
              },
              experience_analysis: {
                total_years: 7,
                industries: {'Web開発': 4, 'メディア': 3},
                has_management_exp: true,
                avg_project_scale: 6
              },
              values: [
                'クリエイティビティ', 
                'ワークライフバランス', 
                '自己成長', 
                'ユーザー中心設計'
              ]
            }
          ];
          
          const mockJobs = [
            {
              job_id: 'job123',
              job_title: 'シニアバックエンドエンジニア',
              company: 'テック株式会社',
              required_skills: {
                'プログラミング言語': ['Python', 'Java'],
                'フレームワーク': ['Django', 'Spring'],
                'データベース': ['MySQL', 'PostgreSQL'],
                'クラウド': ['AWS', 'Docker', 'Kubernetes'],
                'ソフトスキル': ['コミュニケーション', 'リーダーシップ'],
                'ビジネス': ['プロジェクト管理']
              },
              experience_requirements: {
                min_years: 3,
                preferred_industries: ['IT', '金融'],
                requires_management: true,
                min_project_scale: 5
              },
              company_values: [
                'イノベーション', 
                '顧客中心主義', 
                '継続的な改善', 
                'チームワーク'
              ]
            },
            {
              job_id: 'job456',
              job_title: 'フロントエンドエンジニア',
              company: 'デザインテック株式会社',
              required_skills: {
                'プログラミング言語': ['JavaScript', 'TypeScript'],
                'フレームワーク': ['React', 'Vue.js', 'Angular'],
                'データベース': [],
                'クラウド': ['AWS', 'Vercel', 'Netlify'],
                'ソフトスキル': ['コミュニケーション', '創造性'],
                'ビジネス': ['ユーザー体験']
              },
              experience_requirements: {
                min_years: 2,
                preferred_industries: ['Web開発', 'メディア', 'IT'],
                requires_management: false,
                min_project_scale: 3
              },
              company_values: [
                'クリエイティビティ', 
                'ユーザー中心設計', 
                '継続的学習', 
                'チームワーク'
              ]
            }
          ];
          
          if (candidatesData.length === 0) {
            setCandidates(mockCandidates);
            setSelectedCandidate(mockCandidates[0]);
          }
          
          if (jobsData.length === 0) {
            setJobs(mockJobs);
            setSelectedJob(mockJobs[0]);
          }
        }
        
        setLoading(false);
      } catch (err) {
        console.error('データ取得エラー:', err);
        setError('データの読み込み中にエラーが発生しました: ' + err.message);
        setLoading(false);
        
        // エラー時はモックデータを使用
        const mockCandidates = [
          // ... ここに既存のモックデータが入る ...
        ];
        
        const mockJobs = [
          // ... ここに既存のモックデータが入る ...
        ];
        
        setCandidates(mockCandidates);
        setJobs(mockJobs);
        setSelectedCandidate(mockCandidates[0]);
        setSelectedJob(mockJobs[0]);
      }
    };
    
    loadInitialData();
  }, []);
  
  // マッチングの実行
  const runMatching = async () => {
    if (!selectedCandidate || !selectedJob) {
      setError('候補者と求人の両方を選択してください');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // APIを使用して実際にマッチングを実行
      const result = await matchCandidateWithJob(
        selectedCandidate.id, 
        selectedJob.job_id
      );
      
      setMatchingResults(result);
      setActiveTab('results');
      setLoading(false);
    } catch (err) {
      console.error('マッチングエラー:', err);
      setError('マッチング処理中にエラーが発生しました: ' + err.message);
      setLoading(false);
    }
  };
  
  // 候補者検索
  const searchCandidates = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') return;
    
    try {
      setLoading(true);
      // APIを使用して候補者を検索
      const result = await getCandidates({ search: searchTerm });
      setCandidates(result);
      setLoading(false);
    } catch (err) {
      console.error('候補者検索エラー:', err);
      setError('候補者の検索中にエラーが発生しました: ' + err.message);
      setLoading(false);
    }
  };
  
  // 求人検索
  const searchJobs = async (searchTerm) => {
    if (!searchTerm || searchTerm.trim() === '') return;
    
    try {
      setLoading(true);
      // APIを使用して求人を検索
      const result = await getJobs({ search: searchTerm });
      setJobs(result);
      setLoading(false);
    } catch (err) {
      console.error('求人検索エラー:', err);
      setError('求人の検索中にエラーが発生しました: ' + err.message);
      setLoading(false);
    }
  };
  
  // マッチング実行関数
  const handleMatchSubmit = async () => {
    try {
      setIsLoading(true);
      // APIリクエスト処理
      // 仮のデータをセット
      setMatchResults({
        jobMatches: [
          {
            jobId: 'job123',
            title: 'ソフトウェアエンジニア',
            company: '株式会社テック',
            score: 85,
            skillsMatch: 90,
            experienceMatch: 80,
            cultureMatch: 85
          }
        ]
      });
    } catch (error) {
      console.error('マッチング処理エラー:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // ローディング表示
  if (loading && !matchingResults) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-3 text-gray-600">データを読み込んでいます...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        AI求人マッチング
      </Typography>
      
      <Button 
        variant="contained" 
        color="primary" 
        onClick={handleMatchSubmit}
        disabled={isLoading}
        sx={{ mt: 2, mb: 4 }}
      >
        {isLoading ? '処理中...' : 'マッチング実行'}
      </Button>
      
      {isLoading && (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      )}
      
      {matchResults && (
        <Box sx={{ mt: 2 }}>
          <Typography variant="h5" gutterBottom>
            マッチング結果
          </Typography>
          
          <Grid container spacing={3}>
            {matchResults.jobMatches.map((job) => (
              <Grid item xs={12} md={6} key={job.jobId}>
                <Paper sx={{ p: 3 }}>
                  <Typography variant="h6">{job.title}</Typography>
                  <Typography variant="subtitle1">{job.company}</Typography>
                  <Typography variant="body1" sx={{ mt: 2 }}>
                    総合適合度: {job.score}%
                  </Typography>
                  <Typography variant="body2">
                    スキル適合度: {job.skillsMatch}%
                  </Typography>
                  <Typography variant="body2">
                    経験適合度: {job.experienceMatch}%
                  </Typography>
                  <Typography variant="body2">
                    文化適合度: {job.cultureMatch}%
                  </Typography>
                  <Button
                    variant="outlined"
                    color="primary"
                    sx={{ mt: 2 }}
                  >
                    詳細を見る
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default AIMatchingAlgorithm; 