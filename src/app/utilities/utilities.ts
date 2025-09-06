import { arrayMove } from '@dnd-kit/sortable';
import { UniqueIdentifier } from "@dnd-kit/core";

import type { FlattenedItem, TreeItem, TreeItems, ErrObj } from '../types';
import { BraketSymbolEnum, ReturnFuncDncl, ProcessEnum, UserDefinedFuncDncl, VoidFuncDncl } from '@/app/enum';
import { inputTypeEnum, keyPrefixEnum, ValidationEnum } from '../components/Dialog/Enum';

import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from '@sglkc/kuroshiro-analyzer-kuromoji';
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

function getDragDepth(offset: number, indentationWidth: number) {
  return Math.round(offset / indentationWidth);
}

export function getProjection(
  items: FlattenedItem[],
  activeId: UniqueIdentifier,
  overId: UniqueIdentifier,
  dragOffset: number,
  indentationWidth: number
) {
  const overItemIndex = items.findIndex(({ id }) => id === overId);
  const activeItemIndex = items.findIndex(({ id }) => id === activeId);
  const activeItem = items[activeItemIndex];
  const newItems = arrayMove(items, activeItemIndex, overItemIndex);
  const previousItem = newItems[overItemIndex - 1];
  const nextItem = newItems[overItemIndex + 1];
  const dragDepth = getDragDepth(dragOffset, indentationWidth);
  const projectedDepth = activeItem.depth + dragDepth;
  const maxDepth = getMaxDepth({
    previousItem,
  });
  const minDepth = getMinDepth({ nextItem });
  let depth = projectedDepth;

  if (projectedDepth >= maxDepth) {
    depth = maxDepth;
  } else if (projectedDepth < minDepth) {
    depth = minDepth;
  }
  return { depth, maxDepth, minDepth, parentId: getParentId() };

  function getParentId() {
    if (depth === 0 || !previousItem) {
      return null;
    }

    if (depth === previousItem.depth) {
      return previousItem.parentId;
    }

    if (depth > previousItem.depth) {
      return previousItem.id;
    }

    const newParent = newItems
      .slice(0, overItemIndex)
      .reverse()
      .find((item) => item.depth === depth)?.parentId;

    return newParent ?? null;
  }
}

function getMaxDepth({ previousItem }: { previousItem: FlattenedItem }) {
  if (previousItem) {
    return previousItem.depth + 1;
  }

  return 0;
}

function getMinDepth({ nextItem }: { nextItem: FlattenedItem }) {
  if (nextItem) {
    return nextItem.depth;
  }

  return 0;
}

function flatten(
  items: TreeItems,
  parentId: string | null = null,
  depth = 0
): FlattenedItem[] {
  return items.reduce<FlattenedItem[]>((acc, item, index) => {
    return [
      ...acc,
      { ...item, parentId, depth, index },
      ...flatten(item.children, item.id, depth + 1),
    ];
  }, []);
}

export function flattenTree(items: TreeItems): FlattenedItem[] {
  return flatten(items);
}

export function buildTree(flattenedItems: FlattenedItem[]): TreeItems {
  const root: TreeItem = { id: 'root', line: '', children: [] };
  const nodes: Record<string, TreeItem> = { [root.id]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] }));

  for (const item of items) {
    const { id, line, children } = item;
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId] ?? findItem(items, parentId);

    nodes[id] = { id, line, children };
    parent.children.push(item);
  }

  return root.children;
}

export function findItem(items: TreeItems, itemId: string) {
  return items.find(({ id }) => id === itemId);
}

export function findItemDeep(
  items: TreeItems,
  itemId: string
): TreeItem | undefined {
  for (const item of items) {
    const { id, children } = item;

    if (id === itemId) {
      return item;
    }

    if (children.length) {
      const child = findItemDeep(children, itemId);

      if (child) {
        return child;
      }
    }
  }

  return undefined;
}

export function removeItem(items: TreeItems, id: string) {
  const newItems = [];

  for (const item of items) {
    if (item.id === id) {
      continue;
    }

    if (item.children.length) {
      item.children = removeItem(item.children, id);
    }

    newItems.push(item);
  }

  return newItems;
}

export function setProperty<T extends keyof TreeItem>(
  items: TreeItems,
  id: string,
  property: T,
  setter: (value: TreeItem[T]) => TreeItem[T]
) {
  for (const item of items) {
    if (item.id === id) {
      item[property] = setter(item[property]);
      continue;
    }

    if (item.children.length) {
      item.children = setProperty(item.children, id, property, setter);
    }
  }

  return [...items];
}

function countChildren(items: TreeItems, count = 0): number {
  return items.reduce((acc, { children }) => {
    if (children.length) {
      return countChildren(children, acc + 1);
    }

    return acc + 1;
  }, count);
}

export function getChildCount(items: TreeItems, id: string) {
  if (!id) {
    return 0;
  }

  const item = findItemDeep(items, id);

  return item ? countChildren(item.children) : 0;
}

export function removeChildrenOf(items: FlattenedItem[], ids: string[]) {
  const excludeParentIds = [...ids];

  return items.filter((item) => {
    if (item.parentId && excludeParentIds.includes(item.parentId)) {
      if (item.children.length) {
        excludeParentIds.push(item.id);
      }
      return false;
    }

    return true;
  });
}


const findFromTreeItem = (items: TreeItems, id: UniqueIdentifier): FlattenedItem | undefined => {
  const flattenedItems = flatten(items)
  return flattenedItems.find((item) => item.id === id)
}

export const getChildrenIds = (
  items: TreeItems,
  id: UniqueIdentifier,
  includeSelf = false
): UniqueIdentifier[] => {
  const item = findFromTreeItem(items, id)
  if (!item) {
    return []
  }

  const childrenIds = item.children.flatMap((child) => getChildrenIds(items, child.id, true))

  return includeSelf ? [id, ...childrenIds] : childrenIds
}

export function getEnumIndex<T extends Record<string, string | number>>(enumObj: T, value: T[keyof T]): number {
  return Object.values(enumObj).indexOf(value);
}

export function enumsToObjects<T>(enumObjs: T[]) {

  const enumToObjectArray = <T extends object>(enumObj: T): { name: string, value: string }[] => {
    return Object.entries(enumObj).map(([key, value]) => { return { name: key as string, value: value as string } }
    )
  };

  const list: { name: string; value: string }[][] = enumObjs.map(enumObj => enumToObjectArray(enumObj as object));
  const flatList: { name: string, value: string }[] = list.flat();

  return flatList;
}

export function getValueByKey(array: { name: string, value: string }[], key: string): string {
  const item = array.find(item => item.name === key);
  if (!item) return "";
  return item.value;
}

