import { useState } from "react";
import Box from '@mui/material/Box';
import ArrowBackIcon from '@mui/icons-material/ArrowBack';
import { AndOrOperatorJpArrayForDncl, ArithmeticOperatorSymbolArrayForJavascript, ComparisonOperatorSymbolArrayForJavascript, NegationOperatorJpArray, OperationEnum } from '@/app/enum';
import { ReactElement } from "react";
import IconButton from '@mui/material/IconButton';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { keyPrefixEnum } from "./Enum";
import { Typography } from "@mui/material";
import NotInterestedIcon from '@mui/icons-material/NotInterested';

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
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"> <rect x="3" y="8" width="18" height="2" fill="currentColor" /> <rect x="3" y="16" width="18" height="2" fill="currentColor" /> </svg>
    </SvgIcon>
  );
}
function NotEqualToOperator(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <line fill="none" stroke="currentColor" strokeWidth="2" x1="2" y1="9.062" x2="22" y2="9.062" />
        <line fill="none" stroke="currentColor" strokeWidth="2" x1="2" y1="15.562" x2="22" y2="15.562" />
        <line fill="none" stroke="currentColor" strokeWidth="2" x1="5.698" y1="3.676" x2="18.302" y2="20.324" />
      </svg>
    </SvgIcon>
  );
}
function GreaterThanOperator(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg"> <polyline points="7,5 17,12 7,19" stroke="currentColor" strokeWidth="2" fill="none" /> </svg>
    </SvgIcon>
  );
}
function GreaterThanOrEqualToOperator(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <polyline points="7,1 17,8 7,15" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="2" y1="17" x2="22" y2="17" stroke="currentColor" strokeWidth="2" />
        <line x1="2" y1="23" x2="22" y2="23" stroke="currentColor" strokeWidth="2" />
      </svg>
    </SvgIcon>
  );
}
function LessThanOperator(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <polyline points="17,5 7,12 17,19" stroke="currentColor" strokeWidth="2" fill="none" />
      </svg>
    </SvgIcon>
  );
}
function LessThanOrEqualToOperator(props: SvgIconProps) {
  return (
    <SvgIcon {...props}>
      <svg width="24" height="24" xmlns="http://www.w3.org/2000/svg">
        <polyline points="17,1 7,8 17,15" stroke="currentColor" strokeWidth="2" fill="none" />
        <line x1="2" y1="17" x2="22" y2="17" stroke="currentColor" strokeWidth="2" />
        <line x1="2" y1="23" x2="22" y2="23" stroke="currentColor" strokeWidth="2" />
      </svg>
    </SvgIcon>
  );
}

const TextIcon: React.FC<any & { text: string }> = ({ text, ...props }) => (
  <Typography noWrap {...props}>{text}</Typography>
)

type Props = {
  type: OperationEnum
  name?: string
  parentIndex?: number
  event?: any
}

const ArithmeticOperatorArray: React.FC<SvgIconProps>[] = [
  AdditionOperator,
  SubtractionOperator,
  MultiplicationOperator,
  DivisionOperator,
  DivisionOperatorQuotient,
  DivisionOperatorRemaining,
];

const ComparisonOperatorArray: React.FC<SvgIconProps>[] = [

  EqualToOperator,
  NotEqualToOperator,
  GreaterThanOperator,
  GreaterThanOrEqualToOperator,
  LessThanOperator,
  LessThanOrEqualToOperator,
];
const LogicalOperatorArray: React.FC<SvgIconProps>[] = [

  (props) => <TextIcon {...props} text="かつ" />,
  (props) => <TextIcon {...props} text="または" />,
];

const NegationOperatorArray: React.FC<SvgIconProps>[] = [

  (props) => <NotInterestedIcon {...props} sx={{ color: 'gray', opacity: 0.2 }} />,
  (props) => <TextIcon {...props} text="でない" />,
];

