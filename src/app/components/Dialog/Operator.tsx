import { useState } from "react";
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { OperationEnum } from '@/app/enum';
import { ReactElement } from "react";
import IconButton from '@mui/material/IconButton';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { keyPrefixEnum } from "./Enum";
import { Typography } from "@mui/material";

function AdditionOperator(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-plus"> <line x1="12" y1="5" x2="12" y2="19"></line> <line x1="5" y1="12" x2="19" y2="12"></line> </svg>
    </SvgIcon>
  );
}
function SubtractionOperator(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-minus"><line x1="5" y1="12" x2="19" y2="12"></line></svg>
    </SvgIcon>
  );
}

function DivisionOperatorQuotient(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-divide"> <circle cx="12" cy="6" r="2"></circle> <line x1="5" y1="12" x2="19" y2="12"></line> <circle cx="12" cy="18" r="2"></circle> </svg>
    </SvgIcon>
  );
}
function DivisionOperatorRemaining(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-percent"> <line x1="19" y1="5" x2="5" y2="19"></line> <circle cx="6.5" cy="6.5" r="2.5"></circle> <circle cx="17.5" cy="17.5" r="2.5"></circle> </svg>
    </SvgIcon>
  );
}
function DivisionOperator(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-slash"> <line x1="19" y1="5" x2="5" y2="19"></line> </svg>
    </SvgIcon>
  );
}
function MultiplicationOperator(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-x"> <line x1="18" y1="6" x2="6" y2="18"></line> <line x1="6" y1="6" x2="18" y2="18"></line> </svg>
    </SvgIcon>
  );
}
function EqualToOperator(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"> <rect x="10" y="30" width="80" height="10" fill="black" /> <rect x="10" y="60" width="80" height="10" fill="black" /> </svg>
    </SvgIcon>
  );
}
function NotEqualToOperator(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"> <line x1="10" y1="20" x2="90" y2="80" stroke="black" stroke-width="10" /> <line x1="10" y1="30" x2="90" y2="30" stroke="black" stroke-width="10" /> <line x1="10" y1="70" x2="90" y2="70" stroke="black" stroke-width="10" /> </svg>
    </SvgIcon>
  );
}
function GreaterThanOperator(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"> <polyline points="30,20 70,50 30,80" stroke="black" strokeWidth="10" fill="none" /> </svg>
    </SvgIcon>
  );
}
function GreaterThanorEqualToOperator(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"> <polyline points="30,20 70,50 30,80" stroke="black" strokeWidth="10" fill="none" /> <line x1="10" y1="90" x2="90" y2="90" stroke="black" strokeWidth="10" /> </svg>
    </SvgIcon>
  );
}
function LessThanOperator(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"> <polyline points="70,20 30,50 70,80" stroke="black" strokeWidth="10" fill="none" /> </svg>
    </SvgIcon>
  );
}
function LessThanorEqualToOperator(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg width="100" height="100" xmlns="http://www.w3.org/2000/svg"> <polyline points="70,20 30,50 70,80" stroke="black" strokeWidth="10" fill="none" /> <line x1="10" y1="90" x2="90" y2="90" stroke="black" strokeWidth="10" /> </svg>
    </SvgIcon>
  );
}
type Props = {
  type: OperationEnum
  name?: string
  parentIndex?: number
}

const ArithmeticOperatorArray: React.FC<SvgIconProps>[] = [
  AdditionOperator,
  SubtractionOperator,
  MultiplicationOperator,
  DivisionOperator,
  DivisionOperatorQuotient,
  DivisionOperatorRemaining
];

const ComparisonOperatorArray: React.FC<SvgIconProps>[] = [
  EqualToOperator,
  NotEqualToOperator,
  GreaterThanOperator,
  GreaterThanorEqualToOperator,
  LessThanOperator,
  LessThanorEqualToOperator
];

export function Operator({ type, name = "", parentIndex = 0, ...props }: Props) {
  const [operatorIndex, setOperatorIndex] = useState<number>(0);

  let elms: ReactElement = <></>;
  const handleOnClick = () => {
    let newIndex: number = operatorIndex + 1;
    switch (type) {
      case OperationEnum.Operation:
        if (operatorIndex == ArithmeticOperatorArray.length - 1) {
          newIndex = 0;
        }
        break;
      default:
        break;
    }
    setOperatorIndex(newIndex);
  }

  switch (type) {
    case OperationEnum.SimpleAssignment:
      elms = <ArrowBackIcon></ArrowBackIcon>
      break;
    case OperationEnum.Operation:
      const SpecificIcon = ArithmeticOperatorArray[operatorIndex];
      elms = <IconButton color="primary" aria-label="arithmetic-operation">
        <SpecificIcon onClick={handleOnClick}></SpecificIcon>
        <input type="hidden" name={`${name}_${keyPrefixEnum.Operator}_${parentIndex}`}></input>
      </IconButton>
      break;
    case OperationEnum.JoinString:
      elms = <>
        <Typography color="primary" fontWeight={700}>と</Typography>
      </>
      break;
    default:
      return;
  }

  return (
    <Box sx={{
      display: 'grid',
      height: '40px',
      alignItems: 'center',
      marginRight: '2px',
      marginLeft: '2px'

    }}>
      {elms}
    </Box>
  );
}
