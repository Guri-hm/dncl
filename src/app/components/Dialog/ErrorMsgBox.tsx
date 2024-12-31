import { Theme } from "@emotion/react";
import { Box, FormHelperText, SxProps } from "@mui/material";
import { FC, ReactNode } from "react";

type BoxProps = {
    errorArray: string[];
    children?: ReactNode;
    sx?: SxProps<Theme>;

};

export const ErrorMsgBox: FC<BoxProps> = ({ sx, errorArray }) => {
    return (
        <Box>
            <FormHelperText sx={[
                ...(Array.isArray(sx) ? sx : [sx]),
            ]} error >
                {errorArray.map((error, index) => (
                    <span key={index}> {error} </span>)
                )}
            </FormHelperText>
        </Box>
    );
};
