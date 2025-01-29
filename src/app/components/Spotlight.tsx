// components/ScopeBox.tsx
import React from 'react';
import Box from '@mui/material/Box';
import { BoxProps } from '@mui/system';

const Spotlight: React.FC<BoxProps> = ({ children }) => {
    return <Box
        sx={{
            width: '80%', maxWidth: '600px', height: '90%', maxHeight: '600px', borderRadius: '50%', marginX: 'auto',
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            boxShadow: '0 0 20px rgba(0, 0, 0, 0.5)', // 周囲の影
            background: 'radial-gradient(circle, rgba(255,255,255,1) 0%, rgba(255,255,255,0) 70%)', // スポットライトの効果
        }}
    >{children}
    </Box>;
};

export default Spotlight;
