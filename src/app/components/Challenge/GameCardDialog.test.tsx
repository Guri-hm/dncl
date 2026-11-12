import { fireEvent, render, screen } from '@testing-library/react';
import type { DnclEditorProps } from '@/app/types';
import { GameCardDialog } from './GameCardDialog';
import type { GameCard } from './gameCards';

function propsFor(gameCard: GameCard): DnclEditorProps {
  return {
    open: true, isEdit: true, overIndex: 'card', treeItems: [],
    item: { id: 'card', line: '', children: [], parentId: null, depth: 0, index: 0, gameCard },
    editItem: jest.fn(), setEditor: jest.fn(),
  };
}

it('restores a direction and updates it using only the listed choices', () => {
  const props = propsFor({ kind: 'turn', direction: '下' });
  render(<GameCardDialog {...props} />);
  expect(screen.getByRole('combobox')).toHaveTextContent('下');
  fireEvent.mouseDown(screen.getByRole('combobox'));
  fireEvent.click(screen.getByRole('option', { name: '上' }));
  fireEvent.click(screen.getByRole('button', { name: '更新' }));
  expect(props.editItem).toHaveBeenCalledWith(expect.objectContaining({
    editedItem: expect.objectContaining({ gameCard: { kind: 'turn', direction: '上' }, line: '上を向く' }),
  }));
});

it('restores a repetition count and offers only 1 through 30', () => {
  const props = propsFor({ kind: 'repeat', count: 5 });
  render(<GameCardDialog {...props} />);
  expect(screen.getByRole('combobox')).toHaveTextContent('5回');
  fireEvent.mouseDown(screen.getByRole('combobox'));
  expect(screen.getAllByRole('option')).toHaveLength(30);
  fireEvent.click(screen.getByRole('option', { name: '2回' }));
  fireEvent.click(screen.getByRole('button', { name: '更新' }));
  expect(props.editItem).toHaveBeenCalledWith(expect.objectContaining({
    editedItem: expect.objectContaining({ gameCard: { kind: 'repeat', count: 2 } }),
  }));
});

it('restores and switches a wall condition without free-text or numeric fields', () => {
  const props = propsFor({ kind: 'while', wall: false });
  render(<GameCardDialog {...props} />);
  expect(screen.getByRole('combobox')).toHaveTextContent('壁がない');
  fireEvent.mouseDown(screen.getByRole('combobox'));
  fireEvent.click(screen.getByRole('option', { name: '壁がある' }));
  fireEvent.click(screen.getByRole('button', { name: '更新' }));
  expect(props.editItem).toHaveBeenCalledWith(expect.objectContaining({
    editedItem: expect.objectContaining({ gameCard: { kind: 'while', wall: true } }),
  }));
});
