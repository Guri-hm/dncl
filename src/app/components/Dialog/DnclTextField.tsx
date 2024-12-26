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

type Props = {
  label?: string | inputTypeEnum
  name: string
  inputType: inputTypeEnum
}

enum inputTypeJpEnum {
  Switch = '変数名・配列名',
  ArrayWithoutSuffix = '配列名',
  Array = '配列名',
  SuffixOnly = '添字',
  SuffixWithBrackets = '添字',
  VariableOnly = '変数名',
  VariableOrNumber = '値・変数名',
}

const searchKey = (key: inputTypeEnum) => {
  const keys = Object.keys(inputTypeJpEnum);
  return keys.includes(key) ? inputTypeJpEnum[key] : null;
};

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

export function DnclTextField({ name, inputType, ...params }: Props) {

  const [checked, setChecked] = useState(false);
  const [label, setLabel] = useState<string | null>(params.label ?? searchKey(inputType));

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    setLabel(searchKey(inputTypeEnum.VariableOrNumber));
    if (event.target.checked) {
      setLabel(searchKey(inputTypeEnum.ArrayWithoutSuffix));
    }
  };

  const renderContent = () => {
    switch (inputType) {
      case inputTypeEnum.Switch:
        //変数と配列を切り替え可能
        return (
          <>
            <Grid container spacing={0}>
              <Grid size={checked ? 'grow' : 12}>
                <ValidatedTextField name={name} label={checked ? inputTypeJpEnum.Array : inputTypeJpEnum.VariableOrNumber} pattern={checked ? ValidationEnum.Array : ValidationEnum.VariableOrNumber}></ValidatedTextField>
              </Grid>
              {checked &&
                <Grid container size='auto'>
                  <FixedHeightGrid>[</FixedHeightGrid>
                  <Grid size="grow">
                    <ValidatedTextField sx={() => ({
                      width: '100px',
                    })}
                      name={name + keyPrefixEnum.Suffix} label={inputTypeJpEnum.SuffixOnly} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
                  </Grid>
                  <FixedHeightGrid>]</FixedHeightGrid>
                </Grid>
              }
              {inputType == inputTypeEnum.Switch &&
                <Grid size={12}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    {/* <Typography>変数</Typography> */}
                    <AntSwitch onChange={(handleChange)} inputProps={{ 'aria-label': 'ant design' }} />
                    <Typography>配列</Typography>
                  </Stack>
                </Grid>
              }
            </Grid>
          </>
        );
      case inputTypeEnum.SuffixOnly:
      case inputTypeEnum.VariableOnly:
      case inputTypeEnum.ArrayWithoutSuffix:
        return <Grid size="grow">
          <ValidatedTextField name={name + keyPrefixEnum.Suffix} label={label} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
        </Grid>

      case inputTypeEnum.Array:
        return <Grid container spacing={0}>
          <Grid size={'grow'}>
            <ValidatedTextField name={name} label={label} pattern={ValidationEnum.Variable}></ValidatedTextField>
          </Grid>
          <Grid container size='auto'>
            <FixedHeightGrid>[</FixedHeightGrid>
            <Grid size="grow">
              <ValidatedTextField sx={() => ({
                width: '100px',
              })}
                name={name + keyPrefixEnum.Suffix} label={inputTypeJpEnum.SuffixOnly} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
            </Grid>
            <FixedHeightGrid>]</FixedHeightGrid>
          </Grid>
        </Grid>
      case inputTypeEnum.SuffixWithBrackets:
        return <Grid container size='auto'>
          <FixedHeightGrid>[</FixedHeightGrid>
          <Grid size="grow">
            <ValidatedTextField name={name + keyPrefixEnum.Suffix} label={label} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
          </Grid>
          <FixedHeightGrid>]</FixedHeightGrid>
        </Grid>;
      case inputTypeEnum.VariableOrNumber:
        return <Grid size="grow">
          <ValidatedTextField name={name + keyPrefixEnum.Suffix} label={label} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
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