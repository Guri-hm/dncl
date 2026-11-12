"use client"
import { useEffect, useState } from 'react';
import {
  Alert,
  Box,
  Button,
  CircularProgress,
  FormControl,
  FormControlLabel,
  FormHelperText,
  FormLabel,
  LinearProgress,
  Paper,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { ContentWrapper } from '@/app/components/ContentWrapper';
import { HeaderBar, HeaderButton, HeaderTitle, ThemeToggleButton } from '@/app/components/Header';
import { PageWrapper } from '@/app/components/PageWrapper';
import {
  buildPredictionProgram,
  CodePredictionQuestion,
  createCodePredictionQuestions,
  isPredictedOutputCorrect,
} from '@/app/components/Challenge/codePrediction';

type ExecutionResponse = {
  result?: unknown;
  error?: unknown;
};

export default function CodePredictionPage() {
  const router = useRouter();
  const [questions, setQuestions] = useState<CodePredictionQuestion[]>([]);
  const [questionIndex, setQuestionIndex] = useState(0);
  const [selectedChoice, setSelectedChoice] = useState('');
  const [feedback, setFeedback] = useState<'correct' | 'incorrect' | null>(null);
  const [attempts, setAttempts] = useState(0);
  const [actualOutput, setActualOutput] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [isChecking, setIsChecking] = useState(false);
  const [executionError, setExecutionError] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const question = questions[questionIndex];
  const isResolved = feedback === 'correct' || (feedback === 'incorrect' && attempts >= 2);

  useEffect(() => {
    setQuestions(createCodePredictionQuestions());
  }, []);

  const checkAnswer = async () => {
    setIsChecking(true);
    setExecutionError(null);
    try {
      const code = await buildPredictionProgram(question);
      const response = await fetch('/api/execute', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      });
      const data = await response.json() as ExecutionResponse;
      if (!response.ok || typeof data.result !== 'string') {
        const message = typeof data.error === 'string' ? data.error : '実行結果を取得できませんでした。';
        setExecutionError(message);
        return;
      }

      setActualOutput(data.result);
      if (isPredictedOutputCorrect(data.result, selectedChoice)) {
        setFeedback('correct');
        setCorrectCount(count => count + 1);
      } else {
        setFeedback('incorrect');
        setAttempts(count => count + 1);
      }
    } catch (error) {
      const message = error instanceof Error ? error.message : '不明なエラー';
      setExecutionError(`DNCLコードの実行に失敗しました: ${message}`);
    } finally {
      setIsChecking(false);
    }
  };

  const advance = () => {
    if (questionIndex === questions.length - 1) {
      setIsComplete(true);
      return;
    }
    setQuestionIndex(index => index + 1);
    setSelectedChoice('');
    setFeedback(null);
    setAttempts(0);
    setActualOutput(null);
    setExecutionError(null);
  };

  const restart = () => {
    setQuestions(createCodePredictionQuestions());
    setQuestionIndex(0);
    setSelectedChoice('');
    setFeedback(null);
    setAttempts(0);
    setActualOutput(null);
    setCorrectCount(0);
    setExecutionError(null);
    setIsComplete(false);
  };

  return (
    <PageWrapper>
      <HeaderBar
        leftContent={<HeaderTitle />}
        rightContent={
          <>
            <HeaderButton onClick={() => router.push('/chlng')}>モード選択</HeaderButton>
            <ThemeToggleButton />
          </>
        }
      />
      <ContentWrapper>
        <Box sx={{ maxWidth: 760, width: '100%', mx: 'auto', px: 2, py: 3 }}>
          <Typography variant="h2" sx={{ fontWeight: 'bold', mb: 1 }}>
            コードの結果を予想
          </Typography>
          <Typography color="text.secondary" sx={{ mb: 3 }}>
            DNCLコードを読み、コンソールに表示される結果を選びましょう。答え合わせでは、画面のコードを実際に変換・実行します。
          </Typography>

          {!question ? (
            <Stack direction="row" spacing={1} alignItems="center" role="status">
              <CircularProgress size={20} />
              <Typography>問題を準備しています。</Typography>
            </Stack>
          ) : isComplete ? (
            <Paper variant="outlined" sx={{ p: 3 }}>
              <Stack spacing={2} alignItems="flex-start">
                <Typography variant="h4">全問終了</Typography>
                <Typography>正解数：{correctCount} / {questions.length}</Typography>
                <Button variant="contained" onClick={restart}>新しい問題でもう一度挑戦</Button>
              </Stack>
            </Paper>
          ) : (
            <>
              <Stack direction="row" justifyContent="space-between" sx={{ mb: 1 }}>
                <Typography>{questionIndex + 1} / {questions.length} 問</Typography>
                <Typography color="text.secondary">{question.title}</Typography>
              </Stack>
              <LinearProgress
                variant="determinate"
                value={(questionIndex / questions.length) * 100}
                sx={{ mb: 2 }}
              />
              <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
                <Stack spacing={0.75}>
                  {question.items.map((item, index) => (
                    <Stack key={item.id} direction="row" spacing={1.5}>
                      <Typography color="text.secondary" sx={{ minWidth: 24, textAlign: 'right' }}>
                        {index + 1}.
                      </Typography>
                      <Typography component="span" sx={{ fontFamily: 'monospace', whiteSpace: 'pre-wrap' }}>
                        {item.line}
                      </Typography>
                    </Stack>
                  ))}
                </Stack>
              </Paper>

              <FormControl component="fieldset" disabled={isResolved}>
                <FormLabel component="legend">コンソールに表示される内容を1つ選んでください。</FormLabel>
                <RadioGroup
                  value={selectedChoice}
                  onChange={event => setSelectedChoice(event.target.value)}
                  sx={{ mt: 1 }}
                >
                  {question.choices.map(choice => (
                    <FormControlLabel key={choice} value={choice} control={<Radio />} label={choice} />
                  ))}
                </RadioGroup>
                <FormHelperText>
                  コード中の「」は文字列の囲み記号なので、表示結果には含まれません。数字の入力は不要です。
                </FormHelperText>
              </FormControl>

              {executionError && <Alert severity="error" sx={{ mt: 2 }}>{executionError}</Alert>}
              {feedback === 'incorrect' && attempts < 2 && (
                <Alert severity="warning" sx={{ mt: 2 }}>
                  不正解です。代入後の値や条件を追って、もう一度考えてみましょう。
                </Alert>
              )}
              {feedback === 'correct' && (
                <Alert severity="success" sx={{ mt: 2 }}>
                  正解です。実行結果は「{actualOutput}」です。{question.explanation}
                </Alert>
              )}
              {feedback === 'incorrect' && attempts >= 2 && (
                <Alert severity="info" sx={{ mt: 2 }}>
                  実行結果は「{actualOutput}」でした。{question.explanation}
                </Alert>
              )}

              <Stack direction="row" spacing={2} sx={{ mt: 2 }}>
                {isResolved ? (
                  <Button variant="contained" onClick={advance}>
                    {questionIndex === questions.length - 1 ? '結果を見る' : '次の問題'}
                  </Button>
                ) : (
                  <Button
                    variant="contained"
                    onClick={checkAnswer}
                    disabled={!selectedChoice || isChecking}
                    startIcon={isChecking ? <CircularProgress size={16} color="inherit" /> : undefined}
                  >
                    {isChecking ? '実行中' : '答え合わせ'}
                  </Button>
                )}
              </Stack>
            </>
          )}
        </Box>
      </ContentWrapper>
    </PageWrapper>
  );
}
