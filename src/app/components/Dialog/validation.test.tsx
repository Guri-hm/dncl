describe('入力値検証テスト', () => {

    // ValidationEnumをモック
    const ValidationEnum = {
        Variable: '^[a-zA-Z][a-zA-Z0-9_]*$',
        Number: '^-?\\d+(\\.\\d+)?$',
        VariableOrPositiveInteger: '^(?:[a-zA-Z][a-zA-Z0-9_]*|\\d+)$'
    };

    describe('ValidationEnum.Variable テスト', () => {
        test('有効な変数名', () => {
            const validVariables = ['x', 'variable1', 'myVar', 'test_var', 'A1'];
            validVariables.forEach(variable => {
                const regex = new RegExp(ValidationEnum.Variable);
                expect(regex.test(variable)).toBe(true);
            });
        });

        test('無効な変数名', () => {
            const invalidVariables = ['1abc', '_test', '$test', '123', 'var-name', 'var.name'];
            invalidVariables.forEach(variable => {
                const regex = new RegExp(ValidationEnum.Variable);
                expect(regex.test(variable)).toBe(false);
            });
        });
    });

    describe('ValidationEnum.Number テスト', () => {
        test('有効な数値', () => {
            const validNumbers = ['123', '-456', '3.14', '-2.5', '0', '0.1'];
            validNumbers.forEach(number => {
                const regex = new RegExp(ValidationEnum.Number);
                expect(regex.test(number)).toBe(true);
            });
        });

        test('無効な数値', () => {
            const invalidNumbers = ['abc', '12.34.56', '-2-3', '1.', '.5', '12-34', 'NaN'];
            invalidNumbers.forEach(number => {
                const regex = new RegExp(ValidationEnum.Number);
                expect(regex.test(number)).toBe(false);
            });
        });
    });

    describe('ValidationEnum.VariableOrPositiveInteger テスト', () => {
        test('有効な値（変数名または正の整数）', () => {
            const validValues = ['x', 'test123', '0', '123', '999'];
            validValues.forEach(value => {
                const regex = new RegExp(ValidationEnum.VariableOrPositiveInteger);
                expect(regex.test(value)).toBe(true);
            });
        });

        test('無効な値（負の数や小数）', () => {
            const invalidValues = ['-1', '-123', '3.14', '-2.5'];
            invalidValues.forEach(value => {
                const regex = new RegExp(ValidationEnum.VariableOrPositiveInteger);
                expect(regex.test(value)).toBe(false);
            });
        });
    });
});

describe('For文無限ループ検証', () => {
    // checkForLoopInfiniteのモック実装
    const checkForLoopInfinite = (
        initialValue: string,
        endValue: string,
        difference: string,
        isIncrement: boolean
    ) => {
        const errorMsgArray: string[] = [];

        const variableRegex = /^[a-zA-Z][a-zA-Z0-9_]*$/;
        if (variableRegex.test(initialValue) || variableRegex.test(endValue) || variableRegex.test(difference)) {
            return { errorMsgArray: [], hasError: false };
        }

        const initial = parseFloat(initialValue);
        const end = parseFloat(endValue);
        const diff = parseFloat(difference);

        if (isNaN(initial) || isNaN(end) || isNaN(diff)) {
            errorMsgArray.push('初期値、終了値、差分は数値または変数である必要があります');
            return { errorMsgArray, hasError: true };
        }

        if (diff === 0) {
            errorMsgArray.push('差分が0の場合、無限ループになります');
            return { errorMsgArray, hasError: true };
        }

        if (isIncrement && diff < 0) {
            errorMsgArray.push('増やすループで差分が負の値の場合、無限ループになります');
            return { errorMsgArray, hasError: true };
        }

        if (!isIncrement && diff > 0) {
            errorMsgArray.push('減らすループで差分が正の値の場合、無限ループになります');
            return { errorMsgArray, hasError: true };
        }

        return { errorMsgArray: [], hasError: false };
    };

    test('増加ループの正常ケース', () => {
        const result = checkForLoopInfinite('1', '10', '1', true);
        expect(result.hasError).toBe(false);
    });

    test('増加ループの無限ループ検出（負の差分）', () => {
        const result = checkForLoopInfinite('1', '10', '-1', true);
        expect(result.hasError).toBe(true);
        expect(result.errorMsgArray[0]).toContain('無限ループになります');
    });

    test('減少ループの正常ケース', () => {
        const result = checkForLoopInfinite('10', '1', '-1', false);
        expect(result.hasError).toBe(false);
    });

    test('減少ループの無限ループ検出（正の差分）', () => {
        const result = checkForLoopInfinite('10', '1', '1', false);
        expect(result.hasError).toBe(true);
        expect(result.errorMsgArray[0]).toContain('無限ループになります');
    });

    test('差分0での無限ループ検出', () => {
        const result = checkForLoopInfinite('1', '10', '0', true);
        expect(result.hasError).toBe(true);
        expect(result.errorMsgArray[0]).toBe('差分が0の場合、無限ループになります');
    });
});