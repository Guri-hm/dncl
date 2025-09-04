'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Loading from './Loading';
import CssBaseline from '@mui/material/CssBaseline';
import { LoadingProvider } from './LoadingContext';
import { CustomThemeProvider } from '@/app/hooks/ThemeProvider';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const pathname = usePathname();

    useEffect(() => {
        const handleComplete = () => {
            setFadeOut(true);
            setTimeout(() => setLoading(true), 500);
        };
        handleComplete();

        // ルート変更を監視
        // const url = `${pathname}?${searchParams}`;

        return () => {
            // クリーンアップ処理
        };
    }, [pathname]);

    return (
        <>
            <CustomThemeProvider>
                <LoadingProvider>
                    {loading && <Loading fadeOut={fadeOut} />}
                    <Suspense fallback={<Loading />}>
                        <CssBaseline />
                        {children}
                    </Suspense>
                </LoadingProvider>
            </CustomThemeProvider>
        </>
    );
}