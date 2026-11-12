import { v4 as uuidv4 } from 'uuid';
import { ArithmeticOperator, ComparisonOperator, ProcessEnum, StatementEnum } from '@/app/enum';
import { inputTypeEnum } from '@/app/components/Dialog/Enum';
import { TreeItem, TreeItems } from '@/app/types';

export interface EditorSample {
  id: string;
  title: string;
  description: string;
  createItems: () => TreeItems;
}

function createItem(
  line: string,
  lineTokens: string[],
  processIndex: ProcessEnum,
  statementType: StatementEnum,
  formData: Record<string, string>,
  children: TreeItems = [],
  variables: string[] = []
): TreeItem {
  return {
    id: uuidv4(),
    line,
    lineTokens,
    processIndex,
    statementType,
    formData: { processIndex: String(processIndex), ...formData },
    children,
    variables,
  };
}

function assignment(
  variable: string,
  value: string,
  valueType: inputTypeEnum,
  lineTokens = [variable, value],
  rightSideData: Record<string, string> = {}
): TreeItem {
  return createItem(
    `${variable} ← ${value}`,
    lineTokens,
    ProcessEnum.SetValToVariableOrArray,
    StatementEnum.Input,
    {
      LeftSide_0: variable,
      LeftSide_0_isArray: 'false',
      LeftSide_0_isConstant: 'false',
      RigthSide_0: value,
      RigthSide_0_Type: valueType,
      ...rightSideData,
    },
    [],
    [variable]
  );
}

function output(value: string, valueType: inputTypeEnum): TreeItem {
  return createItem(
    `${value}を表示する`,
    [value],
    ProcessEnum.Output,
    StatementEnum.Output,
    {
      RigthSide_0: value,
      RigthSide_0_Type: valueType,
    }
  );
}

function marker(
  line: string,
  processIndex: ProcessEnum,
  statementType: StatementEnum
): TreeItem {
  return createItem(line, [], processIndex, statementType, {});
}

function condition(
  line: string,
  expression: string,
  left: string,
  operator: ComparisonOperator,
  right: string
): TreeItem {
  return createItem(
    line,
    [expression],
    ProcessEnum.If,
    StatementEnum.Condition,
    {
      RigthSide_0: left,
      RigthSide_0_Type: inputTypeEnum.Variable,
      RigthSide_1_Operator: operator,
      RigthSide_1: right,
      RigthSide_1_Type: inputTypeEnum.Number,
    }
  );
}

export const editorSamples: EditorSample[] = [
  {
    id: 'sequence',
    title: '変数を使った順次処理',
    description: '変数に値を代入し、その値を使って計算します。',
    createItems: () => [
      assignment('a', '5', inputTypeEnum.Number),
      assignment('b', 'a', inputTypeEnum.Variable),
      output('b', inputTypeEnum.Variable),
    ],
  },
  {
    id: 'branch',
    title: '条件分岐',
    description: '条件に応じて異なる値を表示します。',
    createItems: () => [
      assignment('score', '80', inputTypeEnum.Number),
      {
        ...condition('もしscore >= 60ならば', 'score >= 60', 'score', ComparisonOperator.GreaterThanOrEqualToOperator, '60'),
        children: [output('score', inputTypeEnum.Variable)],
      },
      marker('を実行する', ProcessEnum.EndIf, StatementEnum.Condition),
    ],
  },
  {
    id: 'while',
    title: '条件繰り返し',
    description: '条件が成り立つ間、変数を増やしながら表示します。',
    createItems: () => [
      assignment('i', '1', inputTypeEnum.Number),
      createItem(
        'i <= 3の間，',
        ['i <= 3'],
        ProcessEnum.While,
        StatementEnum.ConditionalLoopPreTest,
        {
          RigthSide_0: 'i',
          RigthSide_0_Type: inputTypeEnum.Variable,
          RigthSide_1_Operator: ComparisonOperator.LessThanOrEqualToOperator,
          RigthSide_1: '3',
          RigthSide_1_Type: inputTypeEnum.Number,
        },
        [
          output('i', inputTypeEnum.Variable),
          assignment('i', 'i + 1', inputTypeEnum.Variable, ['i', 'i + 1'], {
            RigthSide_1_Operator: ArithmeticOperator.AdditionOperator,
            RigthSide_1: '1',
            RigthSide_1_Type: inputTypeEnum.Number,
          }),
        ]
      ),
      marker('を繰り返す', ProcessEnum.EndWhile, StatementEnum.ConditionalLoopPreTest),
    ],
  },
  {
    id: 'for',
    title: '順次繰り返し',
    description: '回数を決めて、同じ処理を繰り返します。',
    createItems: () => [
      createItem(
        'iを1から5まで1ずつ増やしながら，',
        ['i', '1', '5', '1'],
        ProcessEnum.ForIncrement,
        StatementEnum.SequentialIteration,
        {
          RigthSide_0: 'i',
          RigthSide_0_InitialValue: '1',
          RigthSide_0_InitialValue_type: inputTypeEnum.Number,
          RigthSide_0_EndValue: '5',
          RigthSide_0_EndValue_type: inputTypeEnum.Number,
          RigthSide_0_Difference: '1',
          RigthSide_0_Difference_type: inputTypeEnum.Number,
        },
        [output('i', inputTypeEnum.Variable)],
        ['i']
      ),
      marker('を繰り返す', ProcessEnum.EndFor, StatementEnum.SequentialIteration),
    ],
  },
  {
    id: 'function',
    title: '関数',
    description: '引数を受け取る関数を定義し、呼び出します。',
    createItems: () => [
      createItem(
        '関数 double(n) を',
        ['double(n)'],
        ProcessEnum.DefineFunction,
        StatementEnum.UserDefinedfunction,
        {
          RigthSide_0_FunctionName: 'double',
          RigthSide_0_Argument: '1',
          RigthSide_0_Argument_0: 'n',
        },
        [
          assignment('doubled', 'n * 2', inputTypeEnum.Variable, ['doubled', 'n * 2'], {
            RigthSide_1_Operator: ArithmeticOperator.MultiplicationOperator,
            RigthSide_1: '2',
            RigthSide_1_Type: inputTypeEnum.Number,
          }),
          output('doubled', inputTypeEnum.Variable),
        ]
      ),
      marker('と定義する', ProcessEnum.Defined, StatementEnum.UserDefinedfunction),
      createItem(
        'double(3)',
        ['double(3)'],
        ProcessEnum.ExecuteUserDefinedFunction,
        StatementEnum.ExecuteUserDefinedFunction,
        {
          RigthSide_0_FunctionName: 'double',
          RigthSide_0_Argument: '1',
          RigthSide_0_Argument_0: '3',
        }
      ),
    ],
  },
];
