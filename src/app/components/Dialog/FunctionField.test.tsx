import { render } from '@testing-library/react';
import { inputTypeEnum } from './Enum';
import { DnclTextField } from './DnclTextField';
import { ReturnFuncDncl } from '@/app/enum';
import { FunctionField } from './FunctionField';

describe('FunctionField', () => {
  it('allows an empty argument list when defining a function', () => {
    const { container } = render(
      <FunctionField
        name="RightSide"
        parentIndex={0}
        funcType={inputTypeEnum.UserDefinedfunction}
        treeItems={[]}
      />
    );

    expect(container.querySelector('input[name="RightSide_0_Argument_0"]')).not.toBeRequired();
  });

  it('restores a function name and its declared parameters when editing', () => {
    const { container } = render(
      <FunctionField
        name="RigthSide"
        parentIndex={0}
        funcType={inputTypeEnum.UserDefinedfunction}
        treeItems={[]}
        restoreValues={{
          RigthSide_0_FunctionName: 'double',
          RigthSide_0_Argument_0: 'n',
        }}
      />
    );

    expect(container.querySelector<HTMLInputElement>('input[name="RigthSide_0_FunctionName"]')?.value).toBe('double');
    expect(container.querySelector<HTMLInputElement>('input[name="RigthSide_0_Argument_0"]')?.value).toBe('n');
  });

  it('restores a built-in function and both arguments through the parent field', () => {
    const { container } = render(<DnclTextField
      name="RigthSide" inputType={inputTypeEnum.All} treeItems={[]}
      initialRestoreValues={{
        RigthSide_0_Type: inputTypeEnum.ReturnFunction,
        RigthSide_0_Function: ReturnFuncDncl.Exponentiation,
        RigthSide_0_Argument: '2',
        RigthSide_0_Argument_0: '3',
        RigthSide_0_Argument_1: '4',
      }}
    />);
    expect(container.querySelector<HTMLInputElement>('input[name="RigthSide_0_Function"]')?.value).toBe(ReturnFuncDncl.Exponentiation);
    expect(container.querySelector<HTMLInputElement>('input[name="RigthSide_0_Argument_0"]')?.value).toBe('3');
    expect(container.querySelector<HTMLInputElement>('input[name="RigthSide_0_Argument_1"]')?.value).toBe('4');
  });
});
