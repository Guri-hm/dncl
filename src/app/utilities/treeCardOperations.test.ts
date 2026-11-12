import { deserialize, serialize } from 'node:v8';
import type { FragmentItems, TreeItem } from '@/app/types';
import { StatementEnum } from '@/app/enum';
import { duplicateTreeCard, getCardLimitError } from './treeCardOperations';

beforeAll(() => {
  global.structuredClone = value => deserialize(serialize(value));
});

const card: TreeItem = {
  id: 'parent', line: 'repeat', children: [{
    id: 'child', line: 'output', children: [], statementType: StatementEnum.Output,
    formData: { text: 'hello' }, uiState: { radioSelections: { type: 'String' } },
  }],
};
const limits: FragmentItems = [{
  id: 'output', line: '表示', statementType: StatementEnum.Output, children: [],
  parentId: null, depth: 0, index: 0, maxUsage: 1,
}];

it('duplicates the entire subtree next to its source with independent IDs and form values', () => {
  const result = duplicateTreeCard([card], card.id, []);
  expect(result).toHaveLength(2);
  expect(result[0]).toBe(card);
  expect(result[1].id).not.toBe(card.id);
  expect(result[1].children[0].id).not.toBe(card.children[0].id);
  expect(result[1].children[0].formData).toEqual(card.children[0].formData);
  result[1].children[0].formData!.text = 'changed';
  expect(card.children[0].formData!.text).toBe('hello');
});

it('counts collapsed children and rejects copies that would exceed their limits', () => {
  expect(getCardLimitError([{ ...card, collapsed: true }], limits)).toBeUndefined();
  expect(() => duplicateTreeCard([{ ...card, collapsed: true }], card.id, limits)).toThrow('1枚まで');
  expect(getCardLimitError([card, card], limits)).toContain('1枚まで');
});

it('does not clone a fixed card or a parent containing one', () => {
  expect(() => duplicateTreeCard([{ ...card, fixed: true }], card.id, [])).toThrow('固定');
  expect(() => duplicateTreeCard([{ ...card, children: [{ ...card.children[0], fixed: true }] }], card.id, [])).toThrow('固定');
});
