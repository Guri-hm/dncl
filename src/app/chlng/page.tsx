"use client"
import { Box, Typography } from '@mui/material';
import Grid from '@mui/material/Grid2';
import { BubblePaper } from '@/app/components/Bubble';
import { ContentWrapper } from '@/app/components/ContentWrapper';
import { HeaderBar, HeaderTitle, ThemeToggleButton } from '@/app/components/Header';
import { PageWrapper } from '@/app/components/PageWrapper';

const learningModes = [
  {
    href: '/chlng/problems',
    title: '課題に挑戦',
    description: 'プログラムを組み立てて、課題のクリアを目指します。',
  },
  {
    href: '/chlng/predict',
    title: 'コードの結果を予想',
    description: 'DNCLコードを読み、実行結果を選びます。',
  },
  {
    href: '/chlng/game',
    title: 'DNCLゲーム',
    description: 'DNCLのプログラムが出力した方向にキャラクターを動かし、ゴールを目指します。',
  },
];

export default function LearningModesPage() {
  return (
    <PageWrapper>
      <HeaderBar>
        <HeaderTitle />
        <ThemeToggleButton sx={{ marginLeft: 'auto' }} />
      </HeaderBar>
      <ContentWrapper>
        <Box sx={{ maxWidth: 900, width: '100%', mx: 'auto', px: 2, py: 4 }}>
          <Typography variant="h2" sx={{ fontWeight: 'bold', textAlign: 'center', mb: 1 }}>
            学習モード
          </Typography>
          <Typography sx={{ textAlign: 'center', mb: 4 }}>
            目的に合わせて、DNCLの学び方を選びましょう。
          </Typography>
          <Grid container spacing={3} justifyContent="flex-start">
            {learningModes.map(mode => (
              <Grid key={mode.href} size={{ xs: 12, sm: 6 }}>
                <BubblePaper href={mode.href}>
                  <Typography variant="h3" sx={{ fontSize: { xs: '1.2rem', sm: '1.4rem' }, mb: 1 }}>
                    {mode.title}
                  </Typography>
                  <Typography sx={{ mb: 1.5 }}>{mode.description}</Typography>
                </BubblePaper>
              </Grid>
            ))}
          </Grid>
        </Box>
      </ContentWrapper>
    </PageWrapper>
  );
}