export function searchEnumValue<T>(enumObj: T, key: string | null): T[keyof T] | null {

  const getEnumKeys = <T extends object>(enumObj: T): (keyof T)[] => { return Object.keys(enumObj).filter(key => isNaN(Number(key))) as (keyof T)[]; };

  if (key == null) return null;
  function getEnumValueByKey(enumObj: T, key: string): T[keyof T] | null {
    return enumObj[key as keyof typeof enumObj] || null;
  }
  const keys = getEnumKeys(enumObj as object);
  return keys.includes(key as keyof object) ? getEnumValueByKey(enumObj, key) : null;
};

export function checkParenthesesBalance(strArray: string[]): { isBalanced: boolean, isCorrectOrder: boolean, balance: number, hasEmptyParentheses: boolean } {
  let balance = 0;
  let isCorrectOrder = true;
  let hasEmptyParentheses = false;

  const regex = /\(\)/;
  for (let i = 0; i < strArray.length; i++) {
    if (regex.test(strArray[i])) {
      hasEmptyParentheses = true;
    }
  }

  const input = strArray.join('');
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '(') {
      balance++;
    } else if (char === ')') {
      if (balance === 0) {
        isCorrectOrder = false;
      }
      balance--;
    }
  }

  return {
    isBalanced: balance === 0,
    isCorrectOrder: isCorrectOrder,
    balance: balance,
    hasEmptyParentheses: hasEmptyParentheses
  };
}

//javascriptのオペランドに変換
export const cnvAndOrOperator = (targetString: string) => {
  // 置換規則を定義
  const replacements = [
    { regex: /\s*または\s*/g, replacement: ' || ' },
    { regex: /\s*かつ\s*/g, replacement: ' && ' },
    { regex: /(?<=\s)と(?=\s)/g, replacement: ' + ' },
    // { regex: /でない/g, replacement: '!' }
  ];

  replacements.forEach(({ regex, replacement }) => {
    targetString = targetString.replace(regex, replacement);
  });

  return targetString;
}

//否定演算子をjavascriptのオペランドに変換
export const transformNegation = (targetString: string) => {

  return targetString.replace(/\(([^()]+)\)\s*でない/g, '!($1)').replace(/([^()]+)s*でない/g, '!($1)');
}

// 「÷」記号を使った除算をMath.floorで包む式に変換 
export const cnvToDivision = (targetString: string): string => {
  return targetString.replace(/(\w+)\s*÷\s*(\w+)/g, 'Math.floor($1 / $2)');
}

// 文字列を二乗する形式に変換する関数
function squareString(str: string) {
  // "Square" で始まる部分を見つけて置換
  const result = str.replace(/Square\s*\(\s*([a-zA-Z0-9_]+)\s*\)/g, (match, num) => {
    const number = parseInt(num, 10);
    return `(${number} * ${number})`;
  });
  return result;
}
// 文字列を指数形式に変換する関数
function exponentiateString(str: string) {
  // "Exponentiation" で始まる部分を見つけて置換
  const result = str.replace(/Exponentiation\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\)/g, (match, base, exponent) => {
    return `(${base}**${exponent})`;
  });
  return result;
}
function replaceOddFunctions(str: string) {
  return str.replace(/Odd\s*\(\s*([a-zA-Z0-9_]+)\s*\)/g, (match, variable) => {
    // console.log(`Match: ${match}`);
    // console.log(`Variable: ${variable}`);
    return `${variable} % 2 !== 0`;
  });
}

export const tryParseToJsFunction = (targetString: string): { errorMsgArray: string[]; hasError: boolean; convertedStr: string } => {

  const errorMsgArray: string[] = [];

  // "Random(m,n)" という文字列をJavaScriptの乱数生成コードに変換する関数
  function convertRandomString(str: string): string {
    // 正規表現を使って "Random(m,n)" の部分を検出
    const result = str.replace(/Random\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\)/g, (match, m, n) => {
      const numM = parseInt(m, 10);
      const numN = parseInt(n, 10);
      if (numM > numN) {
        errorMsgArray.push(`第1引数の値は第2引数の値よりも小さくしてください`);
        return '';  // mがnより大きい場合は空文字を返す
      }
      return `Math.floor(Math.random() * (${numN} - ${numM} + 1)) + ${numM}`;
    });
    return result;
  }

  function convertBinaryFunctions(str: string) {
    return str.replace(/Binary\s*\(\s*([a-zA-Z0-9_]+)\s*\)/g, (match, variable) => {
      return `(${variable}).toString(2)`;
    });
  }

  function removeWord(str: string, removeWord: string) {
    const regex = new RegExp(`\\b${removeWord}\\b`, 'g');
    return str.replace(regex, '').trim();
  }
  targetString = squareString(targetString);
  targetString = exponentiateString(targetString);
  targetString = convertRandomString(targetString);
  targetString = replaceOddFunctions(targetString);
  targetString = convertBinaryFunctions(targetString);
  targetString = removeWord(targetString, UserDefinedFuncDncl.UserDefined);

  //異常値があれば空文字を返すようにしている
  if (targetString == "") {

    return { errorMsgArray: errorMsgArray, hasError: true, convertedStr: targetString };
  }
  return { errorMsgArray: [], hasError: false, convertedStr: targetString };

}

export const tryParseToPyFunc = (targetString: string): { errorMsgArray: string[]; hasError: boolean; convertedStr: string } => {

  const errorMsgArray: string[] = [];

  // "Random(m,n)" という文字列をPythonの乱数生成コードに変換する関数
  //randomモジューラのimportが必要
  function convertRandomString(str: string): string {
    // 正規表現を使って "Random(m,n)" の部分を検出
    const result = str.replace(/Random\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\)/g, (match, m, n) => {
      const numM = parseInt(m, 10);
      const numN = parseInt(n, 10);
      if (numM > numN) {
        errorMsgArray.push(`第1引数の値は第2引数の値よりも小さくしてください`);
        return '';  // mがnより大きい場合は空文字を返す
      }
      return `random.randint(${numM}, ${numN}`;
    });
    return result;
  }

  function convertBinaryFunctions(str: string) {
    return str.replace(/Binary\s*\(\s*([a-zA-Z0-9_]+)\s*\)/g, (match, variable) => {
      return `bin(${variable})`;
    });
  }

  function removeWord(str: string, removeWord: string) {
    const regex = new RegExp(`\\b${removeWord}\\b`, 'g');
    return str.replace(regex, '').trim();
  }
  targetString = squareString(targetString);
  targetString = exponentiateString(targetString);
  targetString = convertRandomString(targetString);
  targetString = replaceOddFunctions(targetString);
  targetString = convertBinaryFunctions(targetString);
  targetString = removeWord(targetString, UserDefinedFuncDncl.UserDefined);

  //異常値があれば空文字を返すようにしている
  if (targetString == "") {

    return { errorMsgArray: errorMsgArray, hasError: true, convertedStr: targetString };
  }
  return { errorMsgArray: [], hasError: false, convertedStr: targetString };

}

