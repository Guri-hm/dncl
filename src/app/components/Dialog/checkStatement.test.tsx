import { ValidateObjValue } from '@/app/utilities/utilities';
import { inputTypeEnum, keyPrefixEnum } from './Enum/enum';
import { ProcessEnum } from '@/app/enum';

describe('checkStatement分岐網羅テスト', () => {
    const mockTreeItems: any[] = [];

    test('Variable型の左辺とNumber型の右辺で正常判定', () => {
        const obj = {
            'LeftSide_0': 'x',
            'LeftSide_0_Type': inputTypeEnum.Variable,
            'RigthSide_0': '123',
            'RigthSide_0_Type': inputTypeEnum.Number,
        };
        const result = ValidateObjValue(obj, 0, ProcessEnum.SetValToVariableOrArray, keyPrefixEnum.LeftSide, mockTreeItems);
        expect(result.hasError).toBe(false);
    });

    test('Variable型の左辺に不正な値でエラー判定', () => {
        const obj = {
            'LeftSide_0': '1x',
            'LeftSide_0_Type': inputTypeEnum.Variable,
        };
        const result = ValidateObjValue(obj, 0, ProcessEnum.SetValToVariableOrArray, keyPrefixEnum.LeftSide, mockTreeItems);
        expect(result.hasError).toBe(true);
        expect(result.errorMsgArray[0]).toMatch(/不適切な文字/);
    });

    // inputTypeEnumごとの分岐を網羅的に追加
});