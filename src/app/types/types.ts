import type { RefObject } from 'react';
import { StatementEnum } from "@/app/enum";

export interface TreeItem {
  id: string;
  line: string;
  lineTokens?: string[];
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
  onSubmit: any,
  type: StatementEnum,
  overIndex: number,
  refresh?: any,
}
