import React from 'react';
import { CustomTooltip } from '@/app/components/CustomTooltip';
import { NextImage } from '@/app/components/NextImage';

interface Props {
    setVisible: any;
    title: string;
}

export const Door = ({ setVisible, title = '' }: Props) => {
    return (
        <CustomTooltip title={title} arrow followCursor placement="left">
            <span onClick={setVisible} style={{ height: '100%' }}>
                <NextImage src={"/door.svg"} alt={'ドアから覗く'} style={{ objectFit: 'cover' }} />
            </span>
        </CustomTooltip>
    );
};
