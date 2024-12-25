import type { RefObject } from 'react';

export interface TreeItem {
  id: string;
  code: string;
  children: TreeItem[];
  collapsed?: boolean;
}

export type TreeItems = TreeItem[];

//?付与でオプション扱い(デフォルトはundefined)
export interface FlattenedItem extends TreeItem {
  parentId: null | string;
  depth?: number;
  index: number;
}

export type SensorContext = RefObject<{
  items: FlattenedItem[];
  offset: number;
}>;

export enum Validation {
  Variable = '^[a-zA-Z_$][a-zA-Z0-9_$]*$', //変数名のルール
  VariableNumber = '^(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)$',//変数名および数値
  InitializeArray = '^(?:(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)(?:,(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+))*)$',//配列内のカンマ区切りの文字列
  Array = '^[a-zA-Z_$][a-zA-Z0-9_$]*$',//配列名のルール
}

export enum Statement {
  Input = 'input',
  Condition = 'condition'
}

export enum OperatorEnum {
  SimpleAssignment = '単純代入',
}


//ツリーに追加する要素の型
export interface FragmentItem extends FlattenedItem {
  statementType: Statement;
}

export type FragmentItems = FragmentItem[];
