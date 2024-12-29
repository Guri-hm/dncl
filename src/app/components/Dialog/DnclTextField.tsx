import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { useState } from "react";
import Box from '@mui/material/Box';
import { keyPrefixEnum, inputTypeEnum, ValidationEnum } from "./Enum";
import Grid from '@mui/material/Grid2';
import { ValidatedTextField } from "./ValidatedTextField";
import { FixedHeightGrid } from './FixedHeightGrid';
import { FormControlLabel, Radio, RadioGroup } from '@mui/material';

export interface DnclTextFieldProps {
  label?: string | inputTypeEnum
  name: string
  index?: number
  inputType?: inputTypeEnum
  value?: string
  leftOfTermValue?: string[]
  rightOfTermValue?: string[]
  suffixValue?: string
}

enum inputTypeJpEnum {
  Switch = '変数名・配列名',
  ArrayWithoutSuffix = '配列名',
  Array = '配列名',
  SuffixOnly = '添字',
  SuffixWithBrackets = '添字',
  VariableOnly = '変数名',
  VariableOrNumber = '値・変数名',
  String = '文字列',
}
enum SwitchJpEnum {
  VariableOrNumber = '値・変数',
  Array = '配列',
  String = '文字列',
}
enum SwitchEnum {
  VariableOrNumber = 'VariableOrNumber',
  Array = 'Array',
  String = 'String',
}

const AntSwitch = styled(Switch)(({ theme }) => ({
  width: 28,
  height: 16,
  padding: 0,
  display: 'flex',
  '&:active': {
    '& .MuiSwitch-thumb': {
      width: 15,
    },
    '& .MuiSwitch-switchBase.Mui-checked': {
      transform: 'translateX(9px)',
    },
  },
  '& .MuiSwitch-switchBase': {
    padding: 2,
    '&.Mui-checked': {
      transform: 'translateX(12px)',
      color: '#fff',
      '& + .MuiSwitch-track': {
        opacity: 1,
        backgroundColor: '#1890ff',
        ...theme.applyStyles('dark', {
          backgroundColor: '#177ddc',
        }),
      },
    },
  },
  '& .MuiSwitch-thumb': {
    boxShadow: '0 2px 4px 0 rgb(0 35 11 / 20%)',
    width: 12,
    height: 12,
    borderRadius: 6,
    transition: theme.transitions.create(['width'], {
      duration: 200,
    }),
  },
  '& .MuiSwitch-track': {
    borderRadius: 16 / 2,
    opacity: 1,
    backgroundColor: 'rgba(0,0,0,.25)',
    boxSizing: 'border-box',
    ...theme.applyStyles('dark', {
      backgroundColor: 'rgba(255,255,255,.35)',
    }),
  },
}));

