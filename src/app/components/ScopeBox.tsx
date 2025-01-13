// components/ScopeBox.tsx
import React from 'react';
import Box, { BoxProps } from '@mui/material/Box';
import { styled } from '@mui/system';

interface ScopeBoxProps extends BoxProps {
    children: React.ReactNode;
    nested?: boolean;
    depth: number;
}

const StyledDiv = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'nested',
})<ScopeBoxProps>(({ nested, depth }) => ({
    '& > div': {
        paddingLeft: '1.5rem',
        marginLeft: '0.5rem'
    },
    '& > div::before': {
        left: `-${depth * 2}rem`,
        whiteSpace: 'pre'
    },
}));

const ScopeBox: React.FC<ScopeBoxProps> = ({ children, nested = false, depth }) => {
    if (!children) {
        return null;
    }
    return <StyledDiv nested={nested} depth={depth}>{children}</StyledDiv>;
};

export default ScopeBox;
