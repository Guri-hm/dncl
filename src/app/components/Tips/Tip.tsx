import React, { Dispatch, SetStateAction, useState } from 'react';
import { SpeechBubbleImage, Spotlight } from '@/app/components/Tips';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import Image from 'next/image';

interface Props {
    onClose?: Dispatch<SetStateAction<boolean>>;
    hint?: string;
    open?: boolean;
}

export const Tip = ({ onClose, hint = "ヒントなし", open = true }: Props) => {
    return (
        <Box>
            <Spotlight>
                <SpeechBubbleImage open={open} msg={open ? hint : '・・・'}>
                    {(onClose && open) &&
                        <IconButton aria-label="close" sx={{
                            position: 'absolute',
                            right: -30,
                            top: -50,
                        }} onClick={() => onClose(false)}>
                            <CloseIcon />
                        </IconButton>
                    }
                    <Image
                        src={`${process.env.NEXT_PUBLIC_BASE_PATH}/look_back.svg`}
                        alt="ヒントを出す"
                        width={300}
                        height={300}
                        priority
                        style={{ objectFit: "contain", width: "100%", height: "100%" }}
                    />
                </SpeechBubbleImage>
            </Spotlight>
        </Box>
    );
};
