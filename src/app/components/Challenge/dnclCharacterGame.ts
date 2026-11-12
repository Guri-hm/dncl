export type CharacterDirection = '上' | '右' | '下' | '左';

export type GamePosition = {
  x: number;
  y: number;
};

export type DnclCharacterGameLevel = {
  id: string;
  title: string;
  instruction: string;
  size: number;
  start: GamePosition;
  goal: GamePosition;
  obstacles: GamePosition[];
  maxMoves: number;
  maxMoveCards: number;
  startDirection: CharacterDirection;
};

export type CharacterGameResult = {
  position: GamePosition;
  path: GamePosition[];
  reachedGoal: boolean;
  hitWall: boolean;
  invalidCommand?: string;
  moveLimitExceeded: boolean;
};

export const dnclCharacterGameLevels: DnclCharacterGameLevel[] = [
  {
    id: 'straight-path',
    title: '右へ進もう',
    instruction: '右向きの女の子を3マス先のゴールへ。前進カードは1枚だけなので、繰り返しを使いましょう。',
    size: 5,
    start: { x: 0, y: 2 },
    goal: { x: 3, y: 2 },
    obstacles: [],
    maxMoves: 30,
    maxMoveCards: 1,
    startDirection: '右',
  },
  {
    id: 'turn-path',
    title: '曲がり道を進もう',
    instruction: '向きを変え、下に2マス、右に4マス進みましょう。前進カードは2枚までです。',
    size: 5,
    start: { x: 0, y: 0 },
    goal: { x: 4, y: 2 },
    obstacles: [{ x: 2, y: 0 }, { x: 2, y: 1 }],
    maxMoves: 30,
    maxMoveCards: 2,
    startDirection: '右',
  },
  {
    id: 'wall-detour',
    title: '壁を越えて進もう',
    instruction: '上向きでスタート。目の前に壁がない間進み、壁に着いたら右を向いてゴールへ。マップの端も壁です。前進カードは2枚までです。',
    size: 6,
    start: { x: 0, y: 5 },
    goal: { x: 5, y: 0 },
    obstacles: [
      { x: 2, y: 1 },
      { x: 2, y: 2 },
      { x: 2, y: 3 },
      { x: 2, y: 4 },
      { x: 2, y: 5 },
    ],
    maxMoves: 30,
    maxMoveCards: 2,
    startDirection: '上',
  },
];

const directionDelta: Record<CharacterDirection, GamePosition> = {
  '上': { x: 0, y: -1 },
  '右': { x: 1, y: 0 },
  '下': { x: 0, y: 1 },
  '左': { x: -1, y: 0 },
};

const isCharacterDirection = (direction: string): direction is CharacterDirection =>
  Object.prototype.hasOwnProperty.call(directionDelta, direction);

export const runDnclCharacterProgram = (
  level: DnclCharacterGameLevel,
  programOutput: string
): CharacterGameResult => {
  const outputs = programOutput
    .replace(/\r\n/g, '\n')
    .split('\n')
    .map(line => line.trim())
    .filter(Boolean);
  const position = { ...level.start };
  const path = [{ ...position }];
  let hitWall = false;
  let invalidCommand: string | undefined;
  const moveLimitExceeded = outputs.length > level.maxMoves;

  for (const command of outputs.slice(0, level.maxMoves)) {
    if (!isCharacterDirection(command)) {
      invalidCommand = command;
      break;
    }

    const delta = directionDelta[command];
    const nextPosition = { x: position.x + delta.x, y: position.y + delta.y };
    const outsideGrid = nextPosition.x < 0 || nextPosition.y < 0 ||
      nextPosition.x >= level.size || nextPosition.y >= level.size;
    const hitsObstacle = level.obstacles.some(
      obstacle => obstacle.x === nextPosition.x && obstacle.y === nextPosition.y
    );

    if (outsideGrid || hitsObstacle) {
      hitWall = true;
      break;
    }

    position.x = nextPosition.x;
    position.y = nextPosition.y;
    path.push({ ...position });
  }

  return {
    position: { ...position },
    path,
    hitWall,
    invalidCommand,
    moveLimitExceeded,
    reachedGoal: position.x === level.goal.x && position.y === level.goal.y &&
      !hitWall && !invalidCommand && !moveLimitExceeded,
  };
};
