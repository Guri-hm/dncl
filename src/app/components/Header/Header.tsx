import { Box, BoxProps } from "@mui/material";
import { FC } from "react";

export const Header: FC<BoxProps> = ({ children }) => {
    return (
        <Box sx={{
            flexBasis: '0%',
        }} >
            {children}
        </Box>
    );
};