export const tryParseToVbaFunc = (targetString: string): { errorMsgArray: string[]; hasError: boolean; convertedStr: string } => {

  const errorMsgArray: string[] = [];

  // 文字列を指数形式に変換する関数
  function exponentiateString(str: string) {
    // "Exponentiation" で始まる部分を見つけて置換
    const result = str.replace(/Exponentiation\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\)/g, (match, base, exponent) => {
      return `(${base}^${exponent})`;
    });
    return result;
  }

  function convertRandomString(str: string): string {
    // 正規表現を使って "Random(m,n)" の部分を検出
    const result = str.replace(/Random\s*\(\s*([a-zA-Z0-9_]+)\s*,\s*([a-zA-Z0-9_]+)\s*\)/g, (match, m, n) => {
      const numM = parseInt(m, 10);
      const numN = parseInt(n, 10);
      if (numM > numN) {
        errorMsgArray.push(`第1引数の値は第2引数の値よりも小さくしてください`);
        return '';  // mがnより大きい場合は空文字を返す
      }
      return `Int((${numN} - ${numM} + 1) * Rnd + ${numM})`;
    });
    return result;
  }

  //無理やりワンライナーで記述
  function convertBinaryFunctions(str: string) {
    return str.replace(/Binary\s*\(\s*([a-zA-Z0-9_]+)\s*\)/g, (match, variable) => {
      return `IIf(${variable} = 0, "0", Mid(Application.WorksheetFunction.Dec2Bin(${variable}), 1))`;
    });
  }

  function replaceOddFunctions(str: string) {
    return str.replace(/Odd\s*\(\s*([a-zA-Z0-9_]+)\s*\)/g, (match, variable) => {
      return `${variable} Mod 2 <> 0`;
    });
  }

  function removeWord(str: string, removeWord: string) {
    const regex = new RegExp(`\\b${removeWord}\\b`, 'g');
    return str.replace(regex, '').trim();
  }
  targetString = squareString(targetString);
  targetString = exponentiateString(targetString);
  targetString = convertRandomString(targetString);
  targetString = replaceOddFunctions(targetString);
  targetString = convertBinaryFunctions(targetString);
  targetString = removeWord(targetString, UserDefinedFuncDncl.UserDefined);

  //異常値があれば空文字を返すようにしている
  if (targetString == "") {

    return { errorMsgArray: errorMsgArray, hasError: true, convertedStr: targetString };
  }
  return { errorMsgArray: [], hasError: false, convertedStr: targetString };

}

export const checkBraketPair = (targetStringArray: string[]): { errorMsgArray: string[]; hasError: boolean; } => {

  const errorMsgArray: string[] = [];

  const result: { isBalanced: boolean, isCorrectOrder: boolean, balance: number, hasEmptyParentheses: boolean } = (checkParenthesesBalance(targetStringArray));

  if (!result.isBalanced) {
    if (result.balance > 0) {
      errorMsgArray.push(`『 ${BraketSymbolEnum.RigthBraket} 』を追加してください`);
    } else {
      errorMsgArray.push(`『 ${BraketSymbolEnum.LeftBraket} 』を追加してください`);
    }
  }
  if (!result.isCorrectOrder) {
    errorMsgArray.push(`『 ${BraketSymbolEnum.RigthBraket} 』の前方には対になる『 ${BraketSymbolEnum.LeftBraket} 』が必要です`);
  }
  if (result.hasEmptyParentheses) {
    errorMsgArray.push(`『 ${BraketSymbolEnum.LeftBraket} 』と『 ${BraketSymbolEnum.RigthBraket} 』の内側には要素が必要です`);
  }
  if (errorMsgArray.length > 0) {
    return { errorMsgArray: errorMsgArray, hasError: true };
  }
  return { errorMsgArray: [], hasError: false };
}

export const updateToWithSquareBrackets = (obj: { [k: string]: string; }) => {

  //添字は前後に[]をつける
  const updatedObj: { [k: string]: string; } = {};
  for (const key in obj) {
    if (key.includes(keyPrefixEnum.Suffix)) {
      updatedObj[key] = `[${obj[key]}]`;
    } else {
      updatedObj[key] = obj[key];
    }
  }
  return updatedObj;
}

export const getOperandsMaxIndex = (obj: { [k: string]: string; }, keyword: keyPrefixEnum) => {
  return Object.keys(obj)
    .filter(key => key.startsWith(`${keyword}_`))
    .map(key => parseInt(key.split("_")[1], 10))
    .reduce((max, current) => (current > max ? current : max), -1);
}

export const sanitizeInput = (targetString: string) => {
  // 許可された文字セット: アルファベット、数字、スペース、および一部の記号、日本語 
  const regex = /^[a-zA-Z0-9_ ぁ-んァ-ンｧ-ﾝﾞﾟ一-龠々 \.,!?<>=!&|\+\-\*/\(\)%!""\[\]\u3000]*$/;

  // 制御文字（ASCII 0 - 31）を排除 
  const controlChars = /[\x00-\x1F]/;

  if (regex.test(targetString) && !controlChars.test(targetString)) {
    return targetString;
  } else {
    return "";
  }
}

export const escapeHtml = (unsafe: string) => {
  return unsafe
    // 単独の & をエスケープし、&& の前後にスペースがある場合はエスケープしない 
    .replace(/(?<!&)&(?!&)/g, "&amp;")
    // .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

export const isValidExpression = (targetString: string): { errorMsgArray: string[], hasError: boolean } => {

  try {
    new Function(`return ${targetString}`);
    return { errorMsgArray: [], hasError: false };
  } catch (e: unknown) {
    const error = e as Error;
    let errMsg = error.message;
    if (errMsg.includes('Unexpected token')) {
      const regex = /'([^']*)'/;
      const match = errMsg.match(regex);
      const extracted = match ? match[1] : null;
      errMsg = `誤った位置に${extracted?.replace('!', '「でない」')}が使われています`
    }
    return { errorMsgArray: [errMsg], hasError: true };
  }
}

//表示文では「と」が入るので、Function関数が実行できない
//サニタイジング後に「と」は「&」に置換する
export const replaceToConcatenation = (targetString: string) => {
  return targetString.replace(/ と /g, ' + ')
};
export const replaceToVbaConcatenation = (targetString: string) => {
  return targetString.replace(/\s*\+\s*/g, ' & ')
};

