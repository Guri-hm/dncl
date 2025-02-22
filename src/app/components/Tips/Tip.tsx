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
                            right: -10,
                            top: -20,
                        }} onClick={() => onClose(false)}>
                            <CloseIcon />
                        </IconButton>
                    }
                    <Image
                        src="/look_back.svg"
                        alt="ヒントを出す"
                        layout="responsive"
                        width={300}
                        height={300}
                        style={{ width: "100%" }}
                    />
                </SpeechBubbleImage>
            </Spotlight>
        </Box>
    );
};
