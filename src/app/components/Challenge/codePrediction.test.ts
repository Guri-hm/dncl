import { runInNewContext } from 'node:vm';
import {
  buildPredictionProgram,
  createCodePredictionQuestions,
  isPredictedOutputCorrect,
} from './codePrediction';

describe('DNCL code prediction', () => {
  it('converts and executes generated DNCL programs to their expected console output', async () => {
    const questions = createCodePredictionQuestions(() => 0);

    for (const question of questions) {
      const code = await buildPredictionProgram(question);
      const output: string[] = [];
      runInNewContext(code, {
        console: { log: (...args: unknown[]) => output.push(args.join(' ')) },
      });

      expect(output).toEqual([question.expectedOutput]);
      expect(question.choices).toContain(question.expectedOutput);
    }
  });

  it('creates new values for another round and matches the selected output exactly', () => {
    const firstRound = createCodePredictionQuestions(() => 0);
    const nextRound = createCodePredictionQuestions(() => 0.99);

    expect(firstRound[0].expectedOutput).not.toBe(nextRound[0].expectedOutput);
    expect(isPredictedOutputCorrect('合格', '合格')).toBe(true);
    expect(isPredictedOutputCorrect('合格', '「合格」')).toBe(false);
    expect(isPredictedOutputCorrect('７', '7')).toBe(false);
  });
});
