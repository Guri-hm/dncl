"use client";

import { Suspense, lazy, useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Allotment } from 'allotment';
import 'allotment/dist/style.css';
import '@/app/components/allotment-custom.css';
import {
  Box,
  Button,
  CircularProgress,
  Paper,
  Typography,
  Alert,
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
import type { TreeItems } from '@/app/types';
import {
  type DnclCharacterGameLevel,
  dnclCharacterGameLevels,
} from '@/app/components/Challenge/dnclCharacterGame';
import { gameCardFragments, runGameCards, type GameCardResult } from '@/app/components/Challenge/gameCards';
import { GameCharacter } from '@/app/components/Challenge/GameCharacter';
import { useRouter } from 'next/navigation';
import ResizerHint from '@/app/components/ResizerHint';

const SortableTree = lazy(() =>
  import('@/app/components/SortableTree').then(module => ({ default: module.SortableTree }))
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
  result: GameCardResult | null;
  error?: string;
  onComplete: () => void;
  onSelectLevel: (index: number) => void;
  onNextLevel: () => void;
}

function GameBoard({
  level,
  levelIndex,
  unlockedLevel,
  result,
  error,
  onComplete,
  onSelectLevel,
  onNextLevel,
}: GameBoardProps) {
  const [frameIndex, setFrameIndex] = useState(0);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    setFrameIndex(0);
    setPlaying(Boolean(result && result.frames.length > 1));
    if (!result) return;
    let index = 0;
    const timer = window.setInterval(() => {
      if (index < result.frames.length - 1) {
        setFrameIndex(++index);
      } else {
        setPlaying(false);
        window.clearInterval(timer);
        if (result.reachedGoal) onComplete();
      }
    }, 450);
    return () => window.clearInterval(timer);
  }, [result, onComplete]);
  const frame = result?.frames[Math.min(frameIndex, result.frames.length - 1)];
  const currentPosition = frame?.position ?? level.start;
  const cells = Array.from({ length: level.size * level.size }, (_, index) => {
    const position = { x: index % level.size, y: Math.floor(index / level.size) };
    const isCurrent = currentPosition.x === position.x && currentPosition.y === position.y;
    const isStart = level.start.x === position.x && level.start.y === position.y;
    const isGoal = level.goal.x === position.x && level.goal.y === position.y;
    const isObstacle = level.obstacles.some(
      obstacle => obstacle.x === position.x && obstacle.y === position.y
    );
    const isVisited = result?.frames.slice(0, frameIndex + 1).some(
      visited => visited.position.x === position.x && visited.position.y === position.y
    );
    const symbol = isObstacle ? '■' : isGoal ? '★' : isStart ? '出' : '';
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

  const status = error ? 'カードの組み合わせを確認してください。' : playing ? 'プログラムを実行中…' : !result
    ? 'カードを組み立てると、スタートから自動で実行されます。'
    : result.reachedGoal
      ? 'ゴールに着きました！'
      : result.hitWall
          ? '壁かマップの端にぶつかりました。向きや壁の条件を見直しましょう。'
          : result.moveLimitExceeded
            ? `1回の実行で動けるのは${level.maxMoves}回までです。`
            : 'まだゴールではありません。プログラムを見直して、もう一度実行しましょう。';

  return (
    <Box sx={{ height: '100%', overflowY: 'auto', p: 2 }}>
      <Typography variant="h3" sx={{ fontSize: '1.35rem', fontWeight: 'bold', mb: 1 }}>
        DNCLゲーム：キャラクターを動かそう
      </Typography>
      <Typography sx={{ mb: 2 }}>{level.instruction}</Typography>
      {error && <Alert severity="warning" sx={{ mb: 2 }}>{error}</Alert>}
      <Typography sx={{ mb: 2 }}>前進カード：{level.maxMoveCards}枚まで ／ 1回の実行：{level.maxMoves}歩まで</Typography>
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
          position: 'relative',
          gridTemplateColumns: `repeat(${level.size}, minmax(0, 1fr))`,
          gap: 0.5,
          width: '100%',
          maxWidth: 360,
          mx: 'auto',
          mb: 2,
        }}
      >
        {cells}
        <Box sx={{
          position: 'absolute',
          width: `calc((100% - ${(level.size - 1) * 4}px) / ${level.size})`,
          height: `calc((100% - ${(level.size - 1) * 4}px) / ${level.size})`,
          left: `calc(${currentPosition.x} * (100% + 4px) / ${level.size})`,
          top: `calc(${currentPosition.y} * (100% + 4px) / ${level.size})`,
          transition: playing ? 'left 400ms linear, top 400ms linear' : 'none',
          '@media (prefers-reduced-motion: reduce)': { transition: 'none' },
          display: 'grid', placeItems: 'center', pointerEvents: 'none',
        }}>
          <GameCharacter direction={frame?.direction ?? level.startDirection} walking={playing && Boolean(frame?.walking)} />
        </Box>
      </Box>
      <Typography role="status" aria-live="polite" sx={{ textAlign: 'center', mb: 1 }}>
        {status}
      </Typography>
      {!playing && result?.reachedGoal && levelIndex < dnclCharacterGameLevels.length - 1 && (
        <Box sx={{ textAlign: 'center' }}>
          <Button variant="contained" onClick={onNextLevel}>
            次のステージへ
          </Button>
        </Box>
      )}
      <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
        「向く方向」で上下左右を選び、「前へ1マス進む」で向いている方向へ動きます。
        繰り返しや条件の後には、対応する「終わり」のカードを置きます。
        「目の前に壁がある／ない」は、実行中の位置と向きで判定します。マップの端も壁です。
      </Typography>
    </Box>
  );
}

