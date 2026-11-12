"use client";

import { Suspense, lazy, useEffect, useMemo, useRef, useState } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import '@/app/components/allotment-custom.css';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import { SwiperSlide } from 'swiper/react';
import { PageWrapper } from '@/app/components/PageWrapper';
import { HeaderBar, HeaderButton, HeaderTitle, ThemeToggleButton } from '@/app/components/Header';
import { ContentWrapper } from '@/app/components/ContentWrapper';
import { FooterOverlay } from '@/app/components/Footer';
import { HowToButton, HintButton } from '@/app/components/Tips';
import { Question } from '@/app/components/Challenge';
import { SwiperTabs } from '@/app/components/Tab';
import type { DnclValidationType, TreeItems } from '@/app/types';
import {
  type CharacterGameResult,
  type DnclCharacterGameLevel,
  dnclCharacterGameLevels,
  runDnclCharacterProgram,
} from '@/app/components/Challenge/dnclCharacterGame';
import { useRouter } from 'next/navigation';
import ResizerHint from '@/app/components/ResizerHint';

const SortableTree = lazy(() =>
  import('@/app/components/SortableTree').then(module => ({ default: module.SortableTree }))
);
const ConsoleWrapper = lazy(() =>
  import('@/app/components/ConsoleWrapper').then(module => ({ default: module.ConsoleWrapper }))
);

const LoadingFallback = ({ label }: { label: string }) => (
  <Box display="flex" justifyContent="center" alignItems="center" height="100%" gap={1}>
    <CircularProgress size={20} />
    <Typography>{label}</Typography>
  </Box>
);

interface GameBoardProps {
  level: DnclCharacterGameLevel;
  levelIndex: number;
  unlockedLevel: number;
  result: CharacterGameResult | null;
  onSelectLevel: (index: number) => void;
  onNextLevel: () => void;
}

function GameBoard({
  level,
  levelIndex,
  unlockedLevel,
  result,
  onSelectLevel,
  onNextLevel,
}: GameBoardProps) {
  const currentPosition = result?.position ?? level.start;
  const cells = Array.from({ length: level.size * level.size }, (_, index) => {
    const position = { x: index % level.size, y: Math.floor(index / level.size) };
    const isCurrent = currentPosition.x === position.x && currentPosition.y === position.y;
    const isStart = level.start.x === position.x && level.start.y === position.y;
    const isGoal = level.goal.x === position.x && level.goal.y === position.y;
    const isObstacle = level.obstacles.some(
      obstacle => obstacle.x === position.x && obstacle.y === position.y
    );
    const isVisited = result?.path.some(
      visited => visited.x === position.x && visited.y === position.y
    );
    const symbol = isCurrent ? '🙂' : isObstacle ? '■' : isGoal ? '★' : isStart ? '出' : '';
    const label = isCurrent
      ? isStart ? 'キャラクター（スタート）' : 'キャラクター'
      : isObstacle
        ? '壁'
        : isGoal
          ? 'ゴール'
          : isStart
            ? 'スタート'
            : isVisited
              ? '通ったマス'
              : '空きマス';

    return (
      <Paper
        key={`${position.x}-${position.y}`}
        role="img"
        aria-label={label}
        elevation={0}
        sx={{
          aspectRatio: '1 / 1',
          display: 'grid',
          placeItems: 'center',
          fontSize: { xs: '1.1rem', sm: '1.5rem' },
          backgroundColor: isObstacle
            ? 'var(--slate-600)'
            : isCurrent
              ? 'primary.light'
              : isVisited
                ? 'action.hover'
                : 'background.paper',
          color: isObstacle ? 'white' : 'text.primary',
          border: '1px solid var(--slate-300)',
        }}
      >
        {symbol}
      </Paper>
    );
  });

  const status = !result
    ? 'プログラムを組み立てると自動で実行され、出力に合わせて動きます。'
    : result.reachedGoal
      ? 'ゴールに着きました！'
      : result.invalidCommand
        ? `「${result.invalidCommand}」は移動できません。上・右・下・左のどれかを表示してください。`
        : result.hitWall
          ? '壁かマップの端にぶつかりました。出力する方向を見直しましょう。'
          : result.moveLimitExceeded
            ? `1回の実行で動けるのは${level.maxMoves}回までです。`
            : 'まだゴールではありません。プログラムを見直して、もう一度実行しましょう。';

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', p: 2 }}>
      <Typography variant="h3" sx={{ fontSize: '1.35rem', fontWeight: 'bold', mb: 1 }}>
        DNCLゲーム：キャラクターを動かそう
      </Typography>
      <Typography sx={{ mb: 2 }}>{level.instruction}</Typography>
      <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, mb: 2 }}>
        {dnclCharacterGameLevels.map((availableLevel, index) => (
          <Button
            key={availableLevel.id}
            variant={index === levelIndex ? 'contained' : 'outlined'}
            disabled={index > unlockedLevel}
            onClick={() => onSelectLevel(index)}
          >
            ステージ{index + 1}
          </Button>
        ))}
      </Box>
      <Box
        role="grid"
        aria-label={`${level.title}のマップ`}
        sx={{
          display: 'grid',
          gridTemplateColumns: `repeat(${level.size}, minmax(0, 1fr))`,
          gap: 0.5,
          width: '100%',
          maxWidth: 360,
          mx: 'auto',
          mb: 2,
        }}
      >
        {cells}
      </Box>
      <Typography role="status" aria-live="polite" sx={{ textAlign: 'center', mb: 1 }}>
        {status}
      </Typography>
      {result?.reachedGoal && levelIndex < dnclCharacterGameLevels.length - 1 && (
        <Box sx={{ textAlign: 'center' }}>
          <Button variant="contained" onClick={onNextLevel}>
            次のステージへ
          </Button>
        </Box>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        構文チェックに通ると、プログラムは自動で実行されます。DNCLの表示文で「上」「右」「下」「左」を出力すると、その方向へ1マス動きます。
        変数や繰り返しを使って、移動のプログラムを作ってみましょう。
      </Typography>
    </Box>
  );
}

