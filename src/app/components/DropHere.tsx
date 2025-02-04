import React from 'react';
import Spotlight from './Spotlight';
import SpeechBubbleImage from './SpeechBubbleImage';
import { Box } from '@mui/material';

interface Props {
    visible?: boolean;
}

const DropHere = ({ visible = true }: Props) => {
    return (
        <Box sx={{ display: `${visible ? 'block' : 'none'}` }}>
            <Spotlight>
                <SpeechBubbleImage msg='ここにドロップします'>
                    <img src="/raise_one_hand.svg" alt="手をあげる" style={{ width: '100%' }}></img>
                </SpeechBubbleImage>
            </Spotlight>
        </Box>
    );
};

export default DropHere;