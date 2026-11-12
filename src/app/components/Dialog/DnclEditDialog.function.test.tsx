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

  it('restores a saved definition through the full editor and saves its changes', () => {
    const editItem = jest.fn();
    render(<DnclEditDialog
      open isEdit type={StatementEnum.UserDefinedfunction}
      overIndex="definition" treeItems={[]} editItem={editItem}
      item={{
        id: 'definition', line: '関数 double(n) を', children: [], parentId: null, depth: 0, index: 0,
        processIndex: ProcessEnum.DefineFunction,
        formData: {
          processIndex: String(ProcessEnum.DefineFunction),
          RigthSide_0_FunctionName: 'double',
          RigthSide_0_Argument_0: 'n',
          RigthSide_0_Argument: '1',
        },
      }}
    />);
    const name = document.querySelector<HTMLInputElement>('input[name="RigthSide_0_FunctionName"]')!;
    expect(name.value).toBe('double');
    expect(document.querySelector<HTMLInputElement>('input[name="RigthSide_0_Argument_0"]')!.value).toBe('n');
    fireEvent.change(name, { target: { value: 'triple' } });
    fireEvent.click(screen.getByRole('button', { name: '更新' }));
    expect(editItem).toHaveBeenCalledTimes(1);
    expect(editItem.mock.calls[0][0].editedItem.line).toBe('関数 triple(n) を');
  });

  it('restores a call to the second defined function rather than selecting the first', () => {
    const secondFunction = {
      ...emptyArgumentFunction[0], id: 'second', lineTokens: ['second()'], line: '関数 second() を',
    };
    const editItem = jest.fn();
    render(<DnclEditDialog
      open isEdit type={StatementEnum.ExecuteUserDefinedFunction}
      overIndex="call" treeItems={[...emptyArgumentFunction, secondFunction]} editItem={editItem}
      item={{
        id: 'call', line: 'second()', children: [], parentId: null, depth: 0, index: 0,
        processIndex: ProcessEnum.ExecuteUserDefinedFunction,
        formData: {
          processIndex: String(ProcessEnum.ExecuteUserDefinedFunction),
          RigthSide_0_FunctionName: 'second',
          RigthSide_0_Argument: '0',
        },
      }}
    />);
    expect(document.querySelector<HTMLInputElement>('input[name="RigthSide_0_FunctionName"]')!.value).toBe('second');
    fireEvent.click(screen.getByRole('button', { name: '更新' }));
    expect(editItem.mock.calls[0][0].editedItem.line).toBe('second()');
  });
});
