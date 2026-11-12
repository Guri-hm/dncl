import { fireEvent, render, screen } from '@testing-library/react';
import { TreeItems } from '@/app/types';
import { SampleCodeMenu } from './SampleCodeMenu';

describe('SampleCodeMenu', () => {
  it('sets the selected sample when the editor is empty', () => {
    const onSelect = jest.fn();
    render(<SampleCodeMenu treeItems={[]} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'サンプルコード' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /変数を使った順次処理/ }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toHaveLength(3);
  });

  it('asks before replacing an existing program', () => {
    const onSelect = jest.fn();
    const currentItems: TreeItems = [{
      id: 'existing',
      line: '既存のプログラム',
      children: [],
    }];
    render(<SampleCodeMenu treeItems={currentItems} onSelect={onSelect} />);

    fireEvent.click(screen.getByRole('button', { name: 'サンプルコード' }));
    fireEvent.click(screen.getByRole('menuitem', { name: /条件分岐/ }));

    expect(onSelect).not.toHaveBeenCalled();
    expect(screen.getByText(/未保存の編集内容は失われます/)).toBeInTheDocument();

    fireEvent.click(screen.getByRole('button', { name: '置き換える' }));
    expect(onSelect).toHaveBeenCalledTimes(1);
  });
});
