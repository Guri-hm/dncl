import React from 'react';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

export const UnachievedIcon: React.FC<SvgIconProps> = (props) => (
    <SvgIcon {...props} viewBox="0 0 24 24">
        <text x="2" y="20" fontSize="20" fill="currentColor">未</text>
    </SvgIcon>
);
