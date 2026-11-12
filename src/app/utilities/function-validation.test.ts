import { ProcessEnum } from '@/app/enum';
import { keyPrefixEnum } from '@/app/components/Dialog/Enum';
import { cnvObjToArray, flattenTree, checkDNCLSyntax, getUserDefinedFunctionInfoArray, tryParseToJsFunction, tryParseToPyFunc, tryParseToVbaFunc, ValidateObjValue } from './utilities';
import { cnvToJs } from './cnvToJs';
import { TreeItems } from '@/app/types';

describe('user-defined function arguments', () => {
  it('renders arguments without padding spaces', () => {
    const result = cnvObjToArray({
      [`${keyPrefixEnum.RigthSide}_0_${keyPrefixEnum.Function}`]: 'UserDefined',
      [`${keyPrefixEnum.RigthSide}_0_${keyPrefixEnum.FunctionName}`]: 'sum',
      [`${keyPrefixEnum.RigthSide}_0_${keyPrefixEnum.Argument}`]: '1',
      [`${keyPrefixEnum.RigthSide}_0_${keyPrefixEnum.Argument}_0`]: 'a',
    }, 0, keyPrefixEnum.RigthSide);

    expect(result).toContain('UserDefinedsum(a)');
  });

  it('renders a function with no arguments as an empty parameter list', () => {
    const treeItems: TreeItems = [{
      id: 'function',
      line: '関数 Definerun() を',
      lineTokens: ['Definerun()'],
      processIndex: ProcessEnum.DefineFunction,
      children: [],
    }];
    const result = cnvObjToArray({
      [`${keyPrefixEnum.RigthSide}_0_${keyPrefixEnum.Function}`]: 'Define',
      [`${keyPrefixEnum.RigthSide}_0_${keyPrefixEnum.FunctionName}`]: 'run',
      [`${keyPrefixEnum.RigthSide}_0_${keyPrefixEnum.Argument}`]: '1',
      [`${keyPrefixEnum.RigthSide}_0_${keyPrefixEnum.Argument}_0`]: '',
    }, 0, keyPrefixEnum.RigthSide);

    expect(result).toContain('Definerun()');
    expect(getUserDefinedFunctionInfoArray(treeItems)[0].argumentCount).toBe(0);
    expect(ValidateObjValue({
      [`${keyPrefixEnum.RigthSide}_0_${keyPrefixEnum.FunctionName}`]: 'run',
      [`${keyPrefixEnum.RigthSide}_0_${keyPrefixEnum.Argument}`]: '1',
      [`${keyPrefixEnum.RigthSide}_0_${keyPrefixEnum.Argument}_0`]: '',
    }, 0, ProcessEnum.DefineFunction, keyPrefixEnum.RigthSide, [])).toEqual({
      errorMsgArray: [],
      hasError: false,
    });
    return expect(cnvToJs({
      lineTokens: ['Definerun()'],
      processIndex: ProcessEnum.DefineFunction,
    })).resolves.toBe('function Definerun() {');
  });

  it('renders a call to a function with no arguments', async () => {
    await expect(cnvToJs({
      lineTokens: ['UserDefinedrun()'],
      processIndex: ProcessEnum.ExecuteUserDefinedFunction,
    })).resolves.toBe('run();');
  });

  it('generates function calls without spaces around the arguments', async () => {
    await expect(cnvToJs({
      lineTokens: ['UserDefinedsum(a)'],
      processIndex: ProcessEnum.ExecuteUserDefinedFunction,
    })).resolves.toBe('sum(a);');
  });

  it('removes the user-defined marker before Japanese function names in all code views', () => {
    expect(tryParseToJsFunction('UserDefined和(a)').convertedStr).toBe('和(a)');
    expect(tryParseToPyFunc('UserDefined和(a)').convertedStr).toBe('和(a)');
    expect(tryParseToVbaFunc('UserDefined和(a)').convertedStr).toBe('和(a)');
  });
});

describe('function variable scope validation', () => {
  const createTree = (functionToken: string, functionVariables: string[]): TreeItems => [
    {
      id: 'global',
      line: 'a ← 5',
      lineTokens: ['a', '5'],
      processIndex: ProcessEnum.SetValToVariableOrArray,
      variables: ['a'],
      children: [],
    },
    {
      id: 'function',
      line: `関数 ${functionToken} を`,
      lineTokens: [functionToken],
      processIndex: ProcessEnum.DefineFunction,
      children: functionVariables.map((variable, index) => ({
        id: `local-${index}`,
        line: `${variable} ← 1`,
        lineTokens: [variable, '1'],
        processIndex: ProcessEnum.SetValToVariableOrArray,
        variables: [variable],
        children: [],
      })),
    },
    {
      id: 'function-end',
      line: 'と定義する',
      lineTokens: [],
      processIndex: ProcessEnum.Defined,
      children: [],
    },
  ];

  it('reports a function parameter that shadows an outer variable', () => {
    const flattened = flattenTree(createTree('calculate(a)', []));
    const functionItem = flattened.find(item => item.id === 'function')!;

    const result = checkDNCLSyntax(flattened, functionItem, 2);

    expect(result.hasError).toBe(true);
    expect(result.errors).toContain('2行目：関数内で外側と同じ名前の変数「a」が定義されています');
  });

  it('reports a function-local variable that duplicates an outer variable', () => {
    const flattened = flattenTree(createTree('calculate()', ['a']));
    const functionItem = flattened.find(item => item.id === 'function')!;

    const result = checkDNCLSyntax(flattened, functionItem, 2);

    expect(result.hasError).toBe(true);
    expect(result.errors).toContain('2行目：関数内で外側と同じ名前の変数「a」が定義されています');
  });

  it('allows function variables that do not overlap with outer variables', () => {
    const flattened = flattenTree(createTree('calculate(value)', ['result']));
    const functionItem = flattened.find(item => item.id === 'function')!;

    const result = checkDNCLSyntax(flattened, functionItem, 2);

    expect(result.errors).toHaveLength(0);
  });
});
