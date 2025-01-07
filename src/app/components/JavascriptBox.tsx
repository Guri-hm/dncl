import { Box, BoxProps } from "@mui/material";
import { FC } from "react";
import { TreeItems } from "../types";

interface CustomBoxProps extends BoxProps {
    children: React.ReactNode;
    treeItems: TreeItems;
}

export const JavascriptBox: FC<CustomBoxProps> = ({ treeItems, children, sx, ...props }) => {
    console.log(treeItems)
    return (
        <Box sx={{
            ...sx,
        }} {...props} >
            {children}


        </Box>
    );
};
