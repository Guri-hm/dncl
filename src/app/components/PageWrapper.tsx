import { Box, BoxProps } from "@mui/material";
import { FC } from "react";
import styles from '@/app/components/common.module.css';

export const PageWrapper: FC<BoxProps> = ({ children }) => {
    return (
        <Box className={`${styles.bgSlate900} ${styles.dFlex} ${styles.flexColumn} ${styles.wFull}`} sx={{
            height: '100vh',
            borderRadius: '0.75rem',
        }} >
            {children}
        </Box>
    );
};
