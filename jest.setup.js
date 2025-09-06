import '@testing-library/jest-dom';

// Material-UIのモック
jest.mock('@mui/material/styles', () => ({
    ...jest.requireActual('@mui/material/styles'),
    useTheme: () => ({
        breakpoints: {
            up: () => false,
        },
        palette: {
            mode: 'light',
        },
    }),
}));

// Next.jsのモック
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props) => {
        return <img {...props} />
    },
}));

// グローバルなテスト設定
global.ResizeObserver = jest.fn().mockImplementation(() => ({
    observe: jest.fn(),
    unobserve: jest.fn(),
    disconnect: jest.fn(),
}));

// MatchMedia のモック
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // deprecated
        removeListener: jest.fn(), // deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});