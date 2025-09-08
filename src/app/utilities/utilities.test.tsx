import { tryParseToJsFunction } from './utilities';

// squareString, exponentiateString, replaceOddFunctions, convertBinaryFunctions, removeWord を間接的にテスト
describe('tryParseToJsFunction (間接的なユーティリティ関数のテスト)', () => {
    it('Square(5)が(5 * 5)に変換される', () => {
        const result = tryParseToJsFunction('Square(5)');
        expect(result.convertedStr).toBe('(5 * 5)');
        expect(result.hasError).toBe(false);
    });

    it('Square(a)が(a * a)に変換される（NaNにならない）', () => {
        const result = tryParseToJsFunction('Square(a)');
        expect(result.convertedStr).toBe('(a * a)');
        expect(result.hasError).toBe(false);
    });

    it('Exponentiation(2,3)が(2**3)に変換される', () => {
        const result = tryParseToJsFunction('Exponentiation(2,3)');
        expect(result.convertedStr).toBe('(2**3)');
        expect(result.hasError).toBe(false);
    });

    it('Odd(a)がa % 2 !== 0に変換される', () => {
        const result = tryParseToJsFunction('Odd(a)');
        expect(result.convertedStr).toBe('a % 2 !== 0');
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
        expect(result.convertedStr).toBe('(a * a) + (2**3) + b % 2 !== 0 + (c).toString(2) + bar');
        expect(result.hasError).toBe(false);
    });
});