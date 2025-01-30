import React from 'react';
import { Tooltip, tooltipClasses, TooltipProps } from "@mui/material";
import { styled } from '@mui/system';

export const CustomTooltip = styled(({ className, ...props }: TooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))(() => {
    return {
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: 'var(--stone-50)',
            color: 'rgba(0, 0, 0, 1)',
            boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
            fontSize: 11,
            borderRadius: '10px',
            padding: '10px',
            position: 'relative',
            '&::after': {
                content: '""',
                position: 'absolute',
                top: '50%',
                left: '100%',
                transform: 'translateY(-50%)',
                borderWidth: '5px 0 5px 15px',
                borderStyle: 'solid',
                borderColor: 'transparent transparent transparent var(--stone-50)',
            },
        },
    };
});