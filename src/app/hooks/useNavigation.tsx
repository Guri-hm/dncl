'use client';
import { useRouter } from 'next/navigation';
import { useLoading } from '@/app/components/LoadingContext';

export const useNavigation = () => {
    const router = useRouter();
    const { setIsNavigating } = useLoading();

    const navigateTo = (href: string) => {
        setIsNavigating(true);
        // 少し遅延を入れてローディング状態を確実に表示
        setTimeout(() => {
            router.push(href);
        }, 100);
    };

    return { navigateTo };
};