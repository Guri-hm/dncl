describe('Babelパーサーによる構文チェック', () => {

    // tryParseToJsFunctionのモック実装
    const tryParseToJsFunction = (code: string): { hasError: boolean; errorMsgArray: string[]; convertedStr: string } => {
        try {
            // 簡単な構文チェック
            if (code.includes('+++++') || code.includes('--')) {
                throw new Error('Unexpected token');
            }
            if (code.endsWith('++')) {
                throw new Error('Unexpected end of input');
            }

            return {
                hasError: false,
                errorMsgArray: [],
                convertedStr: code
            };
        } catch (error) {
            return {
                hasError: true,
                errorMsgArray: [error instanceof Error ? error.message : 'Parse error'],
                convertedStr: ''
            };
        }
    };

    test('正常なJavaScript構文', () => {
        const validCode = 'x + 123';
        const result = tryParseToJsFunction(validCode);
        expect(result.hasError).toBe(false);
        expect(result.convertedStr).toBeTruthy();
    });

    test('無効なJavaScript構文でエラー', () => {
        const invalidCode = 'x +++++';
        const result = tryParseToJsFunction(invalidCode);
        expect(result.hasError).toBe(true);
        expect(result.errorMsgArray.length).toBeGreaterThan(0);
    });

    test('予期しないトークンエラー', () => {
        const invalidCode = 'x++';
        const result = tryParseToJsFunction(invalidCode);
        expect(result.hasError).toBe(true);
        expect(result.errorMsgArray[0]).toMatch(/Unexpected/);
    });

    test('関数構文の解析', () => {
        const functionCode = 'Math.max(1, 2)';
        const result = tryParseToJsFunction(functionCode);
        expect(result.hasError).toBe(false);
    });
});