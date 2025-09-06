describe('エッジケースと例外処理', () => {

    describe('境界値テスト', () => {
        test('空文字列の処理', () => {
            const emptyInput = '';
            const regex = new RegExp('^[a-zA-Z][a-zA-Z0-9_]*$');
            expect(regex.test(emptyInput)).toBe(false);
        });

        test('最大長の入力値', () => {
            const longInput = 'a'.repeat(1000);
            const regex = new RegExp('^[a-zA-Z][a-zA-Z0-9_]*$');
            expect(regex.test(longInput)).toBe(true);
        });

        test('特殊文字の組み合わせ', () => {
            const specialChars = ['!@#$%', '()[]{}', '<>=&|'];
            const regex = new RegExp('^[a-zA-Z][a-zA-Z0-9_]*$');

            specialChars.forEach(chars => {
                expect(regex.test(chars)).toBe(false);
            });
        });
    });

    describe('数値の境界値', () => {
        test('非常に大きな数値', () => {
            const largeNumber = '999999999999999999999';
            const regex = new RegExp('^-?\\d+(\\.\\d+)?$');
            expect(regex.test(largeNumber)).toBe(true);
        });

        test('非常に小さな小数', () => {
            const smallDecimal = '0.000000001';
            const regex = new RegExp('^-?\\d+(\\.\\d+)?$');
            expect(regex.test(smallDecimal)).toBe(true);
        });
    });
});