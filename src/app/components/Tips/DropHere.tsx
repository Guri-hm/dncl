import React, { useState } from 'react';
import { SpeechBubbleImage, Spotlight } from '@/app/components/Tips';
import { Box, createTheme, useMediaQuery } from '@mui/material';
import Image from 'next/image';

interface Props {
    visible?: boolean;
}

interface ResponsiveImageProps {
    src: string;
    alt: string;
    style?: React.CSSProperties;
    onInteraction?: () => void;
}
const theme = createTheme();

const ResponsiveImage: React.FC<ResponsiveImageProps> = ({ src, alt, style, onInteraction }) => {
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
            style={{ width, ...style }}
            onClick={onInteraction}
            onDragStart={onInteraction}
            draggable={true}
        />
    );
};

export const DropHere = ({ visible = true }: Props) => {
    const [isTriggered, setIsTriggered] = useState(false);

    const handleInteraction = () => {
        setIsTriggered(true);
        // 5秒後に元に戻す（オプション）
        setTimeout(() => {
            setIsTriggered(false);
        }, 5000);
    };

    const message = isTriggered ? '・・・ドロップって知っていますか？' : 'ここにドロップします';
    const imageSrc = isTriggered ? 'amazed.svg' : 'raise_one_hand.svg';
    const imageAlt = isTriggered ? '首をかしげる女の子' : '手をあげる女の子';

    return (
        <Box sx={{ display: `${visible ? 'block' : 'none'}` }}>
            <Spotlight>
                <SpeechBubbleImage msg={message}>
                    <ResponsiveImage
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH}/${imageSrc}`}
                        alt={imageAlt}
                        style={{ height: "auto" }}
                        onInteraction={handleInteraction}
                    />
                </SpeechBubbleImage>
            </Spotlight>
        </Box>
    );
};