export function Operator({ type, name = "", parentIndex = 0, event, ...props }: Props) {
  const [operatorIndex, setOperatorIndex] = useState<number>(0);

  let elms: ReactElement = <></>;
  const handleOnClick = () => {
    let newIndex: number = operatorIndex + 1;
    switch (type) {
      case OperationEnum.Arithmetic:
        if (operatorIndex == ArithmeticOperatorArray.length - 1) {
          newIndex = 0;
          if (event) event();
        }
        break;
      case OperationEnum.Comparison:
        if (operatorIndex == ComparisonOperatorArray.length - 1) {
          newIndex = 0;
          if (event) event();
        }
        break;
      case OperationEnum.Logical:
        if (operatorIndex == LogicalOperatorArray.length - 1) {
          newIndex = 0;
          if (event) event();
        }
        break;
      case OperationEnum.Negation:
        if (operatorIndex == NegationOperatorArray.length - 1) {
          newIndex = 0;
        }
        break;
      default:
        break;
    }
    setOperatorIndex(newIndex);
  }

  let SvgIconButton: any;
  let enumValues: any;
  let newIndex: number = operatorIndex;
  switch (type) {
    case OperationEnum.SimpleAssignment:
      elms = <ArrowBackIcon></ArrowBackIcon>
      break;
    case OperationEnum.Arithmetic:
      if (operatorIndex > ArithmeticOperatorArray.length - 1) {
        setOperatorIndex(0);
        newIndex = 0;
      }
      SvgIconButton = ArithmeticOperatorArray[newIndex];
      enumValues = Object.values(ArithmeticOperatorSymbolArrayForJavascript);
      elms = <>
        <IconButton sx={{ padding: 0 }} color="primary" aria-label="arithmetic-operation">
          <SvgIconButton onClick={handleOnClick}></SvgIconButton>
        </IconButton>
        <input type="hidden" name={`${name}_${parentIndex}_${keyPrefixEnum.Operator}`} value={enumValues[newIndex]}></input>
      </>
      break;
    case OperationEnum.Comparison:
      if (operatorIndex > ComparisonOperatorArray.length - 1) {
        setOperatorIndex(0);
        newIndex = 0;
      }
      SvgIconButton = ComparisonOperatorArray[newIndex];
      enumValues = Object.values(ComparisonOperatorSymbolArrayForJavascript);
      elms = <>
        <IconButton sx={{ padding: 0 }} color="primary" aria-label="comparison-operation">
          <SvgIconButton onClick={handleOnClick}></SvgIconButton>
        </IconButton>
        <input type="hidden" name={`${name}_${parentIndex}_${keyPrefixEnum.Operator}`} value={enumValues[newIndex]}></input>
      </>
      break;
    case OperationEnum.Logical:
      if (operatorIndex > LogicalOperatorArray.length - 1) {
        setOperatorIndex(0);
        newIndex = 0;
      }
      SvgIconButton = LogicalOperatorArray[newIndex];
      enumValues = Object.values(AndOrOperatorJpArrayForDncl);
      elms = <>
        <IconButton sx={{ padding: 0 }} color="primary" aria-label="comparison-operation">
          <SvgIconButton onClick={handleOnClick}></SvgIconButton>
        </IconButton>
        <input type="hidden" name={`${name}_${parentIndex}_${keyPrefixEnum.Operator}`} value={enumValues[newIndex]}></input>
      </>
      break;
    case OperationEnum.Negation:
      SvgIconButton = NegationOperatorArray[newIndex];
      enumValues = Object.values(NegationOperatorJpArray);
      elms = <>
        <IconButton sx={{ padding: 0 }} color="primary" aria-label="comparison-operation">
          <SvgIconButton onClick={handleOnClick}></SvgIconButton>
        </IconButton>
        <input type="hidden" name={`${name}_${parentIndex}_${keyPrefixEnum.Negation}`} value={enumValues[newIndex]}></input>
      </>
      break;
    case OperationEnum.JoinString:
      elms = <>
        <Typography color="primary" fontWeight={700}>と</Typography>
        <input type="hidden" name={`${name}_${parentIndex}_${keyPrefixEnum.Operator}`}></input>
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
      marginRight: '0px',
      marginLeft: '0px'
    }}>
      {elms}
    </Box>
  );
}
