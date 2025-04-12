import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  List,
  ListItem,
  ListItemText,
  Divider,
  Paper,
  Chip,
  Grid,
  LinearProgress,
  CircularProgress
} from '@mui/material';
import {
  Mic as MicIcon,
  Stop as StopIcon,
  Refresh as RefreshIcon,
  Send as SendIcon
} from '@mui/icons-material';

// モック質問データ
const mockInterviewQuestions = [
  {
    id: 1,
    category: 'technical',
    question: 'あなたのプログラミングの経験について教えてください。特に、最近取り組んだプロジェクトについて詳しく説明してください。'
  },
  {
    id: 2,
    category: 'experience',
    question: 'チームでの作業経験について教えてください。難しい状況でどのように協力しましたか？'
  },
  {
    id: 3,
    category: 'problem_solving',
    question: '技術的に難しい問題に直面したとき、どのようにアプローチしますか？具体例を挙げてください。'
  }
];

// モックフィードバックデータ
const mockFeedback = {
  overallScore: 82,
  categoryScores: {
    communication: 85,
    technicalKnowledge: 80,
    problemSolving: 78,
    culturalFit: 86
  },
  feedback: {
    strengths: [
      "明確で簡潔なコミュニケーションスキルを示しています",
      "企業の価値観と使命に強い共感を示しています"
    ],
    improvements: [
      "技術的な概念をより詳細に説明するとよいでしょう"
    ],
    suggestions: [
      "STAR手法を使った回答構成の改善"
    ]
  }
};