const toEmptyIfNull = (targetString: string | undefined) => {
  if (!(targetString)) return "";
  //オブジェクト内のundefinedは文字列の'undefined'になっている
  if (targetString == 'undefined') return "";
  return targetString;
}

export const ValidateObjValue = (obj: { [k: string]: string; }, operandsMaxIndex: number, proceccType: ProcessEnum, keyword: keyPrefixEnum, treeItems: TreeItems): { errorMsgArray: string[]; hasError: boolean; } => {

  const regexForOperator = new RegExp(/^(\+|\-|\*|\/|,|÷|%|==|!=|>|>=|<|<=|かつ|または|と)$/);

  //オペランドの文字列のバリデーションパターン
  const regexForStringOperand = new RegExp(ValidationEnum.String);
  const regexForVariable = new RegExp(ValidationEnum.Variable);
  const regexForNumber = new RegExp(ValidationEnum.Number);
  const regexForVariableOrPositiveInteger = new RegExp(ValidationEnum.VariableOrPositiveInteger);
  const regexForInitializeArray = new RegExp(ValidationEnum.InitializeArray);
  const regexForParentheses = new RegExp(ValidationEnum.Parentheses);
  //添字はカンマ区切りも許容(実際はダメだが一括代入の処理があるため許容)
  const regexForSuffix = new RegExp(ValidationEnum.InitializeArray);
  const regexForSuffixWithBrackets = new RegExp(/^(?:(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)(?:,(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+))*)|(?:\([^\)]*\))|(?:\[[^\]]*\])$/);
  const regexForNegation = new RegExp(ValidationEnum.Negation);
  const regexForConstant = new RegExp(ValidationEnum.Constant);

  function isEnumValue(value: string): value is ReturnFuncDncl | VoidFuncDncl | UserDefinedFuncDncl {
    const combinedEnumValues: string[] = [...Object.values(ReturnFuncDncl), ...Object.values(VoidFuncDncl), ...Object.values(UserDefinedFuncDncl)];
    return combinedEnumValues.includes(value);
  }

  const errorMsgArray: string[] = [];

  const userDefinedFunctionInfoArray = getUserDefinedFunctionInfoArray(treeItems);

  function getFunctionInfo(funcName: string): UserDefinedFunctionInfo | undefined {
    return userDefinedFunctionInfoArray.find(func => func.funcName === funcName);
  }

  for (let i = 0; i <= operandsMaxIndex; i++) {

    //演算子の確認
    if (i == 1) {
      if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Operator}`]) == "") {
        errorMsgArray.push(`${i}番目と${i + 1}番目のオペランドの間に演算子が必要です`);
      } else {
        if (!regexForOperator.test(obj[`${keyword}_${i}_${keyPrefixEnum.Operator}`])) {
          errorMsgArray.push(`${i}番目と${i + 1}番目のオペランドの間に不適切な演算子が使用されています`);
        }
      }
    }

    //オペランドがない場合はチェックをスキップ
    if (!(obj[`${keyword}_${i}`])) {
      if (toEmptyIfNull(obj[`${keyword}_${i}`]) != "") {
        errorMsgArray.push(`${i + 1}番目のオペランドが入力されていません`);
      }
    }

    const isConstant = obj[`${keyword}_${i}_isConstant`] === 'true';

    switch (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Type}`])) {
      case inputTypeEnum.String:

        if (operandsMaxIndex > 0) {
          if (!([Number(ProcessEnum.Output), Number(ProcessEnum.InitializeArray)].includes(Number(proceccType)))) {
            // errorMsgArray.push(`文字列が含まれる場合，演算子が使用できません`);
          }
        }
        if (!regexForStringOperand.test(obj[`${keyword}_${i}`])) {
          errorMsgArray.push(`${i + 1}番目のオペランドに不適切な値が使用されています`);
        }
        break;

      case inputTypeEnum.Variable:
        if (!regexForVariable.test(obj[`${keyword}_${i}`])) {
          errorMsgArray.push(`${i + 1}番目のオペランドの変数名に不適切な文字が使用されています`);
        }
        break;

      case inputTypeEnum.Number:
        if (!regexForNumber.test(obj[`${keyword}_${i}`])) {
          errorMsgArray.push(`${i + 1}番目のオペランドの数値に不適切な文字が使用されています`);
        }
        break;

      case inputTypeEnum.Array:
        if (!regexForVariable.test(obj[`${keyword}_${i}`])) {
          errorMsgArray.push(`${i + 1}番目のオペランドの配列名に不適切な文字が使用されています`);
        }
        break;

      default:
        const validationRegex = isConstant ? regexForConstant : regexForVariableOrPositiveInteger;
        if (!validationRegex.test(obj[`${keyword}_${i}`])) {
          const errorMsg = isConstant
            ? `${i + 1}番目のオペランドの定数名に不適切な文字が使用されています（定数名は大文字で始める必要があります）`
            : `${i + 1}番目のオペランドに不適切な値が使用されています`;
          errorMsgArray.push(errorMsg);
        }
        break;
    }

    if (isReservedWord(obj[`${keyword}_${i}`])) {

      switch (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Type}`])) {
        case inputTypeEnum.Boolean:
          if (obj[`${keyword}_${i}`] == 'true' || obj[`${keyword}_${i}`] == 'false') {
            break;
          }
        default:
          errorMsgArray.push(`${i + 1}番目のオペランドに予約語が使用されています`);
          break;
      }
    }
    //関数名
    if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.FunctionName}`]) != "") {

      //新しい関数の定義以外の場面では関数名の入力が必須
      if (proceccType != ProcessEnum.DefineFunction) {
        if (!getFunctionInfo(obj[`${keyword}_${i}_${keyPrefixEnum.FunctionName}`])) {
          errorMsgArray.push(`${i + 1}番目のオペランドに，定義されていない関数が使用されています`);
        }
      };

      if (!regexForStringOperand.test(obj[`${keyword}_${i}_${keyPrefixEnum.FunctionName}`])) {
        errorMsgArray.push(`${i + 1}番目のオペランドに，不適切な関数名が使用されています`);
      }
      if (isReservedWord(obj[`${keyword}_${i}_${keyPrefixEnum.FunctionName}`])) {
        errorMsgArray.push(`${i + 1}番目のオペランドの関数に，予約語が使用されています`);
      }
    }
    if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Function}`]) != "") {
      if (!isEnumValue(obj[`${keyword}_${i}_${keyPrefixEnum.Function}`])) {
        errorMsgArray.push(`${i + 1}番目のオペランドの関数に，用意された関数以外が使用されています`);
      }
    }
    //引数の有無
    if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Argument}`]) != "") {
      for (let j = 0; j < Number(obj[`${keyword}_${i}_${keyPrefixEnum.Argument}`]); j++) {
        if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Argument}_${j}`]) != "") {
          //カンマ区切りを許容
          if (!regexForInitializeArray.test(obj[`${keyword}_${i}_${keyPrefixEnum.Argument}_${j}`])) {
            errorMsgArray.push(`${i + 1}番目のオペランドの関数に，不適切な引数が使用されています`);
          }
          if (isReservedWord(obj[`${keyword}_${i}_${keyPrefixEnum.Argument}_${j}`])) {
            errorMsgArray.push(`${i + 1}番目のオペランドの関数の引数に，予約語が使用されています`);
          }
        }
      }
    }

    //括弧があれば値チェック
    if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.LeftOfOperand}`]) != "") {
      if (!regexForParentheses.test(obj[`${keyword}_${i}_${keyPrefixEnum.LeftOfOperand}`])) {
        errorMsgArray.push(`${i + 1}番目のオペランドの左側で「(」「)」以外の文字が使用されています`);
      }
    }
    if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.RightOfOperand}`]) != "") {
      if (!regexForParentheses.test(obj[`${keyword}_${i}_${keyPrefixEnum.RightOfOperand}`])) {
        errorMsgArray.push(`${i + 1}番目のオペランドの右側で「(」「)」以外の文字が使用されています`);
      }
    }
    if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Suffix}`]) != "") {
      if (!regexForSuffix.test(obj[`${keyword}_${i}_${keyPrefixEnum.Suffix}`])) {
        //()や[]などがついていた場合も想定
        if (!regexForSuffixWithBrackets.test(obj[`${keyword}_${i}_${keyPrefixEnum.Suffix}`])) {
          errorMsgArray.push(`${i + 1}番目のオペランドの添字に不適切な文字が使用されています`);
        }
        if (isReservedWord(obj[`${keyword}_${i}_${keyPrefixEnum.Suffix}`])) {
          errorMsgArray.push(`${i + 1}番目のオペランドの添字に予約語が使用されています`);
        }
      }
    }
    if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Negation}`]) != "") {
      if (!regexForNegation.test(obj[`${keyword}_${i}_${keyPrefixEnum.Negation}`])) {
        errorMsgArray.push(`${i + 1}番目のオペランドの右側の否定演算子に，「でない」以外の文字が使用されています`);
      }
    }
    //For文の初期値
    if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.InitialValue}`]) != "") {
      const initialValueType = obj[`${keyword}_${i}_${keyPrefixEnum.InitialValue}_type`] || inputTypeEnum.Number;
      const pattern = initialValueType === inputTypeEnum.Variable ? ValidationEnum.Variable : ValidationEnum.Number;
      const validationRegex = new RegExp(pattern);

      if (!validationRegex.test(obj[`${keyword}_${i}_${keyPrefixEnum.InitialValue}`])) {
        errorMsgArray.push(`初期値に不適切な文字が使用されています`);
      }
    }
    //For文の終了値
    if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.EndValue}`]) != "") {
      const endValueType = obj[`${keyword}_${i}_${keyPrefixEnum.EndValue}_type`] || inputTypeEnum.Number;
      const pattern = endValueType === inputTypeEnum.Variable ? ValidationEnum.Variable : ValidationEnum.Number;
      const validationRegex = new RegExp(pattern);

      if (!validationRegex.test(obj[`${keyword}_${i}_${keyPrefixEnum.EndValue}`])) {
        errorMsgArray.push(`終了値に不適切な文字が使用されています`);
      }
    }
    //For文の増減差分
    if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Difference}`]) != "") {
      const differenceType = obj[`${keyword}_${i}_${keyPrefixEnum.Difference}_type`] || inputTypeEnum.Number;
      const pattern = differenceType === inputTypeEnum.Variable ? ValidationEnum.Variable : ValidationEnum.Number;
      const validationRegex = new RegExp(pattern);

      if (!validationRegex.test(obj[`${keyword}_${i}_${keyPrefixEnum.Difference}`])) {
        errorMsgArray.push(`差分に不適切な文字が使用されています`);
      }
    }

  }
  if (errorMsgArray.length > 0) {
    return { errorMsgArray: errorMsgArray, hasError: true };
  }
  return { errorMsgArray: [], hasError: false };
}

