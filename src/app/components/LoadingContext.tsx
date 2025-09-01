'use client';
import React, { createContext, useContext, useState } from 'react';

interface LoadingContextType {
    isNavigating: boolean;
    setIsNavigating: (loading: boolean) => void;
}

const LoadingContext = createContext<LoadingContextType | undefined>(undefined);

export const LoadingProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [isNavigating, setIsNavigating] = useState(false);

    return (
        <LoadingContext.Provider value={{ isNavigating, setIsNavigating }}>
            {children}
        </LoadingContext.Provider>
    );
};

export const useLoading = () => {
    const context = useContext(LoadingContext);
    if (context === undefined) {
        throw new Error('useLoading must be used within a LoadingProvider');
    }
    return context;
};