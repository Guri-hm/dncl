'use client';

import { useState, useEffect } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Suspense } from 'react';
import Loading from './Loading';

export default function ClientLayout({ children }: { children: React.ReactNode }) {
    const [loading, setLoading] = useState(true);
    const [fadeOut, setFadeOut] = useState(false);
    const pathname = usePathname();
    const searchParams = useSearchParams();

    useEffect(() => {
        const handleComplete = () => {
            setFadeOut(true);
            setTimeout(() => setLoading(false), 500);
        };
        handleComplete();

        // ルート変更を監視
        // const url = `${pathname}?${searchParams}`;

        return () => {
            // クリーンアップ処理
        };
    }, [pathname, searchParams]);

    return (
        <>
            {loading && <Loading fadeOut={fadeOut} />}
            <Suspense fallback={<Loading />}>
                {children}
            </Suspense>
        </>
    );
}