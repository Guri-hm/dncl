import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { OperatorEnum } from "../../types";
import { ReactElement } from "react";

type Props = {
  type: OperatorEnum
}

export function Operator({ type, ...props }: Props) {

  let icon: ReactElement = <></>;

  switch (type) {
    case OperatorEnum.SimpleAssignment:
      icon = <ArrowBackIcon></ArrowBackIcon>
      break;
    default:
      break;
  }

  return (
    <Box sx={{
      display: 'grid',
      height: '40px',
      alignItems: 'center',
      marginRight: '2px',
      marginLeft: '2px'

    }}>
      {icon}
    </Box>
  );
}
