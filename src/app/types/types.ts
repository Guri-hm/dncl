import type { RefObject } from 'react';
import { StatementEnum, StatementJpEnum } from "@/app/enum";
import { UniqueIdentifier } from '@dnd-kit/core';
import { Dispatch, SetStateAction } from 'react';

export interface TreeItem {
  id: string;
  line: string;//DNCL表記の文
  lineTokens?: string[];//文の要素(語句単位)
  variables?: string[]; //文で使用されている変数名
  array?: string[]; //文で使用されている配列名
  isConstant?: boolean;
  children: TreeItem[];
  collapsed?: boolean;
  statementType?: StatementEnum;
  processIndex?: number;
  fixed?: boolean;
  formData?: { [key: string]: string };
  uiState?: {  // ← 新しく追加
    radioSelections?: { [key: string]: string };
    switchStates?: { [key: string]: boolean };
    toggleStates?: { [key: string]: string };
  };
}

export type TreeItems = TreeItem[];

export interface NewItemParams {
  newItem: FlattenedItem;
  overIndex: UniqueIdentifier;
}

export interface EditItemParams {
  editedItem: FlattenedItem;
  itemId: UniqueIdentifier;
}

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
  // 最大利用回数（未設定 = undefined → 無制限）
  maxUsage?: number;
  remainingUsage?: number;
  disabled?: boolean;
}

export type FragmentItems = FragmentItem[];

export interface DnclEditorProps {
  addItem?: ((params: NewItemParams) => void) | null;
  editItem?: ((params: EditItemParams) => void) | null; // 編集用のコールバックを追加
  open: boolean;
  overIndex: UniqueIdentifier;
  treeItems: TreeItems;
  item?: FlattenedItem;
  setEditor?: React.Dispatch<React.SetStateAction<DnclEditorProps>>;
  type?: StatementEnum;
  setItems?: (items: TreeItems) => void;
  refresh?: () => void;
  isEdit?: boolean;
}

export type ErrObj = {
  hasError: boolean,
  errors: string[]
}

export interface DnclValidationType extends ErrObj {
  lineNum: number[];
  color?: string;
}

export interface TabItem {
  id: UniqueIdentifier;
  label: string;
  component: React.ReactNode
}
export interface TabGroup {
  visible: boolean;
  items: TabItem[];
}
export interface TabItemsObj {
  [key: UniqueIdentifier]: TabGroup;
}

type MatchType = 'assignment' | 'lineExact' | 'lineRegex' | 'processIndex' | 'containsTokens' | 'behavior';

export interface RequiredItem {
  id?: string;
  matchType?: MatchType;
  // assignment 用
  lhs?: string;
  rhs?: string;
  // 正規表現マッチ用
  lineRegex?: string;
  // トークン包含チェック
  tokens?: string[];
  // processIndex マッチ
  processIndex?: number;
  // 振る舞いベース（例: expected console output）
  expectedOutput?: string[];
  variables?: string[];
}

export type Difficulty = 'basic' | 'advanced' | 'other';

export interface Challenge {
  title: string;
  items: TreeItems;
  task: string;
  hint: string;
  answer: string[];
  id: string;
  difficulty?: Difficulty;
  requiredItems?: RequiredItem[]
  prohibitedItems?: RequiredItem[];
  usableItems?: StatementJpEnum[]
  // 例: { "Input": 3, "Output": 1 } など（キーは StatementJpEnum の文字列）
  usableItemLimits?: Partial<Record<StatementJpEnum, number>>;
}

export interface ASTNode {
  type: string;
  id?: { name: string };
  init?: { declarations: { id: { name: string }, init: { value: string } }[] };
  test?: { left: { name: string }, operator: string, right: { value: string } };
  update?: { argument: { name: string } };
  discriminant?: { name: string };
  cases?: { test?: { value: string }, consequent: ASTNode[] }[];
  body?: ASTNode[] | { body: ASTNode[] };
  expression?: { callee: { object: { name: string }, property: { name: string } }, arguments: { value: string }[] };
  consequent?: { body: ASTNode[] };
  alternate?: { body: ASTNode[] };
}

