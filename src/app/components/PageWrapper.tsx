import { Box, BoxProps, useTheme } from "@mui/material";
import { FC } from "react";
import styles from '@/app/components/common.module.css';

export const PageWrapper: FC<BoxProps> = ({ children }) => {
    const theme = useTheme();
    const bgColor =
        theme.palette.mode === 'dark'
            ? 'var(--slate-800)'
            : 'var(--stone-50)';
    return (
        <Box className={`${styles.dFlex} ${styles.flexColumn} ${styles.wFull}`} sx={{
            height: '100vh',
            borderRadius: '0.75rem',
            backgroundColor: bgColor,
        }} >
            {children}
        </Box>
    );
};
