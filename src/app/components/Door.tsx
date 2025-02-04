import React from 'react';
import { CustomTooltip } from './CustomTooltip';
import { NextImage } from './NextImage';

interface Props {
    setVisible: any;
    title: string;
}

const Door = ({ setVisible, title = '' }: Props) => {
    return (
        <CustomTooltip title={title} arrow followCursor placement="left">
            <span onClick={setVisible} >
                <NextImage src={"/door.svg"} alt={'ドアから覗く'} objectFit="cover" />
            </span>
        </CustomTooltip>
    );
};

export default Door;