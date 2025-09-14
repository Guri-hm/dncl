import { Box, BoxProps } from "@mui/material";
import { FC, ReactNode } from "react";

interface HeaderBarProps extends Omit<BoxProps, 'children'> {
    leftContent?: ReactNode;
    rightContent?: ReactNode;
    children?: ReactNode;
}

export const HeaderBar: FC<HeaderBarProps> = ({
    leftContent,
    rightContent,
    children,
    sx,
    ...props
}) => (
    <Box
        sx={{
            padding: '0.5rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: leftContent || rightContent ? 'space-between' : 'flex-start',
            width: '100%',
            backgroundColor: 'var(--slate-900)',
            ...sx,
        }}
        {...props}
    >
        {leftContent || rightContent ? (
            <>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {leftContent}
                </Box>
                <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                    {rightContent}
                </Box>
            </>
        ) : (
            children
        )}
    </Box>
);