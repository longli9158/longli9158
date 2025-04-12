import React, { useState, useEffect } from 'react';
import { 
  Box, 
  Card, 
  CardContent, 
  Typography, 
  Grid, 
  CircularProgress, 
  Button, 
  Paper, 
  Divider,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  TextField,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Chip
} from '@mui/material';
import { 
  Check as CheckIcon, 
  Close as CloseIcon, 
  Info as InfoIcon,
  PersonAdd as PersonAddIcon,
  Business as BusinessIcon,
  TrendingUp as TrendingUpIcon,
  Group as GroupIcon,
  School as SchoolIcon
} from '@mui/icons-material';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Radar, 
  RadarChart, 
  PolarGrid, 
  PolarAngleAxis, 
  PolarRadiusAxis 
} from 'recharts';

// モックデータ - 実際のアプリケーションではAPIから取得
const mockCandidates = [
  { id: 'c001', name: '田中 太郎', role: 'ソフトウェアエンジニア', matchScore: 85 },
  { id: 'c002', name: '鈴木 花子', role: 'データサイエンティスト', matchScore: 92 },
  { id: 'c003', name: '佐藤 一郎', role: 'プロダクトマネージャー', matchScore: 78 },
  { id: 'c004', name: '山田 健太', role: 'UXデザイナー', matchScore: 65 },
  { id: 'c005', name: '伊藤 美穂', role: 'マーケティングスペシャリスト', matchScore: 72 }
];

const mockCompanies = [
  { id: 'comp001', name: 'テックイノベーション株式会社', industry: 'IT' },
  { id: 'comp002', name: 'フューチャーデータ株式会社', industry: 'データ分析' },
  { id: 'comp003', name: 'クリエイティブデザイン株式会社', industry: 'デザイン' }
];

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#A569BD'];

// レーダーチャート用のデータ変換
const transformForRadarChart = (categoryScores) => {
  return Object.entries(categoryScores).map(([key, value]) => ({
    subject: key.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase()),
    A: value,
    fullMark: 100
  }));
};

