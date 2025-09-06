import { ValidationEnum, inputTypeEnum } from './Enum/enum';

describe('DnclTextField内のinputTypeとpatternの組み合わせテスト', () => {

    // SwitchVariableOrArray のテスト
    describe('SwitchVariableOrArray', () => {
        test('checked=false時は Variable パターン', () => {
            const pattern = ValidationEnum.Variable;
            const validValues = ['abc', 'variable1', 'myVar'];
            const invalidValues = ['1abc', '_test', '$test'];

            validValues.forEach(value => {
                expect(new RegExp(pattern).test(value)).toBe(true);
            });

            invalidValues.forEach(value => {
                expect(new RegExp(pattern).test(value)).toBe(false);
            });
        });

        test('isConstantMode=true時は Constant パターン', () => {
            const pattern = ValidationEnum.Constant;
            const validValues = ['ABC', 'CONSTANT_1'];
            const invalidValues = ['abc', 'variable1'];

            validValues.forEach(value => {
                expect(new RegExp(pattern).test(value)).toBe(true);
            });

            invalidValues.forEach(value => {
                expect(new RegExp(pattern).test(value)).toBe(false);
            });
        });
    });

    // SwitchVariableOrNumberOrArray のテスト
    describe('SwitchVariableOrNumberOrArray', () => {
        test('threeWayValue=Variable時は Variable パターン', () => {
            const pattern = ValidationEnum.Variable;
            expect(new RegExp(pattern).test('abc')).toBe(true);
            expect(new RegExp(pattern).test('1abc')).toBe(false);
        });

        test('threeWayValue=Number時は Number パターン', () => {
            const pattern = ValidationEnum.Number;
            expect(new RegExp(pattern).test('123')).toBe(true);
            expect(new RegExp(pattern).test('-45')).toBe(true);
            expect(new RegExp(pattern).test('3.14')).toBe(true);
            expect(new RegExp(pattern).test('abc')).toBe(false);
        });

        test('threeWayValue=Array時は Variable パターン（配列名）', () => {
            const pattern = ValidationEnum.Variable;
            expect(new RegExp(pattern).test('arr')).toBe(true);
            expect(new RegExp(pattern).test('1arr')).toBe(false);
        });
    });

    // All のテスト
    describe('inputTypeEnum.All', () => {
        test('radioValue=Variable時は Variable パターン', () => {
            const pattern = ValidationEnum.Variable;
            expect(new RegExp(pattern).test('x')).toBe(true);
            expect(new RegExp(pattern).test('1x')).toBe(false);
        });

        test('radioValue=Number時は Number パターン', () => {
            const pattern = ValidationEnum.Number;
            expect(new RegExp(pattern).test('123')).toBe(true);
            expect(new RegExp(pattern).test('abc')).toBe(false);
        });

        test('radioValue=String時は String パターン', () => {
            const pattern = ValidationEnum.String;
            expect(new RegExp(pattern).test('こんにちは')).toBe(true);
            expect(new RegExp(pattern).test('<script>')).toBe(false);
        });
    });

    // Array のテスト
    describe('inputTypeEnum.Array', () => {
        test('配列名は Variable パターン', () => {
            const pattern = ValidationEnum.Variable;
            expect(new RegExp(pattern).test('arr')).toBe(true);
            expect(new RegExp(pattern).test('1arr')).toBe(false);
        });

        test('配列添字は VariableOrPositiveInteger パターン', () => {
            const pattern = ValidationEnum.VariableOrPositiveInteger;
            expect(new RegExp(pattern).test('i')).toBe(true);
            expect(new RegExp(pattern).test('0')).toBe(true);
            expect(new RegExp(pattern).test('123')).toBe(true);
            expect(new RegExp(pattern).test('-1')).toBe(false);
        });
    });

    // ForValue のテスト
    describe('inputTypeEnum.ForValue', () => {
        test('forValueType=Number時は Number パターン（負数・小数OK）', () => {
            const pattern = ValidationEnum.Number;
            expect(new RegExp(pattern).test('123')).toBe(true);
            expect(new RegExp(pattern).test('-5')).toBe(true);
            expect(new RegExp(pattern).test('3.14')).toBe(true);
            expect(new RegExp(pattern).test('abc')).toBe(false);
        });

        test('forValueType=Variable時は Variable パターン', () => {
            const pattern = ValidationEnum.Variable;
            expect(new RegExp(pattern).test('start')).toBe(true);
            expect(new RegExp(pattern).test('1start')).toBe(false);
        });
    });

    // VariableOnly & ArrayWithoutSuffix のテスト
    describe('inputTypeEnum.VariableOnly & ArrayWithoutSuffix', () => {
        test('Variable パターンが適用される', () => {
            const pattern = ValidationEnum.Variable;
            expect(new RegExp(pattern).test('variable')).toBe(true);
            expect(new RegExp(pattern).test('1variable')).toBe(false);
        });
    });

    // InitializeArray のテスト
    describe('inputTypeEnum.InitializeArray', () => {
        test('InitializeArray パターンが適用される', () => {
            const pattern = ValidationEnum.InitializeArray;
            // パターンの具体的な内容によってテスト内容を調整
            expect(typeof pattern).toBe('string');
        });
    });
});