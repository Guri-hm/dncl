import { FC, useState } from "react";
import Box, { BoxProps } from '@mui/material/Box';
import { ReactElement } from "react";
import { Typography } from "@mui/material";

interface CustomBoxProps extends BoxProps { children: React.ReactNode; }

export const EmphasiseBox: FC<CustomBoxProps> = ({ children, sx, ...props }) => {

  let elms: ReactElement = <></>;
  elms = <>
    <Typography color="primary" fontWeight={700}>{children}</Typography>
  </>

  return (
    <Box sx={{
      display: 'grid',
      height: '40px',
      alignItems: 'center',
      marginRight: '0px',
      marginLeft: '0px'
    }}>
      {elms}
    </Box>
  );
}
