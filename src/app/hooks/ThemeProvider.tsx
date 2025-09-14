"use client"
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ThemeProvider, createTheme, responsiveFontSizes } from '@mui/material/styles';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
    mode: ThemeMode;
    toggleTheme: () => void;
    setMode: (mode: ThemeMode) => void;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeMode = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useThemeMode must be used within a ThemeProvider');
    }
    return context;
};

export const CustomThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [mode, setMode] = useState<ThemeMode>(() => {
        if (typeof window !== "undefined") {
            return (localStorage.getItem("themeMode") as ThemeMode) || "system";
        }
        return "system";
    });

    useEffect(() => {
        localStorage.setItem("themeMode", mode);
    }, [mode]);

    const [actualMode, setActualMode] = useState<'light' | 'dark'>('light');

    useEffect(() => {
        const getActualMode = (): 'light' | 'dark' => {
            if (mode === 'system' && typeof window !== "undefined") {
                return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
            }
            return mode === 'dark' ? 'dark' : 'light';
        };

        setActualMode(getActualMode());

        if (mode === 'system' && typeof window !== "undefined") {
            const handler = () => setActualMode(getActualMode());
            window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', handler);
            return () => window.matchMedia('(prefers-color-scheme: dark)').removeEventListener('change', handler);
        }
    }, [mode]);

    const toggleTheme = () => {
        setMode(prev =>
            prev === 'light' ? 'dark'
                : prev === 'dark' ? 'system'
                    : 'light'
        );
    };

    let theme = createTheme({
        palette: {
            mode: actualMode,
            ...(actualMode === 'dark'
                ? { text: { primary: '#fafaf9' } }
                : { text: { primary: '#171717' } }
            ),
        },
        typography: {
            fontFamily: 'YakuHanJPs, Roboto, "Hiragino Kaku Gothic ProN", "ヒラギノ角ゴ ProN W3", Arial, nc3Jp, sans-serif',
            h1: {
                fontSize: '1.9rem !important',
                '@media (min-width:600px)': {
                    fontSize: '2.4rem !important',
                },
            },
            h2: {
                fontSize: '1.5rem !important',
                color: actualMode === 'dark' ? 'var(--stone-50)' : 'var(--foreground)',
                '@media (min-width:600px)': {
                    fontSize: '2.0rem !important',
                },
            },
            h3: {
                fontSize: '1.125rem',
                '@media (min-width:600px)': {
                    fontSize: '1.75rem',
                },
            },
            h4: {
                fontSize: '1rem',
                '@media (min-width:600px)': {
                    fontSize: '1.5rem',
                },
            },
            h5: {
                fontSize: '0.875rem',
                '@media (min-width:600px)': {
                    fontSize: '1.25rem',
                },
            },
        },
    });

    theme = responsiveFontSizes(theme);

    return (
        <ThemeContext.Provider value={{ mode, toggleTheme, setMode }}>
            <ThemeProvider theme={theme}>
                {children}
            </ThemeProvider>
        </ThemeContext.Provider>
    );
};