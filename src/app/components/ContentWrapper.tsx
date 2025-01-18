import { Box, BoxProps } from "@mui/material";
import { FC } from "react";

export const ContentWrapper: FC<BoxProps> = ({ children }) => {
    return (
        <Box sx={{
            flexGrow: 1,
        }} >
            {children}
        </Box>
    );
};
