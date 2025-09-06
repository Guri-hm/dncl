'use client';

import { useState, useEffect, memo } from 'react';
import { usePathname } from 'next/navigation';
import { Suspense, lazy } from 'react';
import CssBaseline from '@mui/material/CssBaseline';
import { LoadingProvider } from './LoadingContext';
import { CustomThemeProvider } from '@/app/hooks/ThemeProvider';

// 遅延読み込み
const Loading = lazy(() => import('./Loading'));

const ClientLayout = memo(({ children }: { children: React.ReactNode }) => {
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleComplete = () => {
            setFadeOut(true);
            setTimeout(() => {
                setLoading(false);
            }, 500);
        };

        // 初回ロード完了の処理
        const timer = setTimeout(handleComplete, 100);

        return () => clearTimeout(timer);
    }, [pathname]);

    return (
        <CustomThemeProvider>
            <LoadingProvider>
                <CssBaseline />
                {loading && (
                    <Suspense fallback={null}>
                        <Loading fadeOut={fadeOut} />
                    </Suspense>
                )}
                <Suspense fallback={null}>
                    {children}
                </Suspense>
            </LoadingProvider>
        </CustomThemeProvider>
    );
});

ClientLayout.displayName = 'ClientLayout';

export default ClientLayout;