export default function DnclCharacterGamePage() {
  const [items, setItems] = useState<TreeItems>([]);
  const [dnclValidation, setDnclValidation] = useState<DnclValidationType | null>(null);
  const [runResults, setRunResults] = useState<string[]>([]);
  const [levelIndex, setLevelIndex] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(0);
  const specialElementRef1 = useRef<HTMLDivElement | null>(null);
  const specialElementRef2 = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const router = useRouter();

  const level = dnclCharacterGameLevels[levelIndex];
  const latestOutput = runResults.length > 0 ? runResults[runResults.length - 1] : '';
  const result = useMemo(
    () => latestOutput ? runDnclCharacterProgram(level, latestOutput) : null,
    [latestOutput, level]
  );

  useEffect(() => {
    setRunResults([]);
  }, [items]);

  useEffect(() => {
    if (result?.reachedGoal) {
      setUnlockedLevel(current => Math.max(current, levelIndex + 1));
    }
  }, [levelIndex, result]);

  const handleSelectLevel = (index: number) => {
    setLevelIndex(index);
    setRunResults([]);
  };

  const handleNextLevel = () => {
    handleSelectLevel(Math.min(levelIndex + 1, dnclCharacterGameLevels.length - 1));
  };

  const editor = (
    <Suspense fallback={<LoadingFallback label="プログラムエディターを読み込み中..." />}>
      <SortableTree
        treeItems={items}
        setTreeItems={setItems}
        dnclValidation={dnclValidation}
        collapsible
        indicator
        removable
      />
    </Suspense>
  );
  const consolePanel = (
    <Suspense fallback={<LoadingFallback label="コンソールを読み込み中..." />}>
      <ConsoleWrapper
        dnclValidation={dnclValidation}
        setDnclValidation={setDnclValidation}
        treeItems={items}
        runResults={runResults}
        setRunResults={setRunResults}
      />
    </Suspense>
  );
  const gameBoard = (
    <GameBoard
      level={level}
      levelIndex={levelIndex}
      unlockedLevel={unlockedLevel}
      result={result}
      onSelectLevel={handleSelectLevel}
      onNextLevel={handleNextLevel}
    />
  );

  return (
    <PageWrapper>
      <HeaderBar
        leftContent={<HeaderTitle />}
        rightContent={
          <>
            <HeaderButton onClick={() => router.push('/chlng')}>学習モードへ戻る</HeaderButton>
            <ThemeToggleButton />
          </>
        }
      />
      <Question>
        DNCLのプログラムが出力した方向に、キャラクターが動きます。コードを作ってゴールを目指しましょう。
      </Question>
      <ContentWrapper>
        <ResizerHint />
        {isDesktop ? (
          <Allotment vertical defaultSizes={[200, 100]}>
            <Allotment separator={false}>
              <Allotment.Pane>{editor}</Allotment.Pane>
              <Allotment.Pane>{gameBoard}</Allotment.Pane>
            </Allotment>
            <Allotment.Pane>{consolePanel}</Allotment.Pane>
          </Allotment>
        ) : (
          <SwiperTabs labels={['プログラム', 'ゲーム', 'コンソール']} specialElementsRefs={[specialElementRef1, specialElementRef2]}>
            <SwiperSlide>
              <div ref={specialElementRef1} style={{ height: '100%' }}>{editor}</div>
            </SwiperSlide>
            <SwiperSlide>{gameBoard}</SwiperSlide>
            <SwiperSlide>
              <div ref={specialElementRef2} style={{ height: '100%' }}>{consolePanel}</div>
            </SwiperSlide>
          </SwiperTabs>
        )}
      </ContentWrapper>
      <FooterOverlay>
        <HintButton />
        <HowToButton />
      </FooterOverlay>
    </PageWrapper>
  );
}
