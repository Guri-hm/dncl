import { fireEvent, render, screen } from '@testing-library/react';
import { DnclEditorProps, TreeItems } from '@/app/types';
import { ProcessEnum, StatementEnum } from '@/app/enum';
import { DnclEditDialog } from './DnclEditDialog';

describe('DnclEditDialog function definition', () => {
  const emptyArgumentFunction: TreeItems = [
    {
      id: 'existing-function',
      line: '関数 noArgs() を',
      lineTokens: ['noArgs()'],
      processIndex: ProcessEnum.DefineFunction,
      children: [],
    },
    {
      id: 'existing-function-end',
      line: 'と定義する',
      lineTokens: [],
      processIndex: ProcessEnum.Defined,
      children: [],
    },
  ];

  it('saves a function definition with no arguments', () => {
    const addItem = jest.fn();
    const props: DnclEditorProps = {
      open: true,
      type: StatementEnum.UserDefinedfunction,
      treeItems: [],
      item: {
        id: 'new-function',
        line: '',
        children: [],
        parentId: null,
        depth: 0,
        index: 0,
      },
      overIndex: 'new-function',
      addItem,
    };
    render(<DnclEditDialog {...props} />);

    fireEvent.change(document.querySelector('input[name="RigthSide_0_FunctionName"]')!, {
      target: { value: 'noArgs' },
    });
    fireEvent.click(screen.getByRole('button', { name: '決定' }));

    expect(addItem).toHaveBeenCalledTimes(1);
    expect(addItem.mock.calls[0][0].newItem.processIndex).toBe(ProcessEnum.DefineFunction);
    expect(addItem.mock.calls[0][0].newItem.line).toBe('関数 noArgs() を');
  });

  it('saves a call to a function with no arguments', () => {
    const addItem = jest.fn();
    const props: DnclEditorProps = {
      open: true,
      type: StatementEnum.ExecuteUserDefinedFunction,
      treeItems: emptyArgumentFunction,
      item: {
        id: 'new-call',
        line: '',
        children: [],
        parentId: null,
        depth: 0,
        index: 0,
      },
      overIndex: 'new-call',
      addItem,
    };
    render(<DnclEditDialog {...props} />);

    fireEvent.click(screen.getByRole('button', { name: '決定' }));

    expect(addItem).toHaveBeenCalledTimes(1);
    expect(addItem.mock.calls[0][0].newItem.line).toBe('noArgs()');
  });
});
