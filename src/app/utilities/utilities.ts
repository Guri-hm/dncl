import { arrayMove } from '@dnd-kit/sortable';
import { UniqueIdentifier } from "@dnd-kit/core";

import type { FlattenedItem, TreeItem, TreeItems } from '../types';
import { AndOrOperatorJpArrayForDncl, ArithmeticOperatorSymbolArrayForJavascript, BraketSymbolEnum, ComparisonOperatorSymbolArrayForJavascript, ReturnFunctionArrayForDncl } from '@/app/enum';
import { keyPrefixEnum, processEnum, ValidationEnum } from '../components/Dialog/Enum';
import { SwitchEnum } from '../components/Dialog/DnclTextField';
import { deflate } from 'zlib';

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
  const root: TreeItem = { id: 'root', children: [] };
  const nodes: Record<string, TreeItem> = { [root.id]: root };
  const items = flattenedItems.map((item) => ({ ...item, children: [] }));

  for (const item of items) {
    const { id, children } = item;
    const parentId = item.parentId ?? root.id;
    const parent = nodes[parentId] ?? findItem(items, parentId);

    nodes[id] = { id, children };
    parent.children.push(item);
  }

  return root.children;
}

export function findItem(items: TreeItem[], itemId: string) {
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
  for (let item of items) {
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

function countChildren(items: TreeItem[], count = 0): number {
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


const findFromTreeItem = (items: TreeItem[], id: UniqueIdentifier): FlattenedItem | undefined => {
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

  let list: any = [];
  enumObjs.map(enumObj => {
    list.push(enumToObjectArray(enumObj as Object));
  })
  let flatList: { name: string, value: string }[] = list.flat();
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
  function getEnumValueByKey(enumObj: T, key: string): any {
    return enumObj[key as keyof typeof enumObj];
  }
  const keys = getEnumKeys(enumObj as Object);
  return keys.includes(key as keyof Object) ? getEnumValueByKey(enumObj, key) : null;
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
export const cnvAndOrToJsOperator = (targetString: string) => {
  // 置換規則を定義
  const replacements = [
    { regex: /\s*または\s*/g, replacement: ' || ' },
    { regex: /\s*かつ\s*/g, replacement: ' && ' },
    // { regex: /でない/g, replacement: '!' }
  ];

  replacements.forEach(({ regex, replacement }) => {
    targetString = targetString.replace(regex, replacement);
  });

  return targetString;
}

//否定演算子をjavascriptのオペランドに変換
export const transformNegation = (targetString: string) => {
  return targetString.replace(/\(([^()]+)\)でない/g, '!($1)').replace(/([^()]+)でない/g, '!($1)');
}

// 「÷」記号を使った除算をMath.floorで包む式に変換 
export const cnvToDivision = (targetString: string) => {
  return targetString.replace(/(\w+)\s*÷\s*(\w+)/g, 'Math.floor($1 / $2)');
}
export const cnvToFunction = (targetString: string) => {

  targetString = squareString(targetString);
  targetString = exponentiateString(targetString);
  targetString = convertRandomString(targetString);

  return targetString;
}

// 文字列を二乗する形式に変換する関数
function squareString(input: string) {
  // "Square" で始まる部分を見つけて置換
  const result = input.replace(/Square\s*\(\s*(\d+)\s*\)/g, (match, num) => {
    const number = parseInt(num, 10);
    return `(${number} * ${number})`;
  });
  return result;
}

// "Random(m,n)" という文字列をJavaScriptの乱数生成コードに変換する関数
function convertRandomString(input: string): string {
  // 正規表現を使って "Random(m,n)" の部分を検出
  const result = input.replace(/Random\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/g, (match, m, n) => {
    const numM = parseInt(m, 10);
    const numN = parseInt(n, 10);
    if (numM > numN) {
      return '';  // mがnより大きい場合は空文字を返す
    }
    return `Math.floor(Math.random() * (${numN} - ${numM} + 1)) + ${numM}`;
  });
  return result;
}

// 文字列を指数形式に変換する関数
function exponentiateString(input: string) {
  // "Exponentiation" で始まる部分を見つけて置換
  const result = input.replace(/Exponentiation\s*\(\s*(\d+)\s*,\s*(\d+)\s*\)/g, (match, base, exponent) => {
    return `(${base}**${exponent})`;
  });
  return result;
}

export const checkBraketPair = (targetStringArray: string[]): { errorMsgArray: string[]; hasError: boolean; } => {

  let errorMsgArray: string[] = [];

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
  const regex = /^[a-zA-Z0-9 ぁ-んァ-ンｧ-ﾝﾞﾟ一-龠々 \.,!?<>=!&|\+\-\*/\(\)%!""\[\]]*$/;

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

export const isValidExpression = (targetString: string) => {

  try {
    new Function(`return ${targetString}`);
    return true;
  } catch (e) {
    return false;
  }
}

//表示文では「と」が入るので、Function関数が実行できない
//サニタイジング後に「と」は「&」に置換する
export const replaceToAmpersand = (targetString: string) => {
  return targetString.replace(/ と /g, ' & ')
};

const toEmptyIfNull = (targetString: string | undefined) => {
  if (!(targetString)) return "";
  //オブジェクト内のundefinedは文字列の'undefined'になっている
  if (targetString == 'undefined') return "";
  return targetString;
}

export const ValidateObjValue = (obj: { [k: string]: string; }, operandsMaxIndex: number, proceccType: processEnum, keyword: keyPrefixEnum): { errorMsgArray: string[]; hasError: boolean; } => {

  const regexForOperator = new RegExp(/^(\+|\-|\*|\/|÷|%|==|!=|>|>=|<|<=|かつ|または|と)$/);

  //オペランドの文字列のバリデーションパターン
  const regexForStringOperand = new RegExp(ValidationEnum.String);
  const regexForOperand = new RegExp(ValidationEnum.VariableOrNumber);
  const regexForParentheses = new RegExp(ValidationEnum.Parentheses);
  //添字はカンマ区切りも許容(実際はダメだが一括代入の処理があるため許容)
  const regexForSuffix = new RegExp(ValidationEnum.InitializeArray);
  const regexForSuffixWithBrackets = new RegExp(/^(?:(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)(?:,(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+))*)|(?:\([^\)]*\))|(?:\[[^\]]*\])$/);
  const regexForNegation = new RegExp(ValidationEnum.Negation);
  const regexForInteger = new RegExp(ValidationEnum.Integer);

  function isEnumValue(value: string): value is ReturnFunctionArrayForDncl {
    return Object.values(ReturnFunctionArrayForDncl).includes(value as ReturnFunctionArrayForDncl);
  }

  let errorMsgArray: string[] = [];

  for (let i = 0; i <= operandsMaxIndex; i++) {

    //演算子の確認
    if (i == 1) {
      if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Operator}`]) == "") {
        errorMsgArray.push(`${i}番目と${i + 1}番目のオペランドの間に演算子が必要です`);
      } else {
        if (!regexForOperator.test(obj[`${keyword}_${i}_${keyPrefixEnum.Operator}`])) {
          console.log(obj[`${keyword}_${i}_${keyPrefixEnum.Operator}`])
          errorMsgArray.push(`${i}番目と${i + 1}番目のオペランドの間に不適切な演算子が使用されています`);
        }
      }
    }

    if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Type}`]) != "") {

      switch (obj[`${keyword}_${i}_${keyPrefixEnum.Type}`]) {
        case SwitchEnum.String:
          if (operandsMaxIndex > 0) {
            if (proceccType != processEnum.Output) {
              errorMsgArray.push(`文字列が含まれる場合，演算子が使用できません`);
            }
          }
          if (!regexForStringOperand.test(obj[`${keyword}_${i}`])) {
            errorMsgArray.push(`${i + 1}番目のオペランドに不適切な値が使用されています`);
          }

          break;
        case SwitchEnum.ReturnFunction:

          //関数名
          if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.FunctionName}`]) != "") {
            if (!regexForOperand.test(obj[`${keyword}_${i}_${keyPrefixEnum.FunctionName}`])) {
              errorMsgArray.push(`${i + 1}番目のオペランドに，不適切な関数名が使用されています`);
            }
          }
          if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Function}`]) != "") {
            if (!isEnumValue(obj[`${keyword}_${i}_${keyPrefixEnum.Function}`])) {
              errorMsgArray.push(`${i + 1}番目のオペランドの関数に，用意された関数以外が使用されています`);
            }
          }
          //引数
          for (let j = 0; j < 2; j++) {
            if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Argument}_${j}`]) != "") {
              if (!regexForOperand.test(obj[`${keyword}_${i}_${keyPrefixEnum.FunctionName}_${j}`])) {
                errorMsgArray.push(`${i + 1}番目のオペランドの関数に，不適切な引数が使用されています`);
              }
            }
          }

          break;
        default:
          errorMsgArray.push(`${i + 1}番目のオペランドで異常値が検知されました`);
          break;
      }
    } else {
      if (toEmptyIfNull(obj[`${keyword}_${i}`]) == "") {
        errorMsgArray.push(`${i + 1}番目のオペランドが入力されていません`);
      } else {
        if (!regexForOperand.test(obj[`${keyword}_${i}`])) {
          errorMsgArray.push(`${i + 1}番目のオペランドに不適切な値が使用されています`);
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
      }
    }
    if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Negation}`]) != "") {
      if (!regexForNegation.test(obj[`${keyword}_${i}_${keyPrefixEnum.Negation}`])) {
        errorMsgArray.push(`${i + 1}番目のオペランドの右側の否定演算子に，「でない」以外の文字が使用されています`);
      }
    }
    //For文の初期値
    if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.InitialValue}`]) != "") {
      if (!regexForInteger.test(obj[`${keyword}_${i}_${keyPrefixEnum.InitialValue}`])) {
        errorMsgArray.push(`${i + 1}番目のオペランドの右側の否定演算子に，「でない」以外の文字が使用されています`);
      }
    }
    //For文の終了値
    if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.EndValue}`]) != "") {
      if (!regexForInteger.test(obj[`${keyword}_${i}_${keyPrefixEnum.EndValue}`])) {
        errorMsgArray.push(`${i + 1}番目のオペランドの右側の否定演算子に，「でない」以外の文字が使用されています`);
      }
    }
    //For文の増減差分
    if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Difference}`]) != "") {
      if (!regexForInteger.test(obj[`${keyword}_${i}_${keyPrefixEnum.Difference}`])) {
        errorMsgArray.push(`${i + 1}番目のオペランドの右側の否定演算子に，「でない」以外の文字が使用されています`);
      }
    }

  }
  if (errorMsgArray.length > 0) {
    return { errorMsgArray: errorMsgArray, hasError: true };
  }
  return { errorMsgArray: [], hasError: false };
}


export const cnvObjToArray = (obj: { [k: string]: string; }, operandsMaxIndex: number, keyword: keyPrefixEnum): string[] => {

  const pushIfNotEmpty = (array: string[], pushedString: string) => {
    if (pushedString == "") return;
    array.push(pushedString);
  }

  let strArray: string[] = [];

  console.log(obj)
  for (let i = 0; i <= operandsMaxIndex; i++) {

    pushIfNotEmpty(strArray, toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Operator}`]));
    pushIfNotEmpty(strArray, toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.LeftOfOperand}`]));

    if (toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Type}`]) != "") {
      switch (obj[`${keyword}_${i}_${keyPrefixEnum.Type}`]) {
        case SwitchEnum.String:
          pushIfNotEmpty(strArray, `"${toEmptyIfNull(obj[`${keyword}_${i}`])}"`);
          break;
        case SwitchEnum.ReturnFunction:
          pushIfNotEmpty(strArray, toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.FunctionName}`]));
          pushIfNotEmpty(strArray, toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Function}`]));
          //引数
          let tmpArguments: string[] = [];
          for (let j = 0; j < 2; j++) {
            pushIfNotEmpty(tmpArguments, toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Argument}_${j}`]));
          }
          const joinedStr = tmpArguments.join(",");
          pushIfNotEmpty(strArray, `(${joinedStr})`);
          break;
        default:
          break;
      }
    } else {
      pushIfNotEmpty(strArray, toEmptyIfNull(obj[`${keyword}_${i}`]));
    }

    pushIfNotEmpty(strArray, toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Suffix}`]));
    pushIfNotEmpty(strArray, toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.RightOfOperand}`]));
    pushIfNotEmpty(strArray, toEmptyIfNull(obj[`${keyword}_${i}_${keyPrefixEnum.Negation}`]));
  }

  return strArray;
}
