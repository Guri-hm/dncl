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

export enum Statement {
  Input = 'input',
  Operation = 'operation',
  Condition = 'condition',
}

//ツリーに追加する要素の型
export interface FragmentItem extends FlattenedItem {
  statementType: Statement;
}

export type FragmentItems = FragmentItem[];

export type DnclEditor = {
  item?: FlattenedItem,
  open: boolean,
  onSubmit: any,
  type: Statement,
  overIndex: number,
}