const pushIfNotEmpty = (array: string[], pushedString: string) => {
  if (pushedString == "") return;
  array.push(pushedString);
}

export const getVariableNames = (obj: { [k: string]: string; }, operandsMaxIndex: number, keyword: keyPrefixEnum): string[] => {

  const strArray: string[] = [];
  //配列への一括代入は左辺が必ず配列名なのでスキップ
  for (let i = 0; i <= operandsMaxIndex; i++) {

    if (obj[`${keyword}_${i}_${keyPrefixEnum.Type}`] == inputTypeEnum.String) {
      continue;
    }

    const variable = toEmptyIfNull(obj[`${keyword}_${i}`]);
    // const isConstant = obj[`${keyword}_${i}_isConstant`] === 'true';

    if (!variable) {
      continue;
    }

    if (!(/^\d+$/.test(variable))) {
      //数値や文字列以外は変数名として格納
      strArray.push(variable);
    }
  }

  return strArray;
}
export const getArrayNames = (obj: { [k: string]: string; }, operandsMaxIndex: number, keyword: keyPrefixEnum): string[] => {

  const strArray: string[] = [];
  for (let i = 0; i <= operandsMaxIndex; i++) {

    if (obj[`${keyword}_${i}_${keyPrefixEnum.Type}`] == inputTypeEnum.String) {
      continue;
    }

    const variable = toEmptyIfNull(obj[`${keyword}_${i}`]);

    if (!variable) {
      continue;
    }

    if (!(/^\d+$/.test(variable))) {
      //数値や文字列以外は変数名として格納
      strArray.push(variable);
    }

    const suffix = toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Suffix}`]);
    if (!(/^\d+$/.test(suffix))) {
      //数値や文字列以外は変数名として格納
      strArray.push(suffix);
    }

    //引数
    for (let j = 0; j < Number(toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Argument}`])); j++) {
      const argument = toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Argument}_${j}`]);
      if (/^\d+$/.test(argument)) {
        continue;
      }
      strArray.push(argument);
    }
  }

  return strArray;
}

// 元のJSON構造を保持しつつ値をサニタイズして更新
export const sanitizeJsonValues = (obj: {
  [k: string]: string;
}) => {
  // サニタイズ関数
  function sanitizeString(str: string) {
    return str.replace(/[&<>"']/g, function (char) {
      switch (char) {
        case '&':
          return '&amp;';
        case '<':
          return '&lt;';
        case '>':
          return '&gt;';
        case '"':
          return '&quot;';
        case "'":
          return '&#39;';
        default:
          return char;
      }
    });
  }
  const sanitizedData = { ...obj }; // 元のデータをコピー
  Object.keys(sanitizedData).forEach(key => {
    if (!key.includes(keyPrefixEnum.Operator)) {
      sanitizedData[key] = sanitizeString(sanitizedData[key]);
    }
  });
  return sanitizedData;
}

export const cnvObjToArray = (obj: { [k: string]: string; }, operandsMaxIndex: number, keyword: keyPrefixEnum): string[] => {

  const strArray: string[] = [];
  //演算子以外はサニタイズされた値で処理していく
  for (let i = 0; i <= operandsMaxIndex; i++) {

    pushIfNotEmpty(strArray, toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Operator}`]));
    pushIfNotEmpty(strArray, toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.LeftOfOperand}`]));

    switch (obj[`${keyword}_${i}_${keyPrefixEnum.Type}`]) {
      case inputTypeEnum.String:
        pushIfNotEmpty(strArray, `"${toEmptyIfNull(obj[`${keyword}_${i}`])}"`);
        break;
      default:
        pushIfNotEmpty(strArray, toEmptyIfNull(obj[`${keyword}_${i}`]));
        break;
    }

    //関数名
    const functionName = `${toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Function}`])}${toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.FunctionName}`])}`

    //引数
    const tmpArguments: string[] = [];
    for (let j = 0; j < Number(toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Argument}`])); j++) {
      pushIfNotEmpty(tmpArguments, toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Argument}_${j}`]));
    }
    const joinedStr = tmpArguments.join(",");
    if (joinedStr.length > 0) {
      pushIfNotEmpty(strArray, `${functionName}(${joinedStr})`);
    } else {
      pushIfNotEmpty(strArray, `${functionName}`);
    }

    pushIfNotEmpty(strArray, toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Suffix}`]));
    pushIfNotEmpty(strArray, toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.RightOfOperand}`]));
    pushIfNotEmpty(strArray, toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Negation}`]));
  }

  return strArray;
}