export default function DnclCharacterGamePage() {
  const [items, setItems] = useState<TreeItems>([]);
  const [levelIndex, setLevelIndex] = useState(0);
  const [unlockedLevel, setUnlockedLevel] = useState(0);
  const specialElementRef1 = useRef<HTMLDivElement | null>(null);
  const specialElementRef2 = useRef<HTMLDivElement | null>(null);
  const theme = useTheme();
  const isDesktop = useMediaQuery(theme.breakpoints.up('md'));
  const router = useRouter();

  const level = dnclCharacterGameLevels[levelIndex];
  const fragments = useMemo(() => gameCardFragments(level), [level]);
  const { result, error } = useMemo(() => {
    if (!items.length) return { result: null };
    try {
      return { result: runGameCards(level, items) };
    } catch (error) {
      if (!(error instanceof Error)) throw error;
      return { result: null, error: error.message };
    }
  }, [items, level]);
  const handleComplete = useCallback(() => {
    setUnlockedLevel(current => Math.max(current, Math.min(levelIndex + 1, dnclCharacterGameLevels.length - 1)));
  }, [levelIndex]);

  const handleSelectLevel = (index: number) => {
    setLevelIndex(index);
    setItems([]);
  };

  const handleNextLevel = () => {
    handleSelectLevel(Math.min(levelIndex + 1, dnclCharacterGameLevels.length - 1));
  };

  const editor = (
    <Suspense fallback={<LoadingFallback label="プログラムエディターを読み込み中..." />}>
      <SortableTree
        treeItems={items}
        setTreeItems={setItems}
        dnclValidation={null}
        fragments={fragments}
        collapsible
        indicator
        removable
      />
    </Suspense>
  );
  const consolePanel = (
    <Paper sx={{ p: 2, height: '100%', overflowY: 'auto' }}>
      <Typography variant="h6">実行した命令</Typography>
      <Typography component="pre" sx={{ whiteSpace: 'pre-wrap' }}>
        {error ?? result?.output.join('\n') ?? 'ここに実行した命令が表示されます'}
      </Typography>
    </Paper>
  );
  const gameBoard = (
    <GameBoard
      key={level.id}
      level={level}
      levelIndex={levelIndex}
      unlockedLevel={unlockedLevel}
      result={result}
      error={error}
      onComplete={handleComplete}
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
        向きを変え、前へ進み、壁を調べるDNCLカードでゴールを目指しましょう。
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
