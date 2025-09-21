import { tryParseToJsFunction, getOperatorTypeAndIndex, sanitizeInput } from './utilities';
import { OperationEnum, ArithmeticOperator, ComparisonOperator } from '@/app/enum';

// squareString, exponentiateString, replaceOddFunctions, convertBinaryFunctions, removeWord を間接的にテスト
describe('tryParseToJsFunction (間接的なユーティリティ関数のテスト)', () => {

    it('Random(1, 5)がMath.floor(Math.random() * (5 - 1 + 1)) + 1に変換される', () => {
        const result = tryParseToJsFunction('Random(1, 5)');
        expect(result.convertedStr).toBe('Math.floor(Math.random() * (5 - 1 + 1)) + 1');
        expect(result.hasError).toBe(false);
    });

    it('Random(a, b)がMath.floor(Math.random() * (b - a + 1)) + aに変換され、NaNやエラーにならない', () => {
        const result = tryParseToJsFunction('Random(a, b)');
        expect(result.convertedStr).toBe('Math.floor(Math.random() * (b - a + 1)) + a');
        expect(result.hasError).toBe(false);
    });

    it('Random(5, 1)は第1引数が第2引数より大きいのでエラーになる', () => {
        const result = tryParseToJsFunction('Random(5, 1)');
        expect(result.hasError).toBe(true);
        expect(result.errorMsgArray[0]).toContain('第1引数の値は第2引数の値よりも小さくしてください');
    });

    it('Random(-1, -5)は第1引数が第2引数より大きいのでエラーになる', () => {
        const result = tryParseToJsFunction('Random(-1, -5)');
        expect(result.hasError).toBe(true);
        expect(result.errorMsgArray[0]).toContain('第1引数の値は第2引数の値よりも小さくしてください');
    });

    it('Square(5)が( 5 * 5 )に変換される', () => {
        const result = tryParseToJsFunction('Square(5)');
        expect(result.convertedStr).toBe('( 5 * 5 )');
        expect(result.hasError).toBe(false);
    });

    it('Square(a)が( a * a )に変換される（NaNにならない）', () => {
        const result = tryParseToJsFunction('Square(a)');
        expect(result.convertedStr).toBe('( a * a )');
        expect(result.hasError).toBe(false);
    });

    it('Exponentiation(2,3)が( 2 ** 3 )に変換される', () => {
        const result = tryParseToJsFunction('Exponentiation(2,3)');
        expect(result.convertedStr).toBe('( 2 ** 3 )');
        expect(result.hasError).toBe(false);
    });

    it('Exponentiation(-2, 7)が( (-2) ** 7 )に変換される', () => {
        const result = tryParseToJsFunction('Exponentiation(-2, 7)');
        expect(result.convertedStr).toBe('( (-2) ** 7 )');
        expect(result.hasError).toBe(false);
    });

    it('Exponentiation(2.5, 3)が( 2.5 ** 3 )に変換される', () => {
        const result = tryParseToJsFunction('Exponentiation(2.5, 3)');
        expect(result.convertedStr).toBe('( 2.5 ** 3 )');
        expect(result.hasError).toBe(false);
    });

    it('Exponentiation(a, b)が( a ** b )に変換される', () => {
        const result = tryParseToJsFunction('Exponentiation(a, b)');
        expect(result.convertedStr).toBe('( a ** b )');
        expect(result.hasError).toBe(false);
    });

    it('Odd(a)がa % 2 !== 0に変換される', () => {
        const result = tryParseToJsFunction('Odd(a)');
        expect(result.convertedStr).toBe('a % 2 !== 0');
        expect(result.hasError).toBe(false);
    });

    it('Square( a )が( a * a)に変換される', () => {
        const result = tryParseToJsFunction('Square(a)');
        expect(result.convertedStr).toBe('( a * a )');
        expect(result.hasError).toBe(false);
    });

    it('Binary(x)が(x).toString(2)に変換される', () => {
        const result = tryParseToJsFunction('Binary(x)');
        expect(result.convertedStr).toBe('(x).toString(2)');
        expect(result.hasError).toBe(false);
    });

    it('UserDefinedが除去される', () => {
        const result = tryParseToJsFunction('UserDefined foo');
        expect(result.convertedStr).toBe('foo');
        expect(result.hasError).toBe(false);
    });

    it('複数の変換が混在しても正しく処理される', () => {
        const result = tryParseToJsFunction('Square(a) + Exponentiation(2,3) + Odd(b) + Binary(c) + UserDefined bar');
        expect(result.convertedStr).toBe('( a * a ) + ( 2 ** 3 ) + b % 2 !== 0 + (c).toString(2) + bar');
        expect(result.hasError).toBe(false);
    });
});


