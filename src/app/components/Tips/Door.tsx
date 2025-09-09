import React, { Dispatch, SetStateAction } from 'react';
import { CustomTooltip } from '@/app/components/CustomTooltip';
import { NextImage } from '@/app/components/NextImage';

interface Props {
    setVisible: Dispatch<SetStateAction<boolean>>;
    title: string;
}

export const Door = ({ setVisible, title = '' }: Props) => {
    return (
        <CustomTooltip title={title} arrow followCursor placement="left">
            <span onClick={() => { setVisible(true) }} style={{ height: '100%' }}>
                <NextImage src={`${process.env.NEXT_PUBLIC_BASE_PATH}/door.webp`} alt={'ドアから覗く'} style={{ objectFit: 'cover' }} />
            </span>
        </CustomTooltip>
    );
};
