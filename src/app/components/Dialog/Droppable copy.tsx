import { Box, BoxProps } from "@mui/material";
import { FC } from "react";

interface CustomBoxProps extends BoxProps { children: React.ReactNode; }

export const CustomBox: FC<CustomBoxProps> = ({ children, sx, ...props }) => {
    return (
        <Box sx={{
            display: 'flex',
            flexDirection: 'row',
            p: 1,
            m: 1,
            bgcolor: 'background.paper',
            borderRadius: 1,
            ...sx,
        }} {...props} >
            {children}
        </Box>
    );
};
