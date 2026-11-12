import { v4 as uuidv4 } from 'uuid';
import { ProcessEnum, StatementEnum } from '@/app/enum';
import type { FragmentItems, TreeItems } from '@/app/types';
import { allTreeCards, getCardLimitError } from '@/app/utilities/treeCardOperations';
import type { CharacterDirection, DnclCharacterGameLevel, GamePosition } from './dnclCharacterGame';

export type GameCard =
  | { kind: 'move' }
  | { kind: 'turn'; direction: CharacterDirection }
  | { kind: 'repeat'; count: number }
  | { kind: 'if' | 'while'; wall: boolean }
  | { kind: 'endRepeat' | 'else' | 'endIf' | 'endWhile' };

export const gameDirections: CharacterDirection[] = ['上', '右', '下', '左'];
const deltas: Record<CharacterDirection, GamePosition> = {
  上: { x: 0, y: -1 }, 右: { x: 1, y: 0 },
  下: { x: 0, y: 1 }, 左: { x: -1, y: 0 },
};

export type GameFrame = { position: GamePosition; direction: CharacterDirection; walking: boolean };
export type GameCardResult = {
  frames: GameFrame[];
  output: string[];
  reachedGoal: boolean;
  hitWall: boolean;
  moveLimitExceeded: boolean;
};

export function gameCardStatement(card: GameCard) {
  switch (card.kind) {
    case 'move':
      return { line: '前へ1マス進む', processIndex: ProcessEnum.Output, statementType: StatementEnum.Output };
    case 'turn':
      return { line: `${card.direction}を向く`, processIndex: ProcessEnum.Output, statementType: StatementEnum.Output };
    case 'repeat':
      return { line: `${card.count}回繰り返す`, processIndex: ProcessEnum.ForIncrement, statementType: StatementEnum.SequentialIteration };
    case 'endRepeat':
      return { line: '繰り返しの終わり', processIndex: ProcessEnum.EndFor, statementType: StatementEnum.SequentialIteration };
    case 'if':
      return { line: `もし目の前に壁が${card.wall ? 'ある' : 'ない'}ならば`, processIndex: ProcessEnum.If, statementType: StatementEnum.Condition };
    case 'else':
      return { line: 'そうでなければ', processIndex: ProcessEnum.Else, statementType: StatementEnum.Condition };
    case 'endIf':
      return { line: '条件分岐の終わり', processIndex: ProcessEnum.EndIf, statementType: StatementEnum.Condition };
    case 'while':
      return { line: `目の前に壁が${card.wall ? 'ある' : 'ない'}間、繰り返す`, processIndex: ProcessEnum.While, statementType: StatementEnum.ConditionalLoopPreTest };
    case 'endWhile':
      return { line: '条件付き繰り返しの終わり', processIndex: ProcessEnum.EndWhile, statementType: StatementEnum.ConditionalLoopPreTest };
  }
}

export function gameCardFragments(level: DnclCharacterGameLevel): FragmentItems {
  const cards: GameCard[] = [
    { kind: 'move' }, { kind: 'turn', direction: '右' },
    { kind: 'repeat', count: 3 }, { kind: 'endRepeat' },
    { kind: 'if', wall: true }, { kind: 'else' }, { kind: 'endIf' },
    { kind: 'while', wall: false }, { kind: 'endWhile' },
  ];
  return cards.map(gameCard => ({
    id: uuidv4(), children: [], parentId: null, depth: 0, index: 0,
    ...gameCardStatement(gameCard), gameCard,
    maxUsage: gameCard.kind === 'move' ? level.maxMoveCards : undefined,
  }));
}

