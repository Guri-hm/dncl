import { v4 as uuidv4 } from 'uuid';
import type { FragmentItems, TreeItem, TreeItems } from '@/app/types';

export function allTreeCards(items: TreeItems): TreeItems {
  return items.flatMap(item => [item, ...allTreeCards(item.children)]);
}

export function cardUsageKey(item: TreeItem): string {
  return item.gameCard ? `game:${item.gameCard.kind}` : `statement:${item.statementType}`;
}

export function getCardLimitError(items: TreeItems, fragments: FragmentItems): string | undefined {
  const cards = allTreeCards(items);
  for (const fragment of fragments) {
    if (fragment.maxUsage === undefined) continue;
    const count = cards.filter(item => cardUsageKey(item) === cardUsageKey(fragment)).length;
    if (count > fragment.maxUsage) {
      return `「${fragment.line}」のカードは${fragment.maxUsage}枚までです。`;
    }
  }
}

export function duplicateTreeCard(items: TreeItems, id: string, fragments: FragmentItems): TreeItems {
  const target = allTreeCards(items).find(item => item.id === id);
  if (!target || allTreeCards([target]).some(item => item.fixed)) {
    throw new Error('固定されたカードは複製できません。');
  }
  const clone = (item: TreeItem): TreeItem => ({
    ...structuredClone(item),
    id: uuidv4(),
    children: item.children.map(clone),
  });
  const copy = clone(target);
  const insert = (nodes: TreeItems): TreeItems => nodes.flatMap(item =>
    item.id === id ? [item, copy] : [{ ...item, children: insert(item.children) }]
  );
  const result = insert(items);
  const error = getCardLimitError(result, fragments);
  if (error) throw new Error(error);
  return result;
}