const reservedWords = ["abstract", "await", "boolean", "break", "byte", "case", "catch", "char", "class", "const", "continue", "debugger", "default", "delete", "do", "double", "else", "enum", "export", "extends", "false", "final", "finally", "float", "for", "function", "goto", "if", "implements", "import", "in", "instanceof", "int", "interface", "let", "long", "native", "new", "null", "package", "private", "protected", "public", "return", "short", "static", "super", "switch", "synchronized", "this", "throw", "throws", "transient", "true", "try", "typeof", "var", "void", "volatile", "while", "with", "yield"];

export function isReservedWord(str: string) {
  return reservedWords.some(reserved => reserved === str);
}

export function flattenTreeItems(treeItems: TreeItems): Statement[] {
  const result: { id: string, code: string, processIndex: number }[] = [];

  function flatten(treeItem: TreeItem) {
    if (treeItem.id && treeItem.line && treeItem.processIndex !== undefined) {
      result.push({
        id: treeItem.id,
        code: treeItem.line,
        processIndex: treeItem.processIndex
      });
    }

    if (treeItem.children && treeItem.children.length > 0) {
      treeItem.children.forEach(child => flatten(child));
    }
  }

  treeItems.forEach(treeItem => flatten(treeItem));
  return result;
}

interface Statement {
  id: string; code: string; processIndex: number;
}

export interface UserDefinedFunctionInfo {
  funcName: string; argumentCount: number;
}

function filterByProcessIndex(statements: Statement[], targetProcessIndex: number): Statement[] {
  return statements.filter(statement => statement.processIndex === targetProcessIndex);
}

export function getUserDefinedFunctionInfoArray(treeItems: TreeItems): UserDefinedFunctionInfo[] {

  function extractFuncName(input: string): string | null {
    const match = input.match(/関数(.*?)を/);
    return match ? match[1].replace(/\([^)]*\)/g, '').trim() : null;
  }

  function countArguments(input: string): number {
    const match = input.match(/\(([^)]*)\)/);
    if (match && match[1]) {
      const argumentsInside = match[1].trim();
      return argumentsInside ? argumentsInside.split(',').length : 0;
    }
    return 0;
  }

  function getUserDefinedFunctionInfoArray(statements: Statement[]): UserDefinedFunctionInfo[] {
    return statements.map(statement => {
      const funcName = extractFuncName(statement.code);
      const argumentCount = countArguments(statement.code);
      return { funcName: funcName || "", argumentCount: argumentCount };
    });
  }

  const flattened: Statement[] = flattenTreeItems(treeItems);
  const filtered: Statement[] = filterByProcessIndex(flattened, ProcessEnum.DefineFunction);

  return getUserDefinedFunctionInfoArray(filtered);

}

export const cnvToRomaji = async (text = '') => {
  const kuroshiro = new Kuroshiro();
  await kuroshiro.init(new KuromojiAnalyzer({ dictPath: `${basePath}/dict/` }));
  const romaji = await kuroshiro.convert(text, { to: 'romaji' });
  return romaji;
};

export const containsJapanese = (text: string): boolean => {
  const kanjiRegex = /[\u4E00-\u9FFF]/; // 漢字
  const hiraganaRegex = /[\u3040-\u309F]/; // ひらがな
  const katakanaRegex = /[\u30A0-\u30FF]/; // 全角カタカナ
  const halfWidthKatakanaRegex = /[\uFF65-\uFF9F]/; // 半角カタカナ

  return kanjiRegex.test(text) || hiraganaRegex.test(text) || katakanaRegex.test(text) || halfWidthKatakanaRegex.test(text);
};

export function enumToKeyIndexObject<T extends object>(enumObj: T): { [key: string]: number } {
  return Object.keys(enumObj)
    .filter((key) => isNaN(Number(key))) // Filtering out numeric keys
    .reduce((acc, key, index) => {
      acc[key] = index;
      return acc;
    }, {} as { [key: string]: number });
}

export const checkConstantReassignment = (flatten: FlattenedItem[], currentIndex: number): { hasError: boolean; errors: string[] } => {
  const currentItem = flatten[currentIndex];
  const errors: string[] = [];

  // 現在のアイテムが定数かどうかチェック
  if (currentItem.isConstant && currentItem.variables && currentItem.variables.length > 0) {
    const currentVariable = currentItem.variables[0];

    // 以前に同じ名前の定数が定義されているかチェック
    for (let i = 0; i < currentIndex; i++) {
      const previousItem = flatten[i];
      if (previousItem.isConstant &&
        previousItem.variables &&
        previousItem.variables.includes(currentVariable)) {
        errors.push(`定数「${currentVariable}」に再代入はできません`);
        break;
      }
    }
  }

  return { hasError: errors.length > 0, errors };
};

