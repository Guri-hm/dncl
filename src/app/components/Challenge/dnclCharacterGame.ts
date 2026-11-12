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
    instruction: 'DNCLで「右」を3回表示し、キャラクターをゴールへ進めましょう。繰り返しを使うと便利です。',
    size: 5,
    start: { x: 0, y: 2 },
    goal: { x: 3, y: 2 },
    obstacles: [],
    maxMoves: 30,
  },
  {
    id: 'turn-path',
    title: '曲がり道を進もう',
    instruction: '壁を避けて、下に2回、右に4回進みましょう。繰り返しを使うと便利です。',
    size: 5,
    start: { x: 0, y: 0 },
    goal: { x: 4, y: 2 },
    obstacles: [{ x: 2, y: 0 }, { x: 2, y: 1 }],
    maxMoves: 30,
  },
  {
    id: 'wall-detour',
    title: '壁を越えて進もう',
    instruction: '壁の上側を通ってゴールへ進みましょう。繰り返しで同じ方向の出力をまとめられます。',
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
  const path = [position];
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
