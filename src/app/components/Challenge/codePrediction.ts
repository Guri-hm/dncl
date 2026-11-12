import { ProcessEnum } from '@/app/enum';
import { TreeItem, TreeItems } from '@/app/types';
import { cnvToJs } from '@/app/utilities/cnvToJs';

export type CodePredictionQuestion = {
  id: string;
  title: string;
  items: TreeItems;
  choices: string[];
  expectedOutput: string;
  explanation: string;
};

const statement = (id: string, line: string, processIndex: ProcessEnum, lineTokens: string[]): TreeItem => ({
  id,
  line,
  lineTokens,
  processIndex,
  children: [],
});

const randomInteger = (min: number, max: number, random: () => number): number =>
  Math.floor(random() * (max - min + 1)) + min;

const shuffle = <T,>(items: T[], random: () => number): T[] => {
  const shuffled = [...items];
  for (let index = shuffled.length - 1; index > 0; index--) {
    const swapIndex = Math.floor(random() * (index + 1));
    [shuffled[index], shuffled[swapIndex]] = [shuffled[swapIndex], shuffled[index]];
  }
  return shuffled;
};

const numericChoices = (answer: number, random: () => number): string[] =>
  shuffle([answer, answer + 1, answer - 1, answer + 2].map(String), random);

export const createCodePredictionQuestions = (random: () => number = Math.random): CodePredictionQuestion[] => {
  const start = randomInteger(2, 9, random);
  const increase = randomInteger(2, 6, random);
  const sum = start + increase;

  const score = randomInteger(50, 100, random);
  const threshold = randomInteger(60, 80, random);
  const branchOutput = score >= threshold ? '合格' : '再試験';

  const loopEnd = randomInteger(3, 6, random);
  const loopSum = loopEnd * (loopEnd + 1) / 2;

  return [
    {
      id: 'assignment',
      title: '代入と計算',
      items: [
        statement('assignment-start', `x ← ${start}`, ProcessEnum.SetValToVariableOrArray, ['x', String(start)]),
        statement('assignment-add', `x ← x + ${increase}`, ProcessEnum.SetValToVariableOrArray, ['x', `x + ${increase}`]),
        statement('assignment-output', 'xを表示する', ProcessEnum.Output, ['x']),
      ],
      choices: numericChoices(sum, random),
      expectedOutput: String(sum),
      explanation: `xに${start}を代入した後、${increase}を足します。`,
    },
    {
      id: 'branch',
      title: '条件分岐',
      items: [
        statement('branch-score', `score ← ${score}`, ProcessEnum.SetValToVariableOrArray, ['score', String(score)]),
        statement('branch-if', `もし score >= ${threshold} ならば`, ProcessEnum.If, [`score >= ${threshold}`]),
        statement('branch-pass', '「合格」を表示する', ProcessEnum.Output, ['"合格"']),
        statement('branch-else', 'そうでなければ', ProcessEnum.Else, []),
        statement('branch-fail', '「再試験」を表示する', ProcessEnum.Output, ['"再試験"']),
        statement('branch-end', 'を実行する', ProcessEnum.EndIf, []),
      ],
      choices: shuffle(['合格', '再試験', String(score), '何も表示されない'], random),
      expectedOutput: branchOutput,
      explanation: `scoreは${score}、条件の基準は${threshold}です。`,
    },
    {
      id: 'loop',
      title: '繰り返しと合計',
      items: [
        statement('loop-sum', 'sum ← 0', ProcessEnum.SetValToVariableOrArray, ['sum', '0']),
        statement(
          'loop-for',
          `i を 1 から ${loopEnd} まで 1 ずつ増やしながら，`,
          ProcessEnum.ForIncrement,
          ['i', '1', String(loopEnd), '1']
        ),
        statement('loop-add', 'sum ← sum + i', ProcessEnum.SetValToVariableOrArray, ['sum', 'sum + i']),
        statement('loop-end', 'を繰り返す', ProcessEnum.EndFor, []),
        statement('loop-output', 'sumを表示する', ProcessEnum.Output, ['sum']),
      ],
      choices: numericChoices(loopSum, random),
      expectedOutput: String(loopSum),
      explanation: `sumに1から${loopEnd}までの数を順に足します。`,
    },
  ];
};

export const buildPredictionProgram = async (question: CodePredictionQuestion): Promise<string> => {
  const converted = await Promise.all(question.items.map(item => cnvToJs({
    lineTokens: item.lineTokens ?? [],
    processIndex: Number(item.processIndex),
    isConstant: item.isConstant,
  })));
  return converted.filter(Boolean).join('\n');
};

const normalizeOutput = (value: string): string[] =>
  value.replace(/\r\n/g, '\n').split('\n').map(line => line.trim()).filter(Boolean);

export const isPredictedOutputCorrect = (actualOutput: string, selectedChoice: string): boolean => {
  const actual = normalizeOutput(actualOutput);
  const selected = normalizeOutput(selectedChoice);
  return actual.length === selected.length && actual.every((line, index) => line === selected[index]);
};
