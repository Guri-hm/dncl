import React, { useState } from 'react';
import { Box } from '@mui/material';
import { NextImage } from '@/app/components/NextImage';

export const DoNotDrag = () => {

    const [msgDoNotDrag, setMsgDoNotDrag] = useState('ドラッグして追加します');

    return (
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Box
                sx={{
                    marginLeft: 'auto',
                    position: 'relative',
                    top: '-10px',
                    backgroundColor: 'var(--stone-50)',
                    borderRadius: '10px',
                    padding: '10px',
                    marginRight: '10px',
                    boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
                    '&::after': {
                        content: '""',
                        position: 'absolute',
                        top: '50%',
                        left: '100%',
                        transform: 'translateY(-50%)',
                        borderWidth: '5px 0 5px 20px',
                        borderStyle: 'solid',
                        borderColor: 'transparent transparent transparent var(--stone-50)',
                    },
                }}
            >
                {msgDoNotDrag}
            </Box>
            <Box sx={{ width: '80px', height: '80px' }}>
                <NextImage src={`${process.env.NEXT_PUBLIC_BASE_PATH}/pointing.svg`} alt={'指差し'} style={{ objectFit: 'contain' }} onDragStart={(e: React.DragEvent<HTMLImageElement>) => {
                    e.preventDefault();
                    setMsgDoNotDrag('私はドラッグできませんよ!');
                    setTimeout(() => setMsgDoNotDrag("ドラッグして追加します"), 3000);
                }} />
            </Box>
        </Box>

    );
};
