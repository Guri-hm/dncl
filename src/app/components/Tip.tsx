import React from 'react';
import Spotlight from './Spotlight';
import SpeechBubbleImage from './SpeechBubbleImage';
import { Box } from '@mui/material';

interface Props {
    visible?: boolean;
}

const Tip = ({ visible = true }: Props) => {
    return (
        <Box sx={{ display: `${visible ? 'block' : 'none'}` }}>

            <Spotlight>
                <SpeechBubbleImage msg='ここにヒントを表示します'>
                    <img src="/look_back.svg" alt="ヒントを出す" style={{ width: '100%' }}></img>
                </SpeechBubbleImage>
            </Spotlight>
        </Box>
    );
};

export default Tip;