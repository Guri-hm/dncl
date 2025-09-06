// ProcessEnumをモック
const ProcessEnum = {
    If: 1,
    EndIf: 2,
    While: 3,
    EndWhile: 4,
    For: 5,
    EndFor: 6
};

// FlattenedItemの型定義をモック
interface MockFlattenedItem {
    id: string;
    line: string;
    processIndex: number;
    parentId: string | null;
    children: any[];
    depth: number;
    index: number;
    variables: string[];
    isConstant: boolean;
}

describe('DNCL構文パターン検証', () => {

    const createMockItem = (
        id: string,
        processIndex: number,
        parentId: string | null = null,
        children: any[] = []
    ): MockFlattenedItem => ({
        id,
        line: '',
        processIndex,
        parentId,
        children,
        depth: 0,
        index: 0,
        variables: [],
        isConstant: false
    });

    // 構文チェック関数のモック実装
    const checkDNCLSyntax = (items: MockFlattenedItem[], currentItem: MockFlattenedItem, index: number) => {
        const errors: string[] = [];

        if (currentItem.processIndex === ProcessEnum.If) {
            const hasEndIf = items.slice(index + 1).some(item => item.processIndex === ProcessEnum.EndIf);
            if (!hasEndIf) {
                errors.push('If文に対応するEndIfが見つかりません');
            }
        }

        if (currentItem.processIndex === ProcessEnum.While) {
            const hasEndWhile = items.slice(index + 1).some(item => item.processIndex === ProcessEnum.EndWhile);
            if (!hasEndWhile) {
                errors.push('While文に対応するEndWhileが見つかりません');
            }
        }

        return { hasError: errors.length > 0, errors };
    };

    test('基本的なDNCL要素の作成', () => {
        const item = createMockItem('1', ProcessEnum.If, 'root');
        expect(item.id).toBe('1');
        expect(item.processIndex).toBe(ProcessEnum.If);
        expect(item.parentId).toBe('root');
    });

    describe('If文構文チェック', () => {
        test('If文に適切な終了処理がある場合', () => {
            const items: MockFlattenedItem[] = [
                createMockItem('1', ProcessEnum.If, 'root'),
                createMockItem('2', ProcessEnum.EndIf, 'root'),
            ];

            const result = checkDNCLSyntax(items, items[0], 0);
            expect(result.hasError).toBe(false);
        });

        test('If文に終了処理がない場合', () => {
            const items: MockFlattenedItem[] = [
                createMockItem('1', ProcessEnum.If, 'root'),
            ];

            const result = checkDNCLSyntax(items, items[0], 0);
            expect(result.hasError).toBe(true);
            expect(result.errors[0]).toContain('EndIf');
        });
    });

    describe('While文構文チェック', () => {
        test('While文に適切な終了処理がある場合', () => {
            const items: MockFlattenedItem[] = [
                createMockItem('1', ProcessEnum.While, 'root'),
                createMockItem('2', ProcessEnum.EndWhile, 'root'),
            ];

            const result = checkDNCLSyntax(items, items[0], 0);
            expect(result.hasError).toBe(false);
        });

        test('While文に終了処理がない場合', () => {
            const items: MockFlattenedItem[] = [
                createMockItem('1', ProcessEnum.While, 'root'),
            ];

            const result = checkDNCLSyntax(items, items[0], 0);
            expect(result.hasError).toBe(true);
            expect(result.errors[0]).toContain('EndWhile');
        });
    });

    describe('ProcessEnum値の確認', () => {
        test('ProcessEnumが正しく定義されている', () => {
            expect(ProcessEnum.If).toBeDefined();
            expect(ProcessEnum.EndIf).toBeDefined();
            expect(ProcessEnum.While).toBeDefined();
            expect(ProcessEnum.EndWhile).toBeDefined();
        });
    });
});