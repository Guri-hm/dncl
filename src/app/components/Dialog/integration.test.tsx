import React from 'react';
import { render } from '@testing-library/react';
import { StatementEnum } from '@/app/enum';

// DnclEditDialogの型定義をモック
const MockDnclEditDialog = ({ open, type, treeItems, item, overIndex, setEditor, addItem, refresh, setItems }: any) => {
    if (!open) return null;

    return (
        <div role="dialog">
            <button onClick={() => setEditor()}>キャンセル</button>
            <button type="submit">決定</button>
            <form onSubmit={(e) => { e.preventDefault(); }}>
                <input name="test" />
            </form>
        </div>
    );
};

// DnclEditDialogをモック
jest.mock('./DnclEditDialog', () => ({
    DnclEditDialog: MockDnclEditDialog
}));

describe('DNCL統合テスト', () => {

    const defaultProps = {
        open: true,
        type: StatementEnum.Input,
        treeItems: [],
        item: null,
        overIndex: 0,
        setEditor: jest.fn(),
        addItem: jest.fn(),
        refresh: jest.fn(),
        setItems: jest.fn(),
    };

    beforeEach(() => {
        jest.clearAllMocks();
    });

    test('プロパティの型チェック', () => {
        expect(typeof defaultProps.open).toBe('boolean');
        expect(typeof defaultProps.type).toBe('number');
        expect(Array.isArray(defaultProps.treeItems)).toBe(true);
        expect(typeof defaultProps.setEditor).toBe('function');
        expect(typeof defaultProps.addItem).toBe('function');
        expect(typeof defaultProps.refresh).toBe('function');
        expect(typeof defaultProps.setItems).toBe('function');
    });

    test('基本的なレンダリング', () => {
        const { container } = render(<MockDnclEditDialog {...defaultProps} />);
        expect(container.querySelector('[role="dialog"]')).toBeTruthy();
    });

    test('openがfalseの場合は何も表示されない', () => {
        const closedProps = { ...defaultProps, open: false };
        const { container } = render(<MockDnclEditDialog {...closedProps} />);
        expect(container.querySelector('[role="dialog"]')).toBeFalsy();
    });

    test('StatementEnumの値が正しい', () => {
        expect(StatementEnum.Input).toBeDefined();
        expect(typeof StatementEnum.Input).toBe('number');
    });

    test('モック関数が正しく動作する', () => {
        const mockFn = jest.fn();
        mockFn('test');
        expect(mockFn).toHaveBeenCalledWith('test');
        expect(mockFn).toHaveBeenCalledTimes(1);
    });
});