import { arrayMove } from '@dnd-kit/sortable';
import { UniqueIdentifier } from "@dnd-kit/core";

import type { FlattenedItem, TreeItem, TreeItems } from '../types';

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

export const hasEmptyParentheses = (str: string) => {
  const regex = /\(\s*\)/;
  return regex.test(str);
}
export function checkParenthesesBalance(strArray: string[]): { isBalanced: boolean, isCorrectOrder: boolean, balance: number, hasEmptyParentheses: boolean } {
  let balance = 0;
  let isCorrectOrder = true;
  let hasEmptyParentheses = false;

  const regex = /\(\s*\)/;
  for (let i = 0; i < strArray.length; i++) {
    if (regex.test(strArray[i])) {
      hasEmptyParentheses = true;
    }
  }

  const input = strArray.join('');
  for (let i = 0; i < input.length; i++) {
    const char = input[i];
    if (char === '(') {
      if (input[i + 1] === ')') {
        hasEmptyParentheses = true;
      }
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