import { Box, BoxProps } from "@mui/material";
import { FC } from "react";
import { TreeItems } from "../types";
import * as wanakana from 'wanakana';

interface CustomBoxProps extends BoxProps {
    children: React.ReactNode;
    treeItems: TreeItems;
}

export const JavascriptBox: FC<CustomBoxProps> = ({ treeItems, children, sx, ...props }) => {
    console.log(treeItems)
    const romajiFromHiragana = wanakana.toRomaji("あいうえお");
    const aaa = wanakana.toRomaji("apple()");
    console.log(romajiFromHiragana)
    console.log(aaa)
    return (
        <Box sx={{
            ...sx,
        }} {...props} >
            {children}
        </Box>
    );
};
