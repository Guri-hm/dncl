import { useEffect } from 'react';

export const usePreloadComponents = () => {
    useEffect(() => {
        // ユーザーがホバーした時点で重要コンポーネントをプリロード
        const preloadComponents = () => {
            // 重要なコンポーネントを事前読み込み
            import('@/app/components/SortableTree');
            import('@/app/components/Tab/ConsoleTab');
            import('@/app/components/Tab/JsTab');
        };

        // ページロード後3秒でプリロード開始
        const timer = setTimeout(preloadComponents, 3000);

        return () => clearTimeout(timer);
    }, []);
};