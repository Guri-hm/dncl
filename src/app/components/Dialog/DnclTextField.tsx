import { Validation } from "../../types";
import TextField from '@mui/material/TextField';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { useState } from "react";
import Box from '@mui/material/Box';
import { keyPrefixEnum, inputTypeEnum } from "./Enum";
import Grid from '@mui/material/Grid2';

type Props = {
  label?: string | inputTypeEnum
  validation: Validation
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
  const [validation, setValidation] = useState<Validation>(params.validation);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setChecked(event.target.checked);
    setLabel(searchKey(inputTypeEnum.VariableOrNumber));
    if (event.target.checked) {
      setLabel(searchKey(inputTypeEnum.ArrayWithoutSuffix));
      setValidation(Validation.Array)
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
                <TextField
                  fullWidth
                  size="small"
                  required
                  id="outlined-required"
                  label={label}
                  defaultValue=""
                  slotProps={{
                    htmlInput: {
                      className: 'text-center',
                      pattern: validation
                    }
                    ,

                  }}
                  name={name}
                />
              </Grid>
              {checked ?
                <Grid container size='auto'>
                  <Grid size="auto" sx={{
                    display: 'grid',
                    alignItems: 'center',
                    marginLeft: '10px',
                    marginRight: '10px'
                  }}>
                    [
                  </Grid>
                  <Grid size="grow">
                    <TextField
                      size="small"
                      required
                      id="outlined-required"
                      label="添字"
                      defaultValue=""
                      slotProps={{
                        htmlInput: {
                          className: 'text-center',
                          pattern: Validation.VariableOrNumber
                        }
                        ,

                      }}
                      sx={{ width: '100px' }}
                      name={name + keyPrefixEnum.Suffix}
                    />
                  </Grid>
                  <Grid size="auto" sx={{
                    display: 'grid',
                    alignItems: 'center',
                    marginLeft: '10px',
                    marginRight: '10px'
                  }}>
                    ]
                  </Grid>
                </Grid>
                :
                null
              }
              {inputType == inputTypeEnum.Switch ?
                <Grid size={12}>
                  <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }}>
                    {/* <Typography>変数</Typography> */}
                    <AntSwitch onChange={(handleChange)} inputProps={{ 'aria-label': 'ant design' }} />
                    <Typography>配列</Typography>
                  </Stack>
                </Grid>
                :
                null
              }
            </Grid>
          </>
        );
      case inputTypeEnum.SuffixOnly:
      case inputTypeEnum.VariableOnly:
      case inputTypeEnum.ArrayWithoutSuffix:
        return <Grid size="grow">
          <TextField
            fullWidth
            size="small"
            required
            id="outlined-required"
            label={label}
            defaultValue=""
            slotProps={{
              htmlInput: {
                className: 'text-center',
                pattern: Validation.VariableOrNumber
              }
              ,

            }}
            name={name + keyPrefixEnum.Suffix}
          />
        </Grid>
      case inputTypeEnum.Array:
        return <Grid container spacing={0}>
          <Grid size={'grow'}>
            <TextField
              fullWidth
              size="small"
              required
              id="outlined-required"
              label={label}
              defaultValue=""
              slotProps={{
                htmlInput: {
                  className: 'text-center',
                  pattern: validation
                }
                ,

              }}
              name={name}
            />
          </Grid>
          <Grid container size='auto'>
            <Grid size="auto" sx={{
              display: 'grid',
              alignItems: 'center',
              marginLeft: '10px',
              marginRight: '10px'
            }}>
              [
            </Grid>
            <Grid size="grow">
              <TextField
                size="small"
                required
                id="outlined-required"
                label="添字"
                defaultValue=""
                slotProps={{
                  htmlInput: {
                    className: 'text-center',
                    pattern: Validation.VariableOrNumber
                  }
                  ,

                }}
                sx={{ width: '100px' }}
                name={name + keyPrefixEnum.Suffix}
              />
            </Grid>
            <Grid size="auto" sx={{
              display: 'grid',
              alignItems: 'center',
              marginLeft: '10px',
              marginRight: '10px'
            }}>
              ]
            </Grid>
          </Grid>
        </Grid>
      case inputTypeEnum.SuffixWithBrackets:
        return <Grid container size='auto'>
          <Grid size="auto" sx={{
            display: 'grid',
            alignItems: 'center',
            marginLeft: '10px',
            marginRight: '10px'
          }}>
            [
          </Grid>
          <Grid size="grow">
            <TextField
              fullWidth
              size="small"
              required
              id="outlined-required"
              label={label}
              defaultValue=""
              slotProps={{
                htmlInput: {
                  className: 'text-center',
                  pattern: Validation.VariableOrNumber
                }
                ,

              }}
              name={name + keyPrefixEnum.Suffix}
            />
          </Grid>
          <Grid size="auto" sx={{
            display: 'grid',
            alignItems: 'center',
            marginLeft: '10px',
            marginRight: '10px'
          }}>
            ]
          </Grid>
        </Grid>;
      case inputTypeEnum.VariableOrNumber:
        return <Grid size="grow">
          <TextField
            fullWidth
            size="small"
            required
            id="outlined-required"
            label={label}
            defaultValue=""
            slotProps={{
              htmlInput: {
                className: 'text-center',
                pattern: Validation.VariableOrNumber
              }
              ,

            }}
            name={name + keyPrefixEnum.Suffix}
          />
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