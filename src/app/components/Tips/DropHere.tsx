import React from 'react';
import { SpeechBubbleImage, Spotlight } from '@/app/components/Tips';
import { Box, createTheme, useMediaQuery } from '@mui/material';
import Image from 'next/image';

interface Props {
    visible?: boolean;
}

interface ResponsiveImageProps {
    src: string;
    alt: string;
}
const theme = createTheme();

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({ src, alt }) => {
    const isSm = useMediaQuery(theme.breakpoints.up('sm'));

    let width;
    if (isSm) {
        width = '100%';
    } else {
        width = '70%';
    }

    return (
        <Image
            src={src}
            alt={alt}
            width={300}
            height={300}
            style={{ width }}
        />
    );
};

export const DropHere = ({ visible = true }: Props) => {
    return (
        <Box sx={{ display: `${visible ? 'block' : 'none'}` }}>
            <Spotlight>
                <SpeechBubbleImage msg='ここにドロップします'>
                    <ResponsiveImage src={`${process.env.NEXT_PUBLIC_BASE_PATH}/raise_one_hand.svg`} alt="手をあげる"></ResponsiveImage>
                </SpeechBubbleImage>
            </Spotlight>
        </Box>
    );
};
