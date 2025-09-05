import { useEffect } from 'react';

export const useTabPreloader = () => {
    useEffect(() => {
        // アイドル時間にコンポーネントをプリロード
        const preloadComponents = async () => {
            if ('requestIdleCallback' in window) {
                (window as any).requestIdleCallback(async () => {
                    try {
                        await Promise.all([
                            import('@/app/components/Tab/DnclTab'),
                            import('@/app/components/Tab/JsTab'),
                            import('@/app/components/Tab/PythonTab'),
                            import('@/app/components/Tab/VbaTab'),
                            import('@/app/components/Tab/FlowTab')
                        ]);
                        console.log('Tab components preloaded');
                    } catch (error) {
                        console.warn('Failed to preload components:', error);
                    }
                });
            }
        };

        // 初回マウント後1秒待ってからプリロード開始
        const timer = setTimeout(preloadComponents, 1000);
        return () => clearTimeout(timer);
    }, []);
};