export function DnclTextField({ name, inputType, index = 0, ...params }: DnclTextFieldProps) {

  const [checked, setChecked] = useState(false);
  const [radioValue, setRadioValue] = useState<SwitchEnum>(SwitchEnum.VariableOrNumber);

  const handleChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
  const handleChangeRadio = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRadioValue((event.target as HTMLInputElement).value as SwitchEnum);;
  };

  let label: string = "";
  let pattern: ValidationEnum = ValidationEnum.Variable;

  const renderContent = () => {

    switch (inputType) {
      case inputTypeEnum.SwitchVariableOrArray:
      case inputTypeEnum.SwitchVariableOrNumberOrArray:


        switch (inputType) {
          case inputTypeEnum.SwitchVariableOrArray:
            label = checked ? inputTypeJpEnum.Array : inputTypeJpEnum.VariableOnly;
            pattern = checked ? ValidationEnum.Array : ValidationEnum.Variable;
            break;
          case inputTypeEnum.SwitchVariableOrNumberOrArray:
            label = checked ? inputTypeJpEnum.Array : inputTypeJpEnum.VariableOrNumber;
            pattern = checked ? ValidationEnum.Array : ValidationEnum.VariableOrNumber;
            break;
          default:
            break;
        }

        //変数と配列を切り替え可能
        return (
          <>
            <Grid container spacing={0} direction='column'>
              <Grid container direction='row'>
                <Grid size='grow'>
                  <ValidatedTextField name={`${name}_${index}`} label={label} pattern={pattern}></ValidatedTextField>
                </Grid>
                {checked &&
                  <Grid container size='grow'>
                    <FixedHeightGrid>[</FixedHeightGrid>
                    <Grid size="grow">
                      <ValidatedTextField
                        name={`${name}_${keyPrefixEnum.Suffix}_${index}`} label={inputTypeJpEnum.SuffixOnly} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
                    </Grid>
                    <FixedHeightGrid>]</FixedHeightGrid>
                  </Grid>
                }
              </Grid>
              <Grid>
                <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                  <AntSwitch onChange={(handleChangeSwitch)} inputProps={{ 'aria-label': 'ant design' }} />
                  <Typography>{SwitchJpEnum.Array}</Typography>
                </Stack>
              </Grid>
            </Grid>
          </>
        );

      case inputTypeEnum.Radio:

        switch (radioValue) {
          case SwitchEnum.VariableOrNumber:
            label = inputTypeJpEnum.VariableOrNumber;
            pattern = ValidationEnum.VariableOrNumber;
            break;
          case SwitchEnum.Array:
            label = inputTypeJpEnum.Array;
            pattern = ValidationEnum.Array;
            break;
          case SwitchEnum.String:
            label = inputTypeJpEnum.String;
            pattern = ValidationEnum.String;
            break;
          default:
            break;
        }

        //変数と配列を切り替え可能
        return (
          <>
            <Grid container spacing={0} direction='column'>
              <Grid container direction='row'>
                <Grid size='grow'>
                  <ValidatedTextField name={`${name}_${index}`} label={label} pattern={pattern}></ValidatedTextField>
                </Grid>
                {radioValue == SwitchEnum.Array &&
                  <Grid container size='grow'>
                    <FixedHeightGrid>[</FixedHeightGrid>
                    <Grid size="grow">
                      <ValidatedTextField
                        name={`${name}_${keyPrefixEnum.Suffix}_${index}`} label={inputTypeJpEnum.SuffixOnly} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
                    </Grid>
                    <FixedHeightGrid>]</FixedHeightGrid>
                  </Grid>
                }
              </Grid>
              <Grid>
                <RadioGroup
                  row
                  aria-labelledby="row-radio-buttons-group-label"
                  name="row-radio-buttons-group"
                  onChange={handleChangeRadio}
                  defaultValue={SwitchEnum.VariableOrNumber}
                >
                  <FormControlLabel value={SwitchEnum.VariableOrNumber} control={<Radio size="small" />} label={SwitchJpEnum.VariableOrNumber} />
                  <FormControlLabel value={SwitchEnum.Array} control={<Radio size="small" />} label={SwitchJpEnum.Array} />
                  <FormControlLabel value={SwitchEnum.String} control={<Radio size="small" />} label={SwitchJpEnum.String} />
                </RadioGroup>
              </Grid>
            </Grid>
          </>
        );
      case inputTypeEnum.VariableOnly:
        return <Grid size="grow">
          <ValidatedTextField name={`${name}_${index}`} label={inputTypeJpEnum.VariableOnly} pattern={ValidationEnum.Variable}></ValidatedTextField>
        </Grid>
      case inputTypeEnum.SuffixOnly:
        return <Grid size="grow">
          <ValidatedTextField name={`${name}_${keyPrefixEnum.Suffix}_${index}`} label={inputTypeJpEnum.VariableOrNumber} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
        </Grid>
      case inputTypeEnum.ArrayWithoutSuffix:
        return <Grid size="grow">
          <ValidatedTextField name={`${name}_${index}`} label={inputTypeJpEnum.Array} pattern={ValidationEnum.VariableOrArray}></ValidatedTextField>
        </Grid>

      case inputTypeEnum.Array:
        return <Grid container spacing={0}>
          <Grid size={'grow'}>
            <ValidatedTextField name={`${name}_${index}`} label={inputTypeJpEnum.ArrayWithoutSuffix} pattern={ValidationEnum.Variable}></ValidatedTextField>
          </Grid>
          <Grid container size='auto'>
            <FixedHeightGrid>[</FixedHeightGrid>
            <Grid size="grow">
              <ValidatedTextField sx={() => ({
                width: '100px',
              })}
                name={`${name}_${keyPrefixEnum.Suffix}_${index}`} label={inputTypeJpEnum.SuffixOnly} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
            </Grid>
            <FixedHeightGrid>]</FixedHeightGrid>
          </Grid>
        </Grid>
      case inputTypeEnum.SuffixWithBrackets:
        return <Grid container size='auto'>
          <FixedHeightGrid>[</FixedHeightGrid>
          <Grid size="grow">
            <ValidatedTextField name={`${name}_${keyPrefixEnum.Suffix}_${index}`} label={params.label} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
          </Grid>
          <FixedHeightGrid>]</FixedHeightGrid>
        </Grid>;
      case inputTypeEnum.InitializeArray:
        return <Grid container size='auto'>
          <FixedHeightGrid>[</FixedHeightGrid>
          <Grid size="grow">
            <ValidatedTextField name={`${name}_${keyPrefixEnum.Suffix}_${index}`} label={params.label} pattern={ValidationEnum.InitializeArray}></ValidatedTextField>
          </Grid>
          <FixedHeightGrid>]</FixedHeightGrid>
        </Grid>;
      case inputTypeEnum.VariableOrNumber:
        return <Grid size="grow">
          <ValidatedTextField name={`${name}_${keyPrefixEnum.Suffix}_${index}`} label={inputTypeJpEnum.VariableOrNumber} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
        </Grid>
      default:
        return null;

    }
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      {renderContent()}
    </Box>
  );
}