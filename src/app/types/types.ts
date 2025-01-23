import type { RefObject } from 'react';
import { StatementEnum } from "@/app/enum";
import { UniqueIdentifier } from '@dnd-kit/core';

export interface TreeItem {
  id: string;
  line: string;//DNCL表記の文
  lineTokens?: string[];//文の要素(語句単位)
  variables?: string[]; //文で使用されている変数
  children: TreeItem[];
  collapsed?: boolean;
  processIndex?: number;
}

export type TreeItems = TreeItem[];

//?付与でオプション扱い(デフォルトはundefined)
export interface FlattenedItem extends TreeItem {
  parentId: null | string;
  depth: number;
  index: number;
}

export type SensorContext = RefObject<{
  items: FlattenedItem[];
  offset: number;
}>;

//ツリーに追加する要素の型
export interface FragmentItem extends FlattenedItem {
  statementType: StatementEnum;
}

export type FragmentItems = FragmentItem[];

export type DnclEditorProps = {
  item?: FlattenedItem,
  treeItems: TreeItems,
  setItems: any,
  setEditor?: any,
  open: boolean,
  addItem: any,
  type?: StatementEnum,
  overIndex: number,
  refresh?: any,
}

export type ErrObj = {
  hasError: boolean,
  errors: string[]
}

export interface DnclValidationType extends ErrObj {
  guid: number, //変更なしでもuseEffectを動かすため
  lineNum: number[]
}

export interface TabItem {
  id: UniqueIdentifier;
  label: string;
  component: React.ReactNode
}
export interface TabItemsObj {
  [key: UniqueIdentifier]: TabItem[];
}