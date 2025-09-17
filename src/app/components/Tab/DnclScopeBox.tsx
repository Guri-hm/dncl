// components/ScopeBox.tsx
import React from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';

interface ScopeBoxProps {
    children: React.ReactNode;
    nested?: boolean;
    depth: number;
}

const StyledDiv = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'nested',
})<ScopeBoxProps>(({ theme, nested, depth }) => ({
    '::before': {
        left: '-1.5rem',
    },
    // paddingLeft: nested ? '20px' : '0px',
    '& > div': {
        borderLeft: `${theme.palette?.mode === 'dark' ? '2' : '1'}px solid ${theme.palette?.mode === 'dark' ? 'white' : 'var(--foreground)'}`,
        paddingLeft: '1.5rem',
        marginLeft: '0.5rem'
    },
    '& > div::before': {
        left: `-${depth * 1.5}rem`,
        marginLeft: `-${depth * 2 + 8}px`,
        //左側の線の太さと数に合わせる
    },

}));

const DnclScopeBox: React.FC<ScopeBoxProps> = ({ children, nested = false, depth }) => {
    return <StyledDiv nested={nested} depth={depth}>{children}</StyledDiv>;
};

export default DnclScopeBox;