// Parse every branch before executing; even an unused branch must be well formed.
type Block = { card: GameCard; body: Block[]; otherwise: Block[] };
function parseCards(cards: GameCard[]): Block[] {
  let index = 0;
  function parse(end?: GameCard['kind'], allowElse = false): Block[] {
    const blocks: Block[] = [];
    while (index < cards.length) {
      const card = cards[index];
      if (card.kind === end || (allowElse && card.kind === 'else')) return blocks;
      if (['endRepeat', 'endIf', 'endWhile', 'else'].includes(card.kind)) {
        throw new Error('終わりのカードと、繰り返し・条件のカードの組み合わせを確認してください。');
      }
      index++;
      const block: Block = { card, body: [], otherwise: [] };
      if (card.kind === 'repeat' || card.kind === 'if' || card.kind === 'while') {
        if (card.kind === 'repeat' && (!Number.isInteger(card.count) || card.count < 1 || card.count > 30)) {
          throw new Error('繰り返し回数は1〜30回から選んでください。');
        }
        const closing = card.kind === 'repeat' ? 'endRepeat' : card.kind === 'if' ? 'endIf' : 'endWhile';
        block.body = parse(closing, card.kind === 'if');
        if (card.kind === 'if' && cards[index]?.kind === 'else') {
          index++;
          block.otherwise = parse(closing);
        }
        if (cards[index]?.kind !== closing) {
          throw new Error(`「${gameCardStatement(card).line}」に対応する終わりのカードを追加してください。`);
        }
        index++;
      }
      blocks.push(block);
    }
    return blocks;
  }
  return parse();
}

export function runGameCards(level: DnclCharacterGameLevel, items: TreeItems): GameCardResult {
  const limitError = getCardLimitError(items, gameCardFragments(level));
  if (limitError) throw new Error(limitError);
  const cards = allTreeCards(items).map(item => {
    if (!item.gameCard) throw new Error('ゲーム用のカードを使ってください。');
    return item.gameCard;
  });
  const program = parseCards(cards);
  let position = { ...level.start };
  let direction = level.startDirection;
  const frames: GameFrame[] = [{ position: { ...position }, direction, walking: false }];
  const output: string[] = [];
  let steps = 0;
  let moves = 0;
  let hitWall = false;
  let moveLimitExceeded = false;
  const wallAhead = () => {
    const delta = deltas[direction];
    const next = { x: position.x + delta.x, y: position.y + delta.y };
    return next.x < 0 || next.y < 0 || next.x >= level.size || next.y >= level.size ||
      level.obstacles.some(wall => wall.x === next.x && wall.y === next.y);
  };
  const tick = () => {
    if (++steps > 1000) throw new Error('繰り返しが終わりません。向きや壁の条件を確認してください。');
  };
  function execute(blocks: Block[]) {
    for (const { card, body, otherwise } of blocks) {
      if (hitWall || moveLimitExceeded) return;
      tick();
      switch (card.kind) {
        case 'move':
          if (++moves > level.maxMoves) { moveLimitExceeded = true; return; }
          output.push('前へ1マス進む');
          if (wallAhead()) { hitWall = true; return; }
          position = { x: position.x + deltas[direction].x, y: position.y + deltas[direction].y };
          frames.push({ position: { ...position }, direction, walking: true });
          break;
        case 'turn':
          if (!gameDirections.includes(card.direction)) throw new Error('向きを上下左右から選んでください。');
          direction = card.direction;
          output.push(`${direction}を向く`);
          frames.push({ position: { ...position }, direction, walking: false });
          break;
        case 'repeat':
          for (let i = 0; i < card.count && !hitWall && !moveLimitExceeded; i++) { tick(); execute(body); }
          break;
        case 'if':
          execute(wallAhead() === card.wall ? body : otherwise);
          break;
        case 'while':
          while (!hitWall && !moveLimitExceeded && wallAhead() === card.wall) { tick(); execute(body); }
          break;
      }
    }
  }
  execute(program);
  return {
    frames, output, hitWall, moveLimitExceeded,
    reachedGoal: !hitWall && !moveLimitExceeded && position.x === level.goal.x && position.y === level.goal.y,
  };
}
