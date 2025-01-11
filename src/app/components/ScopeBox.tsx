// components/ScopeBox.tsx
import React from 'react';
import Box from '@mui/material/Box';
import { fontStyle, fontWeight, styled } from '@mui/system';

interface ScopeBoxProps {
    children: React.ReactNode;
    nested?: boolean;
    depth: number;
}

const StyledDiv = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'nested',
})<ScopeBoxProps>(({ nested, depth }) => ({
    '::before': {
        left: '-1.5rem',
    },
    // paddingLeft: nested ? '20px' : '0px',
    '& > div': {
        borderLeft: '2px solid white',
        paddingLeft: '1.5rem',
    },
    '& > div::before': {
        left: `-${depth * 1.5}rem`,
        marginLeft: `-${depth * 2}px`,
        //左側の線の太さと数に合わせる
    },

}));

const ScopeBox: React.FC<ScopeBoxProps> = ({ children, nested = false, depth }) => {
    return <StyledDiv nested={nested} depth={depth}>{children}</StyledDiv>;
};

export default ScopeBox;
