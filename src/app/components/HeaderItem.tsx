import { Box, BoxProps } from "@mui/material";
import { FC } from "react";
import styles from '@/app/components/common.module.css';

export const HeaderItem: FC<BoxProps> = ({ children }) => {
    return (
        <Box className={`${styles.dFlex}`} sx={{
            padding: '0.5rem',
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
        }} >
            {children}
        </Box>
    );
};
