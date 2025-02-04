import { Typography, TypographyProps } from "@mui/material";
import { FC } from "react";

export const Question: FC<TypographyProps> = ({ children }) => {
    return (
        <Typography variant="h2" sx={{ fontSize: '1.7rem', color: 'white', fontWeight: 800, padding: 1 }}>
            {children}
        </Typography>
    );
};
