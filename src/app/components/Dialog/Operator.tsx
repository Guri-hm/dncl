import { useState } from "react";
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { OperatorEnum } from '@/app/enum';
import { ReactElement } from "react";
import IconButton from '@mui/material/IconButton';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';

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
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" strokeLinecap="round" strokeLinejoin="round" className="feather feather-slash"> <line x1="19" y1="5" x2="5" y2="19"></line> </svg>
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

type Props = {
  type: OperatorEnum
}

const ArithmeticOperatorArray: React.FC<SvgIconProps>[] = [
  AdditionOperator,
  SubtractionOperator,
  MultiplicationOperator,
  DivisionOperator,
  DivisionOperatorQuotient,
  DivisionOperatorRemaining
];

export function Operator({ type, ...props }: Props) {
  const [index, setIndex] = useState<number>(0);

  let icon: ReactElement = <></>;
  const handleOnClick = () => {
    let newIndex: number = index + 1;
    switch (type) {
      case OperatorEnum.ArithmeticOperation:
        if (index == ArithmeticOperatorArray.length - 1) {
          newIndex = 0;
        }
        break;
      default:
        break;
    }
    setIndex(newIndex);
  }

  switch (type) {
    case OperatorEnum.SimpleAssignment:
      icon = <ArrowBackIcon></ArrowBackIcon>
      break;
    case OperatorEnum.ArithmeticOperation:
      const SpecificIcon = ArithmeticOperatorArray[index];
      icon = <IconButton color="primary" aria-label="arithmetic-operation">
        <SpecificIcon onClick={handleOnClick}></SpecificIcon>
      </IconButton>
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
      {icon}
    </Box>
  );
}
