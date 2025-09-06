import { ValidationEnum, inputTypeEnum } from '@/app/components/Dialog/Enum/enum';

// DnclTextFieldのswitch文を関数化（リファクタリング用）
export const getValidationPattern = (inputType: inputTypeEnum, options?: {
    isConstant?: boolean;
    forValueType?: inputTypeEnum;
    threeWayValue?: inputTypeEnum;
    radioValue?: inputTypeEnum;
}): ValidationEnum => {

    const { isConstant, forValueType, threeWayValue, radioValue } = options || {};

    switch (inputType) {
        case inputTypeEnum.SwitchVariableOrArrayWithConstant:
            return isConstant ? ValidationEnum.Constant : ValidationEnum.Variable;

        case inputTypeEnum.SwitchVariableOrNumberOrArray:
            switch (threeWayValue) {
                case inputTypeEnum.Variable:
                    return ValidationEnum.Variable;
                case inputTypeEnum.Number:
                    return ValidationEnum.Number;
                case inputTypeEnum.Array:
                    return ValidationEnum.Variable;
                default:
                    return ValidationEnum.Variable;
            }

        case inputTypeEnum.ForValue:
            switch (forValueType) {
                case inputTypeEnum.Variable:
                    return ValidationEnum.Variable;
                case inputTypeEnum.Number:
                    return ValidationEnum.Number;
                default:
                    return ValidationEnum.Number;
            }

        case inputTypeEnum.All:
            switch (radioValue) {
                case inputTypeEnum.Variable:
                    return ValidationEnum.Variable;
                case inputTypeEnum.Number:
                    return ValidationEnum.Number;
                case inputTypeEnum.Array:
                    return ValidationEnum.Variable;
                case inputTypeEnum.String:
                    return ValidationEnum.String;
                case inputTypeEnum.ReturnFunction:
                case inputTypeEnum.Void:
                    return ValidationEnum.InitializeArray;
                default:
                    return ValidationEnum.Variable;
            }

        case inputTypeEnum.Variable:
        case inputTypeEnum.VariableOnly:
        case inputTypeEnum.ArrayWithoutSuffix:
        case inputTypeEnum.Array:
            return ValidationEnum.Variable;

        case inputTypeEnum.Number:
            return ValidationEnum.Number;

        case inputTypeEnum.String:
            return ValidationEnum.String;

        case inputTypeEnum.InitializeArray:
            return ValidationEnum.InitializeArray;

        default:
            return ValidationEnum.Variable;
    }
};

// 配列添字専用のバリデーションパターン
export const getArraySuffixValidation = (): ValidationEnum => {
    return ValidationEnum.VariableOrPositiveInteger;
};

// For文専用のバリデーション（既存のcheckForLoopInfiniteを補完）
export const validateForValue = (value: string): boolean => {
    const numberRegex = new RegExp(ValidationEnum.Number);
    const variableRegex = new RegExp(ValidationEnum.Variable);
    return numberRegex.test(value) || variableRegex.test(value);
};