import React from 'react';
import Box from '@mui/material/Box';
import { BoxProps, createTheme, useMediaQuery } from '@mui/system';

const theme = createTheme();
export const Spotlight: React.FC<BoxProps> = ({ children }) => {
    const isSm = useMediaQuery(theme.breakpoints.down('sm'));
    return (
        <Box
            sx={{
                width: isSm ? '60%' : '80%',
                maxWidth: isSm ? '300px' : '600px',
                height: isSm ? '60%' : '90%',
                maxHeight: isSm ? '300px' : '600px',
                borderRadius: '50%',
                marginX: 'auto',
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)', // 周囲の影
                background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)', // スポットライトの効果
            }}
        >
            {children}
        </Box>
    );
};
