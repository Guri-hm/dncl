import type { TreeItems } from '@/app/types';
import { dnclCharacterGameLevels } from './dnclCharacterGame';
import { gameCardStatement, runGameCards, type GameCard } from './gameCards';

const program = (...cards: GameCard[]): TreeItems => cards.map((gameCard, i) => ({
  id: String(i), children: [], gameCard, ...gameCardStatement(gameCard),
}));
const move: GameCard = { kind: 'move' };
const repeat = (count: number): GameCard => ({ kind: 'repeat', count });
const end: GameCard = { kind: 'endRepeat' };

it('solves stage 1 with one forward card and returns distinct animation frames', () => {
  const result = runGameCards(dnclCharacterGameLevels[0], program(repeat(3), move, end));
  expect(result.reachedGoal).toBe(true);
  expect(result.frames.map(frame => frame.position)).toEqual([
    { x: 0, y: 2 }, { x: 1, y: 2 }, { x: 2, y: 2 }, { x: 3, y: 2 },
  ]);
  expect(result.frames[1]).toMatchObject({ direction: '右', walking: true });
});

it('turns without moving, then moves only in the facing direction to solve stage 2', () => {
  const result = runGameCards(dnclCharacterGameLevels[1], program(
    { kind: 'turn', direction: '下' }, repeat(2), move, end,
    { kind: 'turn', direction: '右' }, repeat(4), move, end,
  ));
  expect(result.reachedGoal).toBe(true);
  expect(result.frames[1]).toEqual({ position: { x: 0, y: 0 }, direction: '下', walking: false });
  expect(result.frames[2].position).toEqual({ x: 0, y: 1 });
});

it('reevaluates walls after each movement and turn, including map edges, to solve stage 3', () => {
  const result = runGameCards(dnclCharacterGameLevels[2], program(
    { kind: 'while', wall: false }, move, { kind: 'endWhile' },
    { kind: 'if', wall: true }, { kind: 'turn', direction: '右' },
    { kind: 'else' }, { kind: 'turn', direction: '左' }, { kind: 'endIf' },
    { kind: 'while', wall: false }, move, { kind: 'endWhile' },
  ));
  expect(result.reachedGoal).toBe(true);
  expect(result.frames.at(-1)?.position).toEqual({ x: 5, y: 0 });
});

it('detects an obstacle in front and chooses the else branch when the condition is false', () => {
  const result = runGameCards(dnclCharacterGameLevels[1], program(
    move, { kind: 'if', wall: false },
    { kind: 'turn', direction: '上' }, { kind: 'else' },
    { kind: 'turn', direction: '下' }, { kind: 'endIf' },
  ));
  expect(result.frames.at(-1)?.direction).toBe('下');
  expect(result.hitWall).toBe(false);
  expect(runGameCards(dnclCharacterGameLevels[1], program(repeat(2), move, end)).hitWall).toBe(true);
});

it('rejects excess cards even when nested or in an unused branch', () => {
  const nodes = program({ kind: 'if', wall: true }, move, { kind: 'else' }, move, { kind: 'endIf' });
  expect(() => runGameCards(dnclCharacterGameLevels[0], nodes)).toThrow('1枚まで');
});

it('rejects incomplete or mismatched blocks, even when they would not execute', () => {
  for (const nodes of [
    program(repeat(3), move),
    program(repeat(3), move, { kind: 'endIf' }),
    program({ kind: 'else' }),
    program({ kind: 'if', wall: true }, { kind: 'while', wall: true }, { kind: 'endIf' }),
  ]) {
    expect(() => runGameCards(dnclCharacterGameLevels[0], nodes)).toThrow();
  }
});

it('bounds repetition values, infinite loops, and the number of moves', () => {
  expect(() => runGameCards(dnclCharacterGameLevels[0], program(repeat(31), move, end))).toThrow('1〜30');
  expect(() => runGameCards(dnclCharacterGameLevels[0], program(
    { kind: 'while', wall: false }, { kind: 'endWhile' }
  ))).toThrow('繰り返しが終わりません');
  const level = { ...dnclCharacterGameLevels[0], maxMoves: 2 };
  const result = runGameCards(level, program(repeat(3), move, end));
  expect(result.moveLimitExceeded).toBe(true);
  expect(result.reachedGoal).toBe(false);
});
