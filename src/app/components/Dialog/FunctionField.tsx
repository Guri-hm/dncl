import { ReactNode, useState } from "react";
import Box from '@mui/material/Box';
import { InputTypeJpEnum, ReturnFunctionArrayForDncl } from '@/app/enum';
import { ReactElement } from "react";
import IconButton from '@mui/material/IconButton';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { keyPrefixEnum, ValidationEnum } from "./Enum";
import { Typography } from "@mui/material";
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import Grid from '@mui/material/Grid2';
import { FixedHeightGrid } from "./FixedHeightGrid";
import { ValidatedTextField } from "./ValidatedTextField";

const TextIcon: React.FC<any & { text: string }> = ({ text, ...props }) => (
  <Typography noWrap {...props}>{text}</Typography>
)

type Props = {
  name?: string
  parentIndex?: number
  event?: any
}

const FunctionArray: React.FC<SvgIconProps>[] = [
  (props) => <NotInterestedIcon {...props} sx={{ color: 'gray', opacity: 0.2 }} />,
  (props) => <TextIcon {...props} text="二乗" />,
  (props) => <TextIcon {...props} text="べき乗" />,
  (props) => <TextIcon {...props} text="乱数" />,
  (props) => <TextIcon {...props} text="二進" />,
];

const NumOfArguments = {
  "UserDefined": 0,
  'Square': 1,
  'Exponentiation': 2,
  'Random': 2,
  'Binary': 1,
}

const getValueByKey = (obj: { [key: string]: number }, index: number): number | undefined => {
  const keys = Object.keys(obj);
  if (index >= 0 && index < keys.length) {
    const key = keys[index];
    return obj[key];
  } else {
    return undefined; // インデックスが範囲外の場合 
  }
};

export function FunctionField({ name = "", parentIndex = 0, event, ...props }: Props) {
  const [operatorIndex, setOperatorIndex] = useState<number>(0);

  let btns: ReactElement = <></>;
  const handleOnClick = () => {
    let newIndex: number = operatorIndex + 1;
    if (operatorIndex == FunctionArray.length - 1) {
      newIndex = 0;
      if (event) event();
    }
    setOperatorIndex(newIndex);
  }

  let SvgIconButton: any;
  let enumValues: any;
  let newIndex: number = operatorIndex;

  if (operatorIndex > FunctionArray.length - 1) {
    setOperatorIndex(0);
    newIndex = 0;
  }

  SvgIconButton = FunctionArray[newIndex];
  enumValues = Object.values(ReturnFunctionArrayForDncl);

  const argumentsCount = getValueByKey(NumOfArguments, newIndex) ?? 0;
  const ArgumentFields: React.ReactNode[] = [];

  for (let i = 0; i < argumentsCount; i++) {
    ArgumentFields.push(
      <>
        {ArgumentFields.length > 0 && <Grid size="auto" key={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${i}_Comma`}><FixedHeightGrid>,</FixedHeightGrid></Grid>}
        <Grid size="grow" key={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${i}`}>
          <ValidatedTextField key={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${i}`}
            name={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${i}`} label={InputTypeJpEnum.Argument} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
        </Grid>
      </>
    );
  }

  if (ArgumentFields.length == 0) {
    ArgumentFields.push(
      <Grid size="grow">
        <ValidatedTextField
          name={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${0}`} label={InputTypeJpEnum.Argument} pattern={ValidationEnum.InitializeArray}></ValidatedTextField>
      </Grid>
    );
  }

  btns = <>
    <IconButton sx={{ padding: 0 }} color="primary" aria-label="comparison-operation">
      <SvgIconButton onClick={handleOnClick}></SvgIconButton>
    </IconButton>
    <input type="hidden" name={`${name}_${parentIndex}_${keyPrefixEnum.Function}`} value={enumValues[newIndex]}></input>
  </>

  return (
    <>
      <Box sx={{
        display: 'grid',
        height: '40px',
        alignItems: 'center',
        marginRight: '0px',
        marginLeft: '0px'
      }}>
        {btns}
      </Box>
      {newIndex == 0 &&
        <Grid size="grow">
          <ValidatedTextField name={`${name}_${parentIndex}_${keyPrefixEnum.FunctionName}`} label={InputTypeJpEnum.Function} pattern={ValidationEnum.Variable}></ValidatedTextField>
        </Grid>
      }

      <Grid size='auto'>
        <FixedHeightGrid>(</FixedHeightGrid>
      </Grid>
      {ArgumentFields}
      <Grid size='auto'>
        <FixedHeightGrid>)</FixedHeightGrid>
      </Grid>
    </>
  );
}
