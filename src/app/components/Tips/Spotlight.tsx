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
                // 内側のハイライト
                background: isDark
                    ? 'radial-gradient(circle at 50% 50%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0) 65%)'
                    : 'none',
                // 外縁のぼかしを擬似要素で作る
                '&::before': {
                    content: '""',
                    position: 'absolute',
                    inset: 0,
                    borderRadius: '50%',
                    // 少し拡大してぼかしを外側まで伸ばす
                    transform: 'scale(1.15)',
                    background: isDark
                        ? 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 60%)'
                        : 'none',
                    filter: 'blur(18px)',
                    pointerEvents: 'none',
                    zIndex: 0,
                },
                // 中身は擬似要素より上に表示
                '& > *': {
                    position: 'relative',
                    zIndex: 1,
                },
            }}
        >
            {children}
        </Box>
    );
};
