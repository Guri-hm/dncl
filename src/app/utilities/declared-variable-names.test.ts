import { ProcessEnum, StatementEnum } from '@/app/enum';
import { getDeclaredVariableNames } from './utilities';
import { TreeItems } from '@/app/types';

describe('getDeclaredVariableNames', () => {
  it('collects assigned names, loop counters and function parameters from nested items', () => {
    const treeItems: TreeItems = [
      {
        id: 'assignment',
        line: 'score ← 0',
        statementType: StatementEnum.Input,
        processIndex: ProcessEnum.SetValToVariableOrArray,
        variables: ['score', 'score', 'total_1'],
        children: [
          {
            id: 'loop',
            line: 'index を繰り返す',
            statementType: StatementEnum.Input,
            processIndex: ProcessEnum.ForIncrement,
            formData: { RigthSide_0: 'index' },
            children: [
              {
                id: 'nested-assignment',
                line: 'sum ← 0',
                statementType: StatementEnum.Input,
                processIndex: ProcessEnum.SetValToVariableOrArray,
                variables: ['sum'],
                children: [],
              },
            ],
          },
        ],
      },
      {
        id: 'constant',
        line: 'LIMIT ← 10',
        statementType: StatementEnum.Input,
        processIndex: ProcessEnum.SetValToVariableOrArray,
        variables: ['LIMIT'],
        isConstant: true,
        children: [],
      },
      {
        id: 'function',
        line: '関数 calculate を',
        statementType: StatementEnum.Input,
        processIndex: ProcessEnum.DefineFunction,
        formData: { RigthSide_0_Argument_0: 'count, step, 7' },
        children: [],
      },
      {
        id: 'output',
        line: 'printedを表示する',
        statementType: StatementEnum.Output,
        processIndex: ProcessEnum.Output,
        variables: ['printed'],
        children: [],
      },
    ];

    expect(getDeclaredVariableNames(treeItems)).toEqual(['score', 'total_1', 'index', 'sum', 'count', 'step']);
  });
});
