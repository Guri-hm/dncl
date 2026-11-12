import { runInNewContext } from 'node:vm';
import { ProcessEnum } from '@/app/enum';
import { cnvToJs } from '@/app/utilities/cnvToJs';
import { dnclCharacterGameLevels, runDnclCharacterProgram } from './dnclCharacterGame';

describe('DNCL character game', () => {
  it('moves the character from output produced by an executed DNCL loop', async () => {
    const program = [
      { processIndex: ProcessEnum.ForIncrement, lineTokens: ['i', '1', '3', '1'] },
      { processIndex: ProcessEnum.Output, lineTokens: ['"右"'] },
      { processIndex: ProcessEnum.EndFor, lineTokens: [] },
    ];
    const code = await Promise.all(program.map(statement => cnvToJs(statement)));
    const output: string[] = [];

    runInNewContext(code.join('\n'), {
      console: { log: (value: string) => output.push(value) },
    });

    const result = runDnclCharacterProgram(dnclCharacterGameLevels[0], output.join('\n'));

    expect(output).toEqual(['右', '右', '右']);
    expect(result.reachedGoal).toBe(true);
    expect(result.position).toEqual(dnclCharacterGameLevels[0].goal);
  });

  it('stops at a wall and rejects output that is not a direction', () => {
    const level = dnclCharacterGameLevels[1];

    expect(runDnclCharacterProgram(level, '下\n下\n右\n右\n右\n右').reachedGoal).toBe(true);
    expect(runDnclCharacterProgram(level, '右\n右').hitWall).toBe(true);
    expect(runDnclCharacterProgram(level, 'east').invalidCommand).toBe('east');
    expect(runDnclCharacterProgram(level, 'toString').invalidCommand).toBe('toString');
  });

  it('does not complete a path that exceeds the per-run move limit', () => {
    const level = { ...dnclCharacterGameLevels[0], maxMoves: 2 };
    const result = runDnclCharacterProgram(level, '右\n右\n右');

    expect(result.moveLimitExceeded).toBe(true);
    expect(result.reachedGoal).toBe(false);
  });
});