describe('getOperatorTypeAndIndex', () => {
    it('算術演算子 "+" で Arithmetic と index=0 を返す', () => {
        const result = getOperatorTypeAndIndex(ArithmeticOperator.AdditionOperator);
        expect(result).toEqual({ type: OperationEnum.Arithmetic, index: 0 });
    });

    it('算術演算子 "*" で Arithmetic と index=2 を返す', () => {
        const result = getOperatorTypeAndIndex(ArithmeticOperator.MultiplicationOperator);
        expect(result).toEqual({ type: OperationEnum.Arithmetic, index: 2 });
    });

    it('比較演算子 "==" で Comparison と index=0 を返す', () => {
        const result = getOperatorTypeAndIndex(ComparisonOperator.EqualToOperator);
        expect(result).toEqual({ type: OperationEnum.Comparison, index: 0 });
    });

    it('比較演算子 "<=" で Comparison と index=5 を返す', () => {
        const result = getOperatorTypeAndIndex(ComparisonOperator.LessThanOrEqualToOperator);
        expect(result).toEqual({ type: OperationEnum.Comparison, index: 5 });
    });

    it('未定義演算子は null を返す', () => {
        const result = getOperatorTypeAndIndex('???');
        expect(result).toBeNull();
    });
});


describe('sanitizeInput', () => {
    const operatorSamples = [
        '1 + 2',
        'a+b',
        'x - y',
        '3 * 5',
        '10/2',
        '5 % 2',
        '2 ** 3',
        '(a + b) * c',
        'a < b',
        'a <= b',
        'a > b',
        'a >= b',
        'a == b',
        'a === b',
        'a != b',
        'a !== b',
    ];

    const allowedSamples = [
        'abc123',
        '～', //全角チルダ
        '〜', //波ダッシュ
        'HelloWorld',
        'あいうえお',
        'アイウエオ',
        '漢字テスト',
        'ＡＢＣ１２３',             // 全角英数字
        'hello 世界',               // 半角+日本語
        'スペース テスト　全角',     // 半角スペース + 全角スペース
        '.,!、。-＿,!',             // 句読点・記号（許可された範囲）
    ];

    const forbiddenSamples = [
        '<script>alert(1)</script>',
        'javascript:alert(1)',
        'onclick=doSomething()',   // onxxx= 属性挿入パターン
        'a<b',                     // 不正な記号 <(前後空白スペースなし)
        'brace{',                  // { は禁止
        'dollar$',                 // $ は禁止
        'back\\slash',             // バックスラッシュ禁止
        'pipe|pipe',               // パイプ禁止
        ';semicolon',              // セミコロン禁止
        '`backtick`',              // バックチック禁止
        String.fromCharCode(0),    // 制御文字は不可
        '😊',                      // 絵文字は許可対象外（期待通り弾かれる）
        '',                        // 空文字は不許可（空文字が返る）
    ];

    test.each(operatorSamples)('演算子を含む入力を許可する: %p', (s) => {
        const out = sanitizeInput(s);
        expect(out).toBe(s);
    });

    test.each(allowedSamples)('許可されるべき入力: %p', (s) => {
        const out = sanitizeInput(s);
        expect(out).toBe(s);
    });

    test.each(forbiddenSamples)('拒否されるべき入力: %p', (s) => {
        const out = sanitizeInput(s);
        expect(out).toBe('');
    });

    test('境界: 数字と日本語混合', () => {
        const str = '変数123と値';
        expect(sanitizeInput(str)).toBe(str);
    });

    test('タグやスニペットが含まれる複合ケースは拒否', () => {
        const str = '表示: <b>太字</b>';
        expect(sanitizeInput(str)).toBe('');
    });

    test('オンイベント属性を含むケースを拒否', () => {
        const str = 'foo onclick=alert(1)';
        expect(sanitizeInput(str)).toBe('');
    });
});