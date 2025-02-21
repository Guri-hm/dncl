import { Box, BoxProps } from "@mui/material";
import { FC } from "react";

export const HeaderItem: FC<BoxProps> = ({ children }) => {
    return (
        <Box sx={{
            padding: '0.5rem',
            flex: 'none',
            display: 'flex',
            alignItems: 'center',
        }} >
            {children}
        </Box>
    );
};
