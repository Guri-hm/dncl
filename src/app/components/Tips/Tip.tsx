import React from 'react';
import {SpeechBubbleImage,Spotlight} from '@/app/components/Tips';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    onClose?: any;
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
                        }} onClick={onClose}>
                            <CloseIcon />
                        </IconButton>
                    }
                    <img src="/look_back.svg" alt="ヒントを出す" style={{ width: '100%' }}></img>
                </SpeechBubbleImage>
            </Spotlight>
        </Box>
    );
};
