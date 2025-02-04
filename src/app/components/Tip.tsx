import React from 'react';
import Spotlight from './Spotlight';
import SpeechBubbleImage from './SpeechBubbleImage';
import { Box, IconButton } from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';

interface Props {
    onClose?: any;
    hint?: string
}

const Tip = ({ onClose, hint = "ヒントなし" }: Props) => {
    return (
        <Box>

            <Spotlight>
                <SpeechBubbleImage msg={hint}>
                    {onClose &&
                        <IconButton aria-label="close" sx={{
                            position: 'absolute',
                            right: -10,
                            top: -10,
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

export default Tip;