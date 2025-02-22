import { Button, ButtonProps } from "@mui/material";
import { FC } from "react";

export const HeaderButton: FC<ButtonProps> = ({ endIcon, onClick, children }) => {
    return (
        <Button
            sx={{ backgroundColor: 'var(--stone-50)', marginLeft: 'auto', color: 'var(--foreground)' }}
            onClick={onClick}
            endIcon={endIcon}
            variant="contained"
        >
            {children}
        </Button>
    );
};
