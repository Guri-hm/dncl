import { useState, useEffect } from 'react';

export interface Achievement {
    isAchieved: boolean;
    achievedDate?: string | null;
}

export const storageKey = 'achievements_20250207';

const useAchievements = (storageKey: string) => {
    const [achievements, setAchievements] = useState<{ [key: string]: Achievement }>({});

    useEffect(() => {
        const storedAchievements = JSON.parse(localStorage.getItem(storageKey) || '{}');
        setAchievements(storedAchievements);
    }, [storageKey]);

    const addAchievement = (pageId: string, achievement: Achievement) => {
        const formattedAchievement = {
            ...achievement,
            achievedDate: achievement.achievedDate ? formatDate(new Date(achievement.achievedDate)) : formatDate(new Date())
        };

        setAchievements(prevAchievements => {
            if (!prevAchievements[pageId]) {
                const newAchievements = { ...prevAchievements, [pageId]: formattedAchievement };
                localStorage.setItem(storageKey, JSON.stringify(newAchievements));
                return newAchievements;
            }
            return prevAchievements;
        });
    };

    const clearAchievements = () => {
        try {
            localStorage.removeItem(storageKey);
        } catch (error) {
            const message = error instanceof Error ? error.message : 'Unknown error';
            alert(message);
        } finally {
            setAchievements({});
        }
    };

    return {
        achievements,
        addAchievement,
        clearAchievements
    };
};

const formatDate = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}/${month}/${day}`;
};

export default useAchievements;