export const checkDNCLSyntax = (items: FlattenedItem[], targetItem: FlattenedItem, lineNum: number): ErrObj => {

  const processIndex = targetItem.processIndex;
  const sameParentItems = items.filter(item => item.parentId == targetItem.parentId);
  const targetIndex = sameParentItems.findIndex(item => item.id == targetItem.id);
  const nextItem = targetIndex == sameParentItems.length ? null : sameParentItems[targetIndex + 1];
  const prevItem = targetIndex > 0 ? sameParentItems[targetIndex - 1] : null;
  let result: ErrObj = { errors: [], hasError: false };

  // 定数再代入チェック
  const constantCheck = checkConstantReassignment(items, targetIndex);
  if (constantCheck.hasError) {
    result.hasError = true;
    result.errors.push(...constantCheck.errors.map(error => `${lineNum}行目：${error}`));
  }

  switch (processIndex) {
    case ProcessEnum.Output:
    case ProcessEnum.SetValToVariableOrArray:
    case ProcessEnum.InitializeArray:
    case ProcessEnum.BulkAssignToArray: {
      if (targetItem.children.length > 0) {
        result = { errors: [`${lineNum}行目:この行には別の処理をぶら下げられません`], hasError: true };
        break;
      }
      break;
    }

    case ProcessEnum.If: {
      //接続する要素が同じ深度・同じ親IDで次の要素
      const hasItem = nextItem?.processIndex == ProcessEnum.ElseIf || nextItem?.processIndex == ProcessEnum.Else || nextItem?.processIndex == ProcessEnum.EndIf;
      if (!hasItem || !nextItem) {
        result = { errors: [`${lineNum}行目:後続処理に「を実行し，そうでなければ」「を実行し，そうでなくもし<条件>ならば」「実行する」のいずれかを配置してください`], hasError: true };
      }
      break;
    }

    case ProcessEnum.ElseIf: {
      //開始要素が同じ深度・同じ親IDで前の要素
      let hasItem = prevItem?.processIndex == ProcessEnum.If || nextItem?.processIndex == ProcessEnum.ElseIf;;
      if (!hasItem || !prevItem) {
        result = { errors: [`${lineNum}行目:先行処理に「もし<条件>ならば」「を実行し，そうでなくもし<条件>ならば」のいずれかを配置してください`], hasError: true };
      }
      //接続する要素が同じ深度・同じ親IDで次の要素
      hasItem = nextItem?.processIndex == ProcessEnum.ElseIf || nextItem?.processIndex == ProcessEnum.Else || nextItem?.processIndex == ProcessEnum.EndIf;
      if (!hasItem || !nextItem) {
        result = { errors: [`${lineNum}行目:後続処理に「を実行し，そうでなければ」「を実行し，そうでなくもし<条件>ならば」「実行する」のいずれかを配置してください`], hasError: true };
      }
      break;
    }

    case ProcessEnum.Else: {
      //開始要素が同じ深度・同じ親IDで前の要素
      let hasItem = prevItem?.processIndex == ProcessEnum.If || prevItem?.processIndex == ProcessEnum.ElseIf;
      if (!hasItem || !prevItem) {
        result = { errors: [`${lineNum}行目:先行処理に「もし<条件>ならば」「を実行し，そうでなくもし<条件>ならば」のいずれかを配置してください`], hasError: true };
      }
      //接続する要素が同じ深度・同じ親IDで次の要素
      hasItem = nextItem?.processIndex == ProcessEnum.EndIf;
      if (!hasItem || !nextItem) {
        result = { errors: [`${lineNum}行目:後続処理に「実行する」がないか，配置に誤りがあります`], hasError: true };
      }
      break;
    }

    case ProcessEnum.EndIf: {
      //開始要素が同じ深度・同じ親IDで前の要素
      const hasItem = prevItem?.processIndex == ProcessEnum.If || prevItem?.processIndex == ProcessEnum.ElseIf || prevItem?.processIndex == ProcessEnum.Else;
      if (!hasItem || !prevItem) {
        result = { errors: [`${lineNum}行目:先行処理に「もし<条件>ならば」「を実行し，そうでなくもし<条件>ならば」「を実行し，そうでなければ」のいずれかを配置してください`], hasError: true };
        break;
      }
      if (targetItem.children.length > 0) {
        result = { errors: [`${lineNum}行目:この行には別の処理をぶら下げられません`], hasError: true };
        break;
      }
      break;
    }

    case ProcessEnum.While: {
      //終了要素が同じ深度・同じ親IDで次の要素
      const hasItem = nextItem?.processIndex == ProcessEnum.EndWhile;
      if (!hasItem || !nextItem) {
        result = { errors: [`${lineNum}行目:後続処理に「を繰り返す(前判定)」がないか，配置に誤りがあります`], hasError: true };
      }
      break;
    }

    case ProcessEnum.EndWhile: {
      //開始要素が同じ深度・同じ親IDで前の要素
      const hasItem = prevItem?.processIndex == ProcessEnum.While;
      if (!hasItem || !prevItem) {
        result = { errors: [`${lineNum}行目:先行処理に「<条件>の間」がないか，配置に誤りがあります`], hasError: true };
        break;
      }
      if (targetItem.children.length > 0) {
        result = { errors: [`${lineNum}行目:この行には別の処理をぶら下げられません`], hasError: true };
        break;
      }
      break;
    }

    case ProcessEnum.DoWhile:
      //終了要素が同じ深度・同じ親IDで次の要素
      const hasItem = nextItem?.processIndex == ProcessEnum.EndDoWhile;
      if (!hasItem || !nextItem) {
        result = { errors: [`${lineNum}行目:後続処理に「を,<条件>になるまで実行する」がないか，配置に誤りがあります`], hasError: true };
      }
      break;

    case ProcessEnum.EndDoWhile: {
      //開始要素が同じ深度・同じ親IDで前の要素
      const hasItem = prevItem?.processIndex == ProcessEnum.DoWhile;
      if (!hasItem || !prevItem) {
        result = { errors: [`${lineNum}行目:先行処理に「繰り返し，」がないか，配置に誤りがあります`], hasError: true };
        break;
      }
      if (targetItem.children.length > 0) {
        result = { errors: [`${lineNum}行目:この行には別の処理をぶら下げられません`], hasError: true };
        break;
      }
      break;
    }

    case ProcessEnum.ForIncrement:
    case ProcessEnum.ForDecrement: {
      //終了要素が同じ深度・同じ親IDで次の要素
      const hasItem = nextItem?.processIndex == ProcessEnum.EndFor;
      if (!hasItem || !nextItem) {
        result = { errors: [`${lineNum}行目:後続処理に「を繰り返す(順次繰り返し)」がないか，配置に誤りがあります`], hasError: true };
      }
      break;
    }
    case ProcessEnum.EndFor: {
      //開始要素が同じ深度・同じ親IDで前の要素
      const hasItem = prevItem?.processIndex == ProcessEnum.ForIncrement || prevItem?.processIndex == ProcessEnum.ForDecrement;
      if (!hasItem || !prevItem) {
        result = { errors: [`${lineNum}行目:先行処理に「順次繰り返しの開始」がないか，配置に誤りがあります`], hasError: true };
        break;
      }
      if (targetItem.children.length > 0) {
        result = { errors: [`${lineNum}行目:この行には別の処理をぶら下げられません`], hasError: true };
        break;
      }
      break;
    }

    case ProcessEnum.DefineFunction: {
      //終了要素が同じ深度・同じ親IDで次の要素
      const hasItem = nextItem?.processIndex == ProcessEnum.Defined;
      if (!hasItem || !nextItem) {
        result = { errors: [`${lineNum}行目:後続処理に「と定義する」がないか，配置に誤りがあります`], hasError: true };
      }
      break;
    }
    case ProcessEnum.Defined: {
      //開始要素が同じ深度・同じ親IDで前の要素
      const hasItem = prevItem?.processIndex == ProcessEnum.DefineFunction;
      if (!hasItem || !prevItem) {
        result = { errors: [`${lineNum}行目:先行処理に「関数の定義の開始」がないか，配置に誤りがあります`], hasError: true };
        break;
      }
      if (targetItem.children.length > 0) {
        result = { errors: [`${lineNum}行目:この行には別の処理をぶら下げられません`], hasError: true };
        break;
      }
      break;
    }

    case ProcessEnum.ExecuteUserDefinedFunction:

      //定義済みでなければならない
      //引数の括弧を除去して関数名のみ取得
      const token = targetItem.lineTokens && targetItem.lineTokens[0];
      if (!token) {
        result = { errors: [`${lineNum}行目:行を削除し，追加しなおしてください`], hasError: true };
        break;
      }
      const funcName = token.replace(/^([^()]+).*/, '$1');
      if (funcName == '') {
        result = { errors: [`${lineNum}行目:行を削除し，追加しなおしてください`], hasError: true };
        break;
      }

      const hasFuncItems = items.some(item => item.processIndex == ProcessEnum.DefineFunction && item.lineTokens ? item.lineTokens[0].replace(/^([^()]+).*/, '$1') : '' == funcName);

      if (!hasFuncItems) {
        result = { errors: [`${lineNum}行目:実行する関数を定義してください`], hasError: true };
        break;
      }

      if (targetItem.children.length > 0) {
        result = { errors: [`${lineNum}行目:この行には別の処理をぶら下げられません`], hasError: true };
        break;
      }
      break;

    default:
      break;

  }

  return result;
}

