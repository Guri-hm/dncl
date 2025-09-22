import { getChallengeById, basicChallenges } from '@/app/components/Challenge';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Suspense, lazy } from 'react';
import { Box, CircularProgress } from '@mui/material';
import { combinedChallenges } from '@/app/components/Challenge/Challenges';

// ChallengePage を遅延読み込み
const ChallengePage = lazy(() => import('@/app/components/Challenge/ChallengePage'));

interface SlugPageProps {
  params: Promise<{ slug: string }>;
}

const getAllChallengeIds = (): string[] => {
  return combinedChallenges.map(challenge => challenge.id);
};

// 静的サイト用: 全てのパラメータを事前生成
export async function generateStaticParams() {
  const challengeIds = getAllChallengeIds(); // 全てのチャレンジIDを取得

  return challengeIds.map((slug) => ({
    slug: slug,
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  return {
    title: `課題 ${slug}`,
  };
}

// ローディングコンポーネント
const ChallengeLoadingFallback = () => (
  <Box
    display="flex"
    justifyContent="center"
    alignItems="center"
    height="100vh"
    flexDirection="column"
  >
    <CircularProgress size={40} />
    <Box mt={2} fontSize="1.1rem">
      チャレンジページを読み込み中...
    </Box>
  </Box>
);

export default async function SlugPage({ params }: SlugPageProps) {
  const { slug } = await params;

  if (!slug) {
    return notFound();
  }

  const challenge = getChallengeById(slug);
  if (!challenge) {
    return notFound();
  }

  return (
    <Suspense fallback={<ChallengeLoadingFallback />}>
      <ChallengePage challenge={challenge} />
    </Suspense>
  );
}