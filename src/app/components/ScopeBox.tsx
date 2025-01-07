// components/ScopeBox.tsx
import React from 'react';
import Box from '@mui/material/Box';
import { styled } from '@mui/system';

interface ScopeBoxProps {
    children: React.ReactNode;
    nested?: boolean;
}

const StyledDiv = styled(Box, {
    shouldForwardProp: (prop) => prop !== 'nested',
})<ScopeBoxProps>(({ nested }) => ({
    position: 'relative',
    // paddingLeft: nested ? '20px' : '0px',
    '& > div': {
        borderLeft: '2px solid white',
        paddingLeft: '1.5rem',
        marginLeft: '0.5rem'
    },
    '& > div:not(:first-of-type):not(:last-of-type)': {
    },
}));

const ScopeBox: React.FC<ScopeBoxProps> = ({ children, nested = false }) => {
    return <StyledDiv nested={nested}>{children}</StyledDiv>;
};

export default ScopeBox;
