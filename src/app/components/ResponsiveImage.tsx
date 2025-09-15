import React from 'react';
import Box from '@mui/material/Box';
import Image from 'next/image';

type Props = {
    src: string;
    alt?: string;
    maxWidth?: number | string;
    aspectRatio?: string;
};

export default function ResponsiveImage({ src, alt = '', maxWidth = 150, aspectRatio = '1 / 1' }: Props) {
    const maxW = typeof maxWidth === 'number' ? `${maxWidth}px` : maxWidth;
    return (
        <Box
            sx={{
                textAlign: 'center',
                marginX: 'auto',
                marginY: '10px',
                width: '50%',
                maxWidth: maxW,
                position: 'relative',
                aspectRatio: aspectRatio,
            }}
        >
            <Image src={src} alt={alt} fill style={{ objectFit: 'contain' }} />
        </Box>
    );
}