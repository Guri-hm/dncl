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
import { FormControlLabel, FormHelperText, makeStyles, Radio, RadioGroup, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { InputTypeJpEnum, OperationEnum } from '@/app/enum';
import { FunctionField } from './FunctionField';
import { TreeItems } from '@/app/types';

export interface DnclTextFieldProps {
  label?: string | inputTypeEnum
  name: string
  inputType?: inputTypeEnum
  index?: number
  suffixValue?: string
  treeItems?: TreeItems
  leftOfOperandValue?: string[]
  rightOfOperandValue?: string[]
  operator?: OperationEnum
  value?: string
}


enum SwitchJpEnum {
  VariableOrNumber = '値・変数',
  Array = '配列',
  String = '文字列',
  Function = '関数',
  Boolean = '真偽',
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

const CustomToggleButtonGroup = styled(ToggleButtonGroup)`
  width: 100%;
`;

const CustomToggleButton = styled(ToggleButton)`
  width: 50%;
  &.Mui-selected {
    background-color: ${props => props.theme.palette.primary.main};
    color: white;
  }
`;

export function DnclTextField({ label, name, inputType, index = 0, suffixValue, treeItems }: DnclTextFieldProps) {

  const [checked, setChecked] = useState(false);
  const [radioValue, setRadioValue] = useState<inputTypeEnum>(inputTypeEnum.VariableOrNumber);
  const [boolString, setBoolString] = useState<string>('true');

  const handleChangeToggle = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string,
  ) => {
    if (newValue !== null) {
      setBoolString(newValue);
    }
  };
  const handleChangeSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
  };
  const handleChangeRadio = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRadioValue((event.target as HTMLInputElement).value as inputTypeEnum);;
  };

  let tmpLabel: string = "";
  let pattern: ValidationEnum = ValidationEnum.Variable;

  const renderContent = () => {

    switch (inputType) {
      case inputTypeEnum.SwitchVariableOrArray:
      case inputTypeEnum.SwitchVariableOrNumberOrArray:

        switch (inputType) {
          case inputTypeEnum.SwitchVariableOrArray:
            tmpLabel = checked ? InputTypeJpEnum.Array : InputTypeJpEnum.VariableOnly;
            pattern = checked ? ValidationEnum.Array : ValidationEnum.Variable;
            break;
          case inputTypeEnum.SwitchVariableOrNumberOrArray:
            tmpLabel = checked ? InputTypeJpEnum.Array : InputTypeJpEnum.VariableOrNumber;
            pattern = checked ? ValidationEnum.Array : ValidationEnum.VariableOrNumber;
            break;
          default:
            break;
        }

        //変数と配列を切り替え可能
        return (
          <>
            <Grid container spacing={0} direction='column' sx={{ marginBottom: 1 }}>
              <Grid container direction='row'>
                <Grid size='grow'>
                  <ValidatedTextField name={`${name}_${index}`} label={tmpLabel} pattern={pattern}></ValidatedTextField>
                </Grid>
                {checked &&
                  <Grid container size='grow'>
                    <FixedHeightGrid>[</FixedHeightGrid>
                    <Grid size="grow">
                      <ValidatedTextField
                        name={`${name}_${index}_${keyPrefixEnum.Suffix}`} label={InputTypeJpEnum.SuffixOnly} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
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

      case inputTypeEnum.All:
      case inputTypeEnum.RadioWithVoid:

        switch (radioValue) {
          case inputTypeEnum.VariableOrNumber:
            tmpLabel = InputTypeJpEnum.VariableOrNumber;
            pattern = ValidationEnum.VariableOrNumber;
            break;
          case inputTypeEnum.Array:
            tmpLabel = InputTypeJpEnum.Array;
            pattern = ValidationEnum.Array;
            break;
          case inputTypeEnum.String:
            tmpLabel = InputTypeJpEnum.String;
            pattern = ValidationEnum.String;
            break;
          case inputTypeEnum.ReturnFunction:
          case inputTypeEnum.Void:
            tmpLabel = InputTypeJpEnum.Function;
            pattern = ValidationEnum.InitializeArray;
            break;
          default:
            break;
        }

        //変数と配列を切り替え可能
        return (
          <>
            <Grid container spacing={0} direction='column'>
              <Grid container direction='row'>
                {(radioValue == inputTypeEnum.VariableOrNumber || radioValue == inputTypeEnum.Array || radioValue == inputTypeEnum.String) &&
                  <>
                    <Grid size='grow'>
                      <ValidatedTextField name={`${name}_${index}`} label={tmpLabel} pattern={pattern} isIMEOn={radioValue == inputTypeEnum.String ? true : false}></ValidatedTextField>
                    </Grid>
                  </>
                }
                <input type='hidden' name={`${name}_${index}_${keyPrefixEnum.Type}`} value={`${radioValue}`}></input>
                {(radioValue == inputTypeEnum.ReturnFunction || radioValue == inputTypeEnum.Void) &&
                  <>
                    <FunctionField name={`${name}`} parentIndex={index} funcType={radioValue} treeItems={treeItems}></FunctionField>
                  </>
                }
                {radioValue == inputTypeEnum.Array &&
                  <Grid container size='grow'>
                    <FixedHeightGrid>[</FixedHeightGrid>
                    <Grid size="grow">
                      <ValidatedTextField
                        name={`${name}_${index}_${keyPrefixEnum.Suffix}`} label={InputTypeJpEnum.SuffixOnly} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
                    </Grid>
                    <FixedHeightGrid>]</FixedHeightGrid>
                  </Grid>
                }
                {radioValue == inputTypeEnum.Boolean &&
                  <Grid container size='grow'>
                    <CustomToggleButtonGroup
                      color="primary"
                      value={boolString}
                      exclusive
                      onChange={handleChangeToggle}
                      aria-label="Platform"
                      size='small'
                    >
                      <CustomToggleButton value="true">真</CustomToggleButton>
                      <CustomToggleButton value="false">偽</CustomToggleButton>
                      <input type="hidden" name={`${name}_${index}`} value={boolString || ''} />
                    </CustomToggleButtonGroup>
                  </Grid>
                }
              </Grid>
              <Grid>
                <RadioGroup
                  row
                  aria-labelledby="row-radio-buttons-group-label"
                  onChange={handleChangeRadio}
                  defaultValue={inputTypeEnum.VariableOrNumber}
                >
                  <FormControlLabel sx={{ margin: 0, paddingBottom: 0 }} value={inputTypeEnum.VariableOrNumber} control={<Radio size="small" />} label={SwitchJpEnum.VariableOrNumber} />
                  <FormControlLabel sx={{ margin: 0, paddingBottom: 0 }} value={inputTypeEnum.Array} control={<Radio size="small" />} label={SwitchJpEnum.Array} />
                  <FormControlLabel sx={{ margin: 0, paddingBottom: 0 }} value={inputTypeEnum.String} control={<Radio size="small" />} label={SwitchJpEnum.String} />
                  <FormControlLabel sx={{ margin: 0, paddingBottom: 0 }} value={inputTypeEnum.Boolean} control={<Radio size="small" />} label={SwitchJpEnum.Boolean} />
                  {inputType == inputTypeEnum.All ?
                    <FormControlLabel sx={{ margin: 0, paddingBottom: 0 }} value={inputTypeEnum.ReturnFunction} control={<Radio size="small" />} label={SwitchJpEnum.Function} />
                    :
                    <FormControlLabel sx={{ margin: 0, paddingBottom: 0 }} value={inputTypeEnum.Void} control={<Radio size="small" />} label={SwitchJpEnum.Function} />
                  }
                </RadioGroup>
              </Grid>
            </Grid>
          </>
        );

      case inputTypeEnum.VariableOnly:
        return <Grid size="grow">
          <ValidatedTextField name={`${name}_${index}`} label={InputTypeJpEnum.VariableOnly} pattern={ValidationEnum.Variable}></ValidatedTextField>
        </Grid>
      case inputTypeEnum.ArrayWithoutSuffix:
        return <Grid size="grow">
          <ValidatedTextField name={`${name}_${index}`} label={InputTypeJpEnum.Array} pattern={ValidationEnum.VariableOrArray}></ValidatedTextField>
        </Grid>

      case inputTypeEnum.Array:
        return <Grid container spacing={0}>
          <Grid size={'grow'}>
            <ValidatedTextField name={`${name}_${index}`} label={InputTypeJpEnum.ArrayWithoutSuffix} pattern={ValidationEnum.Variable}></ValidatedTextField>
          </Grid>
          <Grid container size='auto'>
            <FixedHeightGrid>[</FixedHeightGrid>
            <Grid size="grow">
              <ValidatedTextField sx={() => ({
                width: '100px',
              })}
                name={`${name}_${index}_${suffixValue}`} label={InputTypeJpEnum.SuffixOnly} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
            </Grid>
            <FixedHeightGrid>]</FixedHeightGrid>
          </Grid>
        </Grid>

      case inputTypeEnum.InitializeArray:
        return <Grid container size='auto'>
          <FixedHeightGrid>[</FixedHeightGrid>
          <Grid size="grow">
            <ValidatedTextField name={`${name}_${index}_${keyPrefixEnum.Suffix}`} label={label} pattern={ValidationEnum.InitializeArray}></ValidatedTextField>
          </Grid>
          <FixedHeightGrid>]</FixedHeightGrid>
        </Grid>;
      case inputTypeEnum.VariableOrNumber:
        return <Grid size="grow">
          <ValidatedTextField name={`${name}_${index}_${suffixValue}`} label={InputTypeJpEnum.VariableOrNumber} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
        </Grid>
      case inputTypeEnum.UserDefinedfunction:
        return <Grid size="grow">
          <FunctionField name={`${name}`} parentIndex={index} funcType={inputTypeEnum.UserDefinedfunction} treeItems={treeItems}></FunctionField>
        </Grid>
      case inputTypeEnum.ExecuteUserDefinedFunction:
        return <Grid size="grow">
          <FunctionField name={`${name}`} parentIndex={index} funcType={inputTypeEnum.ExecuteUserDefinedFunction} treeItems={treeItems}></FunctionField>
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