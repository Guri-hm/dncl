import React from 'react';
import Spotlight from './Spotlight';
import SpeechBubbleImage from './SpeechBubbleImage';

const DropHere = () => {
    return (
        <Spotlight>
            <SpeechBubbleImage msg='ここにドロップします'>
                <img src="/raise_one_hand.svg" alt="手をあげる" style={{ width: '100%' }}></img>
            </SpeechBubbleImage>
        </Spotlight>
    );
};

export default DropHere;