import { getValidationPattern, getArraySuffixValidation, validateForValue } from '@/app/utilities/validation-utils';
import { ValidationEnum, inputTypeEnum } from '@/app/components/Dialog/Enum/enum';

describe('validation-utils テスト', () => {
    test('getValidationPattern - SwitchVariableOrNumberOrArray', () => {
        expect(getValidationPattern(inputTypeEnum.SwitchVariableOrNumberOrArray, {
            threeWayValue: inputTypeEnum.Variable
        })).toBe(ValidationEnum.Variable);

        expect(getValidationPattern(inputTypeEnum.SwitchVariableOrNumberOrArray, {
            threeWayValue: inputTypeEnum.Number
        })).toBe(ValidationEnum.Number);
    });

    test('getArraySuffixValidation', () => {
        expect(getArraySuffixValidation()).toBe(ValidationEnum.VariableOrPositiveInteger);
    });

    test('validateForValue', () => {
        expect(validateForValue('123')).toBe(true);   // 数値
        expect(validateForValue('variable1')).toBe(true); // 変数
        expect(validateForValue('1invalid')).toBe(false); // 無効
    });

    test('getValidationPattern - SwitchVariableOrArrayWithConstant', () => {
        expect(getValidationPattern(inputTypeEnum.SwitchVariableOrArrayWithConstant, {
            isConstant: true
        })).toBe(ValidationEnum.Constant);

        expect(getValidationPattern(inputTypeEnum.SwitchVariableOrArrayWithConstant, {
            isConstant: false
        })).toBe(ValidationEnum.Variable);
    });

    test('getValidationPattern - ForValue', () => {
        expect(getValidationPattern(inputTypeEnum.ForValue, {
            forValueType: inputTypeEnum.Variable
        })).toBe(ValidationEnum.Variable);

        expect(getValidationPattern(inputTypeEnum.ForValue, {
            forValueType: inputTypeEnum.Number
        })).toBe(ValidationEnum.Number);
    });

    test('getValidationPattern - All type', () => {
        expect(getValidationPattern(inputTypeEnum.All, {
            radioValue: inputTypeEnum.Variable
        })).toBe(ValidationEnum.Variable);

        expect(getValidationPattern(inputTypeEnum.All, {
            radioValue: inputTypeEnum.Number
        })).toBe(ValidationEnum.Number);

        expect(getValidationPattern(inputTypeEnum.All, {
            radioValue: inputTypeEnum.String
        })).toBe(ValidationEnum.String);
    });
});