const CultureMatchingDashboard = () => {
  const [selectedCandidate, setSelectedCandidate] = useState('');
  const [selectedCompany, setSelectedCompany] = useState('');
  const [loading, setLoading] = useState(false);
  const [matchResult, setMatchResult] = useState(null);
  const [error, setError] = useState(null);

  // 分析実行ハンドラー
  const handleAnalyze = () => {
    if (!selectedCandidate || !selectedCompany) {
      setError('候補者と企業の両方を選択してください');
      return;
    }

    setLoading(true);
    setError(null);

    // APIコールのシミュレーション
    setTimeout(() => {
      // モックレスポンス
      const mockResult = {
        match_score: 85.7,
        analysis_details: {
          category_scores: {
            values_alignment: 88,
            skill_relevance: 92,
            team_fit: 78,
            growth_potential: 86,
            cultural_contribution: 84
          },
          strengths: [
            'values_alignment',
            'skill_relevance',
            'growth_potential'
          ],
          improvements: [],
          recommendations: [
            'チーム構造とコミュニケーションスタイルについて詳細を確認してください',
            'この企業でのキャリア開発パスについて詳しく質問してください'
          ]
        }
      };

      setMatchResult(mockResult);
      setLoading(false);
    }, 1500);
  };

  const resetAnalysis = () => {
    setSelectedCandidate('');
    setSelectedCompany('');
    setMatchResult(null);
    setError(null);
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        企業文化マッチング分析
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        候補者と企業の文化的適合性を分析し、最適なマッチングを見つけるためのツールです。
      </Typography>

      <Grid container spacing={3}>
        {/* 分析設定カード */}
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                分析設定
              </Typography>
              <Box sx={{ mt: 2 }}>
                <FormControl fullWidth sx={{ mb: 2 }}>
                  <InputLabel id="candidate-select-label">候補者</InputLabel>
                  <Select
                    labelId="candidate-select-label"
                    id="candidate-select"
                    value={selectedCandidate}
                    label="候補者"
                    onChange={(e) => setSelectedCandidate(e.target.value)}
                    disabled={loading}
                  >
                    <MenuItem value="">
                      <em>選択してください</em>
                    </MenuItem>
                    {mockCandidates.map((candidate) => (
                      <MenuItem key={candidate.id} value={candidate.id}>
                        {candidate.name} - {candidate.role}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <FormControl fullWidth sx={{ mb: 3 }}>
                  <InputLabel id="company-select-label">企業</InputLabel>
                  <Select
                    labelId="company-select-label"
                    id="company-select"
                    value={selectedCompany}
                    label="企業"
                    onChange={(e) => setSelectedCompany(e.target.value)}
                    disabled={loading}
                  >
                    <MenuItem value="">
                      <em>選択してください</em>
                    </MenuItem>
                    {mockCompanies.map((company) => (
                      <MenuItem key={company.id} value={company.id}>
                        {company.name}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>

                <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
                  <Button 
                    variant="outlined" 
                    onClick={resetAnalysis}
                    disabled={loading || (!selectedCandidate && !selectedCompany && !matchResult)}
                  >
                    リセット
                  </Button>
                  <Button 
                    variant="contained" 
                    onClick={handleAnalyze}
                    disabled={loading || !selectedCandidate || !selectedCompany}
                  >
                    {loading ? <CircularProgress size={24} /> : '分析実行'}
                  </Button>
                </Box>

                {error && (
                  <Typography color="error" sx={{ mt: 2 }}>
                    {error}
                  </Typography>
                )}
              </Box>
            </CardContent>
          </Card>
        </Grid>

        {/* 分析結果カード */}
        <Grid item xs={12} md={8}>
          {matchResult ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h6">
                    マッチング分析結果
                  </Typography>
                  <Chip 
                    label={`マッチングスコア: ${matchResult.match_score}%`}
                    color={matchResult.match_score >= 80 ? 'success' : matchResult.match_score >= 60 ? 'primary' : 'warning'}
                    variant="outlined"
                    sx={{ fontWeight: 'bold' }}
                  />
                </Box>

                <Divider sx={{ mb: 3 }} />

                <Grid container spacing={3}>
                  {/* レーダーチャート */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      カテゴリ別スコア
                    </Typography>
                    <ResponsiveContainer width="100%" height={250}>
                      <RadarChart 
                        outerRadius={90} 
                        data={transformForRadarChart(matchResult.analysis_details.category_scores)}
                      >
                        <PolarGrid />
                        <PolarAngleAxis dataKey="subject" />
                        <PolarRadiusAxis angle={30} domain={[0, 100]} />
                        <Radar 
                          name="候補者" 
                          dataKey="A" 
                          stroke="#8884d8" 
                          fill="#8884d8" 
                          fillOpacity={0.6} 
                        />
                      </RadarChart>
                    </ResponsiveContainer>
                  </Grid>

                  {/* 強みと改善点 */}
                  <Grid item xs={12} md={6}>
                    <Typography variant="subtitle1" gutterBottom>
                      強みと推奨事項
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2, height: '100%' }}>
                      <Typography variant="subtitle2" color="primary" gutterBottom>
                        強み:
                      </Typography>
                      <List dense disablePadding>
                        {matchResult.analysis_details.strengths.map((strength, index) => (
                          <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: '30px' }}>
                              <CheckIcon color="success" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText 
                              primary={strength.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                            />
                          </ListItem>
                        ))}
                      </List>

                      {matchResult.analysis_details.improvements.length > 0 && (
                        <>
                          <Typography variant="subtitle2" color="secondary" sx={{ mt: 2 }} gutterBottom>
                            改善点:
                          </Typography>
                          <List dense disablePadding>
                            {matchResult.analysis_details.improvements.map((improvement, index) => (
                              <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                                <ListItemIcon sx={{ minWidth: '30px' }}>
                                  <CloseIcon color="error" fontSize="small" />
                                </ListItemIcon>
                                <ListItemText 
                                  primary={improvement.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())} 
                                />
                              </ListItem>
                            ))}
                          </List>
                        </>
                      )}

                      <Typography variant="subtitle2" sx={{ mt: 2 }} gutterBottom>
                        推奨事項:
                      </Typography>
                      <List dense disablePadding>
                        {matchResult.analysis_details.recommendations.map((recommendation, index) => (
                          <ListItem key={index} disablePadding sx={{ mb: 0.5 }}>
                            <ListItemIcon sx={{ minWidth: '30px' }}>
                              <InfoIcon color="info" fontSize="small" />
                            </ListItemIcon>
                            <ListItemText primary={recommendation} />
                          </ListItem>
                        ))}
                      </List>
                    </Paper>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          ) : (
            <Card sx={{ height: '100%', display: 'flex', justifyContent: 'center', alignItems: 'center' }}>
              <CardContent sx={{ textAlign: 'center' }}>
                <InfoIcon color="primary" sx={{ fontSize: 60, opacity: 0.3, mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  候補者と企業を選択して分析を実行してください
                </Typography>
              </CardContent>
            </Card>
          )}
        </Grid>

        {/* マッチング履歴カード */}
        {matchResult && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  マッチング比較
                </Typography>
                <Typography variant="body2" color="text.secondary" paragraph>
                  最近のマッチング結果との比較
                </Typography>

                <Grid container spacing={2}>
                  {mockCandidates.slice(0, 4).map((candidate, index) => (
                    <Grid item xs={12} sm={6} md={3} key={candidate.id}>
                      <Paper 
                        variant="outlined" 
                        sx={{ 
                          p: 2, 
                          bgcolor: candidate.id === selectedCandidate ? 'rgba(25, 118, 210, 0.08)' : 'transparent',
                          border: candidate.id === selectedCandidate ? '1px solid rgba(25, 118, 210, 0.5)' : '1px solid rgba(0, 0, 0, 0.12)'
                        }}
                      >
                        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                          <Typography variant="subtitle2">
                            {candidate.name}
                          </Typography>
                          <Chip 
                            label={`${candidate.matchScore}%`}
                            size="small"
                            color={candidate.matchScore >= 80 ? 'success' : candidate.matchScore >= 60 ? 'primary' : 'warning'}
                          />
                        </Box>
                        <Typography variant="body2" color="text.secondary" gutterBottom>
                          {candidate.role}
                        </Typography>
                        <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                          <Box sx={{ position: 'relative', display: 'inline-flex', mr: 1 }}>
                            <CircularProgress
                              variant="determinate"
                              value={candidate.matchScore}
                              size={40}
                              thickness={4}
                              sx={{
                                color: candidate.matchScore >= 80 ? 'success.main' : 
                                       candidate.matchScore >= 60 ? 'primary.main' : 'warning.main'
                              }}
                            />
                            <Box
                              sx={{
                                top: 0,
                                left: 0,
                                bottom: 0,
                                right: 0,
                                position: 'absolute',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                              }}
                            >
                              <Typography variant="caption" component="div" color="text.secondary">
                                {candidate.matchScore}
                              </Typography>
                            </Box>
                          </Box>
                          <Typography variant="body2">
                            {candidate.matchScore >= 80 ? '高い適合性' : 
                             candidate.matchScore >= 60 ? '良好な適合性' : '改善の余地あり'}
                          </Typography>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        )}
      </Grid>
    </Box>
  );
};

export default CultureMatchingDashboard; 