const InterviewSimulator = () => {
  const [activeQuestion, setActiveQuestion] = useState(0);
  const [isRecording, setIsRecording] = useState(false);
  const [answers, setAnswers] = useState({});
  const [textAnswer, setTextAnswer] = useState('');
  const [showFeedback, setShowFeedback] = useState(false);
  const [isInterviewComplete, setIsInterviewComplete] = useState(false);
  
  const handleStartRecording = () => {
    setIsRecording(true);
    // 実際のアプリケーションでは、ここで録音APIを呼び出す
  };

  const handleStopRecording = () => {
    setIsRecording(false);
    // 実際のアプリケーションでは、ここで録音を停止し、音声をテキストに変換するAPIを呼び出す
    
    // モック応答を設定
    const currentQuestionId = mockInterviewQuestions[activeQuestion].id;
    setAnswers({
      ...answers,
      [currentQuestionId]: "これはマイクで録音された回答のシミュレーションです。"
    });
    
    // 次の質問に進むか、面接を完了する
    if (activeQuestion < mockInterviewQuestions.length - 1) {
      setActiveQuestion(activeQuestion + 1);
      setTextAnswer('');
    } else {
      setIsInterviewComplete(true);
    }
  };

  const handleTextAnswerSubmit = () => {
    if (!textAnswer.trim()) return;
    
    const currentQuestionId = mockInterviewQuestions[activeQuestion].id;
    setAnswers({
      ...answers,
      [currentQuestionId]: textAnswer
    });
    
    // 次の質問に進むか、面接を完了する
    if (activeQuestion < mockInterviewQuestions.length - 1) {
      setActiveQuestion(activeQuestion + 1);
      setTextAnswer('');
    } else {
      setIsInterviewComplete(true);
    }
  };

  const handleResetInterview = () => {
    setActiveQuestion(0);
    setAnswers({});
    setTextAnswer('');
    setShowFeedback(false);
    setIsInterviewComplete(false);
  };

  const handleGetFeedback = () => {
    setShowFeedback(true);
    // 実際のアプリケーションでは、ここでフィードバックAPIを呼び出す
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        面接シミュレーター
      </Typography>
      <Typography variant="body1" color="text.secondary" paragraph>
        実際の面接を模擬練習し、AIからのフィードバックを得ることができます。
      </Typography>

      <Grid container spacing={3}>
        {/* 左側: 質問と回答 */}
        <Grid item xs={12} md={8}>
          <Card>
            <CardContent>
              {!isInterviewComplete ? (
                <>
                  <Box sx={{ mb: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary">
                      質問 {activeQuestion + 1} / {mockInterviewQuestions.length}
                    </Typography>
                    <LinearProgress 
                      variant="determinate" 
                      value={(activeQuestion / mockInterviewQuestions.length) * 100} 
                      sx={{ mt: 1, mb: 3 }}
                    />
                    
                    <Typography variant="h6" gutterBottom>
                      {mockInterviewQuestions[activeQuestion].question}
                    </Typography>
                    <Chip 
                      label={mockInterviewQuestions[activeQuestion].category}
                      size="small"
                      color="primary"
                      sx={{ mb: 2 }}
                    />
                  </Box>

                  <Divider sx={{ my: 3 }} />

                  <Box>
                    <Typography variant="subtitle1" gutterBottom>
                      あなたの回答:
                    </Typography>
                    
                    <TextField
                      fullWidth
                      multiline
                      rows={4}
                      placeholder="ここに回答を入力するか、マイクボタンを押して話してください..."
                      value={textAnswer}
                      onChange={(e) => setTextAnswer(e.target.value)}
                      disabled={isRecording}
                      sx={{ mb: 2 }}
                    />
                    
                    <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                      <Box>
                        {!isRecording ? (
                          <Button
                            variant="outlined"
                            color="primary"
                            startIcon={<MicIcon />}
                            onClick={handleStartRecording}
                          >
                            録音開始
                          </Button>
                        ) : (
                          <Button
                            variant="contained"
                            color="error"
                            startIcon={<StopIcon />}
                            onClick={handleStopRecording}
                          >
                            録音停止
                          </Button>
                        )}
                      </Box>
                      
                      <Box>
                        <Button
                          variant="outlined"
                          sx={{ mr: 1 }}
                          onClick={handleResetInterview}
                        >
                          リセット
                        </Button>
                        <Button
                          variant="contained"
                          endIcon={<SendIcon />}
                          onClick={handleTextAnswerSubmit}
                          disabled={isRecording || !textAnswer.trim()}
                        >
                          回答を送信
                        </Button>
                      </Box>
                    </Box>
                  </Box>
                </>
              ) : (
                <Box>
                  <Typography variant="h6" gutterBottom>
                    面接完了
                  </Typography>
                  <Typography paragraph>
                    すべての質問に回答しました。フィードバックを取得するか、面接をリセットできます。
                  </Typography>
                  
                  <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                    <Button
                      variant="outlined"
                      startIcon={<RefreshIcon />}
                      onClick={handleResetInterview}
                    >
                      面接をリセット
                    </Button>
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={handleGetFeedback}
                      disabled={showFeedback}
                    >
                      フィードバックを取得
                    </Button>
                  </Box>
                  
                  {/* 回答の要約 */}
                  <Box sx={{ mt: 4 }}>
                    <Typography variant="subtitle1" gutterBottom>
                      回答の要約:
                    </Typography>
                    <Paper variant="outlined" sx={{ p: 2 }}>
                      <List>
                        {mockInterviewQuestions.map((q, index) => (
                          <React.Fragment key={q.id}>
                            <ListItem alignItems="flex-start">
                              <ListItemText
                                primary={<Typography variant="subtitle2">Q{index + 1}: {q.question}</Typography>}
                                secondary={
                                  <Typography
                                    variant="body2"
                                    sx={{ mt: 1, color: 'text.primary' }}
                                  >
                                    {answers[q.id] || "回答なし"}
                                  </Typography>
                                }
                              />
                            </ListItem>
                            {index < mockInterviewQuestions.length - 1 && <Divider component="li" />}
                          </React.Fragment>
                        ))}
                      </List>
                    </Paper>
                  </Box>
                </Box>
              )}
            </CardContent>
          </Card>
        </Grid>

        {/* 右側: フィードバックと指示 */}
        <Grid item xs={12} md={4}>
          {showFeedback ? (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  面接フィードバック
                </Typography>
                
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <Box sx={{ position: 'relative', display: 'inline-flex', mr: 2 }}>
                    <CircularProgress
                      variant="determinate"
                      value={mockFeedback.overallScore}
                      size={60}
                      thickness={5}
                      color={mockFeedback.overallScore >= 80 ? "success" : "primary"}
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
                      <Typography variant="subtitle2" component="div">
                        {mockFeedback.overallScore}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography variant="h5">
                    総合スコア
                  </Typography>
                </Box>
                
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 3 }}>
                  カテゴリ別スコア:
                </Typography>
                
                {Object.entries(mockFeedback.categoryScores).map(([category, score]) => (
                  <Box key={category} sx={{ mb: 1 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 0.5 }}>
                      <Typography variant="body2">
                        {category}
                      </Typography>
                      <Typography variant="body2" fontWeight="bold">
                        {score}/100
                      </Typography>
                    </Box>
                    <LinearProgress 
                      variant="determinate" 
                      value={score} 
                      color={score >= 80 ? "success" : "primary"}
                    />
                  </Box>
                ))}
                
                <Divider sx={{ my: 3 }} />
                
                <Typography variant="subtitle1" gutterBottom>
                  強み:
                </Typography>
                <List dense>
                  {mockFeedback.feedback.strengths.map((strength, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemText 
                        primary={`• ${strength}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
                
                <Typography variant="subtitle1" gutterBottom sx={{ mt: 2 }}>
                  改善点:
                </Typography>
                <List dense>
                  {mockFeedback.feedback.improvements.map((improvement, index) => (
                    <ListItem key={index} disableGutters>
                      <ListItemText 
                        primary={`• ${improvement}`}
                        primaryTypographyProps={{ variant: 'body2' }}
                      />
                    </ListItem>
                  ))}
                </List>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  シミュレーションのヒント
                </Typography>
                <List>
                  <ListItem>
                    <ListItemText
                      primary="STAR手法を使う"
                      secondary="状況、タスク、行動、結果の順で説明しましょう。"
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText
                      primary="具体的な例を挙げる"
                      secondary="抽象的な説明ではなく、具体的な経験や成果を共有しましょう。"
                    />
                  </ListItem>
                  <Divider component="li" />
                  <ListItem>
                    <ListItemText
                      primary="簡潔に話す"
                      secondary="要点を絞って、わかりやすく簡潔に回答しましょう。"
                    />
                  </ListItem>
                </List>
              </CardContent>
            </Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default InterviewSimulator; 