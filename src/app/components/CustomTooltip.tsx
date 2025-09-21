import React from 'react';
import { Tooltip, tooltipClasses, TooltipProps } from "@mui/material";
import { styled } from '@mui/system';

type CustomTooltipProps = TooltipProps & {
    arrowDirection?: 'right' | 'left' | 'top' | 'bottom';
};

export const CustomTooltip = styled(({ className, arrowDirection, ...props }: CustomTooltipProps) => (
    <Tooltip {...props} classes={{ popper: className }} />
))<CustomTooltipProps>(({ arrowDirection = 'right' }) => {
    return {
        [`& .${tooltipClasses.tooltip}`]: {
            backgroundColor: 'white',
            color: 'rgba(0, 0, 0, 1)',
            boxShadow: '0px 2px 4px rgba(0,0,0,0.2)',
            fontSize: '1rem',
            borderRadius: '10px',
            padding: '10px',
            position: 'relative',
            '&::after': {
                content: '""',
                position: 'absolute',
                ...(arrowDirection === 'right' && {
                    top: '50%',
                    left: '100%',
                    transform: 'translateY(-50%)',
                    borderWidth: '5px 0 5px 15px',
                    borderStyle: 'solid',
                    borderColor: 'transparent transparent transparent var(--stone-50)',
                }),
                ...(arrowDirection === 'top' && {
                    bottom: '75%',
                    left: '50%',
                    transform: 'rotate(45deg)',
                    borderWidth: '0 5px 15px 15px',
                    borderStyle: 'solid',
                    borderColor: 'transparent transparent transparent var(--stone-50)',
                }),
            },
        },
    };
});