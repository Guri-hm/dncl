import React from 'react';
import Box from '@mui/material/Box';
import { BoxProps, createTheme } from '@mui/system';
import { useTheme } from '@mui/material/styles';

export const Spotlight: React.FC<BoxProps> = ({ children }) => {
    const theme = useTheme();
    const isDark = theme.palette.mode === 'dark';

    return (
        <Box
            sx={{
                padding: 3,
                maxWidth: 450,
                width: '100%',
                aspectRatio: '1 / 1',
                borderRadius: '50%',
                marginX: 'auto',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: isDark ? '0 0 20px rgba(0, 0, 0, 0.5)' : 'none', // 周囲の影
                background: isDark ? 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)' : 'none',// スポットライトの効果
            }}
        >
            {children}
        </Box>
    );
};