export const convertBracketsToParentheses = (input: string): string => {
  return input.replace(/^\[/, BraketSymbolEnum.LeftBraket).replace(/\]$/, BraketSymbolEnum.RigthBraket);
}

export const capitalizeTrueFalse = (str: string): string => {
  return str.replace(/\b(true|false)\b/g, match => match.charAt(0).toUpperCase() + match.slice(1));
}

export const getConstantNames = (obj: { [key: string]: string }, operandsMaxIndex: number, keyword: keyPrefixEnum): string[] => {
  const constants: string[] = [];

  for (let i = 0; i <= operandsMaxIndex; i++) {
    // 定数モード（toUpperCase）がtrueの場合の値を収集
    const constantModeKey = `${keyword}_${i}_isConstant`;
    const valueKey = `${keyword}_${i}`;

    if (obj[constantModeKey] === 'true') {
      const value = obj[valueKey];
      if (value && value.trim() !== '') {
        // 大文字の値を定数として追加
        constants.push(value.toUpperCase());
      }
    }

    // 添字部分の定数も確認
    const suffixConstantModeKey = `${keyword}_${i}_${keyPrefixEnum.Suffix}_isConstant`;
    const suffixValueKey = `${keyword}_${i}_${keyPrefixEnum.Suffix}`;

    if (obj[suffixConstantModeKey] === 'true') {
      const suffixValue = obj[suffixValueKey];
      if (suffixValue && suffixValue.trim() !== '') {
        constants.push(suffixValue.toUpperCase());
      }
    }
  }

  return [...new Set(constants)]; // 重複を除去
};


export const checkForLoopInfinite = (
  initialValue: string,
  endValue: string,
  difference: string,
  isIncrement: boolean,
  treeItems: any[]
): { errorMsgArray: string[]; hasError: boolean } => {

  const errorMsgArray: string[] = [];

  // 変数が含まれている場合は検証をスキップ（実行時に判定）
  const variableRegex = new RegExp('^[a-zA-Z][a-zA-Z0-9_]*$');
  if (variableRegex.test(initialValue) || variableRegex.test(endValue) || variableRegex.test(difference)) {
    return { errorMsgArray: [], hasError: false };
  }

  // 数値として解析
  const initial = parseFloat(initialValue);
  const end = parseFloat(endValue);
  const diff = parseFloat(difference);

  // 数値解析失敗時はエラー
  if (isNaN(initial) || isNaN(end) || isNaN(diff)) {
    errorMsgArray.push('初期値、終了値、差分は数値または変数である必要があります');
    return { errorMsgArray, hasError: true };
  }

  // 差分が0の場合は無限ループ
  if (diff === 0) {
    errorMsgArray.push('差分が0の場合、無限ループになります');
    return { errorMsgArray, hasError: true };
  }

  // 増加ループの場合
  if (isIncrement) {
    if (diff < 0) {
      errorMsgArray.push('増やすループで差分が負の値の場合、無限ループになります');
      return { errorMsgArray, hasError: true };
    }
    if (initial > end) {
      errorMsgArray.push('増やすループで初期値が終了値より大きい場合、ループが実行されません');
      return { errorMsgArray, hasError: true };
    }
  }
  // 減少ループの場合  
  else {
    if (diff > 0) {
      errorMsgArray.push('減らすループで差分が正の値の場合、無限ループになります');
      return { errorMsgArray, hasError: true };
    }
    if (initial < end) {
      errorMsgArray.push('減らすループで初期値が終了値より小さい場合、ループが実行されません');
      return { errorMsgArray, hasError: true };
    }
  }

  return { errorMsgArray: [], hasError: false };
};