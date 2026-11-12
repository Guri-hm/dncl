import { render } from '@testing-library/react';
import { inputTypeEnum } from './Enum';
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
});
