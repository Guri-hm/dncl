import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { styled } from '@mui/material/styles';
import Switch from '@mui/material/Switch';
import { useCallback, useEffect, useState } from "react";
import Box from '@mui/material/Box';
import { keyPrefixEnum, inputTypeEnum, ValidationEnum } from "./Enum";
import Grid from '@mui/material/Grid2';
import { FormControlLabel, Radio, RadioGroup, ToggleButton, ToggleButtonGroup } from '@mui/material';
import { InputTypeJpEnum, OperationEnum, SwitchJpEnum } from '@/app/enum';
import { FunctionField, ValidatedTextField, FixedHeightGrid } from '@/app/components/Dialog';
import { TreeItems } from '@/app/types';
import { getValidationPattern } from '@/app/utilities/validation-utils';

export interface DnclTextFieldProps {
  label?: string | inputTypeEnum
  name: string
  inputType?: inputTypeEnum
  index?: number
  suffixValue?: string
  treeItems?: TreeItems
  operator?: OperationEnum
  operatorIndex?: number
  initialRestoreValues?: { [key: string]: string }
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

export function DnclTextField({ label, name, inputType, index = 0, suffixValue, treeItems, initialRestoreValues }: DnclTextFieldProps) {
  const [checked, setChecked] = useState(false);
  const [radioValue, setRadioValue] = useState<inputTypeEnum>(inputTypeEnum.Number);
  const [boolString, setBoolString] = useState<string>('true');
  const [isConstantMode, setIsConstantMode] = useState(false);
  // 3つの切り替えモード用の状態（配列、変数、数値）
  const [threeWayValue, setThreeWayValue] = useState<inputTypeEnum>(inputTypeEnum.Number);
  // For文の各値用の状態管理
  const [forValueType, setForValueType] = useState<inputTypeEnum>(inputTypeEnum.Number);
  const [restoreValues, setRestoreValues] = useState<{ [key: string]: string }>({});

  const handleThreeWayChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setThreeWayValue((event.target as HTMLInputElement).value as inputTypeEnum);
  };

  const restoreRadioState = useCallback((fieldName: string, value: string) => {

    // このコンポーネントに関連するフィールドかチェック
    if (fieldName === `${name}_${index}_${keyPrefixEnum.Type}`) {
      setRadioValue(value as inputTypeEnum);
      if (inputType === inputTypeEnum.SwitchVariableOrNumberOrArray || inputType === inputTypeEnum.All) {
        setThreeWayValue(value as inputTypeEnum);
      }
    }

    // For文の値タイプの復元
    if (fieldName.includes(`${name}_${index}_`) && fieldName.includes('_type')) {
      setForValueType(value as inputTypeEnum);
    }

    // スイッチの復元
    if (fieldName === `${name}_${index}_switch`) {
      setChecked(value === 'true');
      // 配列スイッチを復元する際、定数モードと排他にする
      const v = value === 'true';
      setChecked(v);
      if (v) setIsConstantMode(false);
    }

    if (fieldName === `${name}_${index}_isConstant`) {
      setIsConstantMode(value === 'true');
      // 定数モードを復元する際、配列スイッチと排他にする
      const v = value === 'true';
      setIsConstantMode(v);
      if (v) setChecked(false);
    }

    if (fieldName === `${name}_${index}` ||
      fieldName === `${name}_${index}_${keyPrefixEnum.Suffix}` ||
      fieldName.includes(`${name}_${index}_`)) {
      setRestoreValues(prev => ({
        ...prev,
        [fieldName]: value
      }));
    }
  }, [name, index, inputType]);

  useEffect(() => {
    if (!initialRestoreValues) return;
    Object.entries(initialRestoreValues).forEach(([fieldName, value]) => {
      restoreRadioState(fieldName, value);
    });
  }, [initialRestoreValues, restoreRadioState, inputType]);

  const handleChangeToggle = (
    event: React.MouseEvent<HTMLElement>,
    newValue: string,
  ) => {
    if (newValue !== null) {
      setBoolString(newValue);
    }
  };
  const handleToggleArraySwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const v = event.target.checked;
    // 配列スイッチをONにする場合は定数モードを解除（排他）
    setChecked(v);
    if (v) setIsConstantMode(false);
  };
  const handleChangeRadio = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRadioValue((event.target as HTMLInputElement).value as inputTypeEnum);;
  };

  const handleToggleConstantSwitch = (event: React.ChangeEvent<HTMLInputElement>) => {
    const v = event.target.checked;
    // 定数モードをONにする場合は配列スイッチを解除（排他）
    setIsConstantMode(v);
    if (v) setChecked(false);
  };
  const handleForValueTypeChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setForValueType((event.target as HTMLInputElement).value as inputTypeEnum);
  };

  const renderContent = () => {
    let tmpLabel: string = "";
    let pattern: ValidationEnum = ValidationEnum.Variable;

    switch (inputType) {
      case inputTypeEnum.SwitchVariableOrArray:
      case inputTypeEnum.SwitchVariableOrNumberOrArray:
      case inputTypeEnum.SwitchVariableOrArrayWithConstant:

        pattern = getValidationPattern(inputType, {
          isConstant: isConstantMode,
          threeWayValue: threeWayValue,
        });
        switch (inputType) {
          case inputTypeEnum.SwitchVariableOrArray:
            tmpLabel = checked ? InputTypeJpEnum.Array : InputTypeJpEnum.Variable;
            break;
          case inputTypeEnum.SwitchVariableOrNumberOrArray:
            // 3つの選択肢に対応
            switch (threeWayValue) {
              case inputTypeEnum.Variable:
                tmpLabel = InputTypeJpEnum.Variable;
                break;
              case inputTypeEnum.Number:
                tmpLabel = InputTypeJpEnum.Number;
                break;
              case inputTypeEnum.Array:
                tmpLabel = InputTypeJpEnum.Array;
                break;
              default:
                tmpLabel = InputTypeJpEnum.Variable;
                break;
            }
            break;
          case inputTypeEnum.SwitchVariableOrArrayWithConstant:
            tmpLabel = checked ? InputTypeJpEnum.Array : InputTypeJpEnum.Variable;
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
                  <ValidatedTextField name={`${name}_${index}`} label={tmpLabel} pattern={pattern} toUpperCase={isConstantMode} restoreValue={restoreValues[`${name}_${index}`]}></ValidatedTextField>
                </Grid>
                {/* 定数スイッチの追加 */}
                {inputType === inputTypeEnum.SwitchVariableOrArrayWithConstant && (
                  <input type="hidden" name={`${name}_${index}_isConstant`} value={isConstantMode.toString()} />
                )}
                {/* SwitchVariableOrNumberOrArray の場合は threeWayValue を使用 */}
                {inputType === inputTypeEnum.SwitchVariableOrNumberOrArray && threeWayValue === inputTypeEnum.Array && (
                  <Grid container size='grow'>
                    <FixedHeightGrid>[</FixedHeightGrid>
                    <Grid size="grow">
                      <ValidatedTextField
                        name={`${name}_${index}_${keyPrefixEnum.Suffix}`} label={InputTypeJpEnum.Suffix} pattern={ValidationEnum.VariableOrPositiveInteger} restoreValue={restoreValues[`${name}_${index}_${keyPrefixEnum.Suffix}`]}></ValidatedTextField>
                    </Grid>
                    <FixedHeightGrid>]</FixedHeightGrid>
                  </Grid>
                )}
                {/* 従来の checked を使用するケース */}
                {inputType !== inputTypeEnum.SwitchVariableOrNumberOrArray && checked && (
                  <Grid container size='grow'>
                    <FixedHeightGrid>[</FixedHeightGrid>
                    <Grid size="grow">
                      <ValidatedTextField
                        name={`${name}_${index}_${keyPrefixEnum.Suffix}`} label={InputTypeJpEnum.Suffix} pattern={ValidationEnum.VariableOrPositiveInteger} restoreValue={restoreValues[`${name}_${index}_${keyPrefixEnum.Suffix}`]}></ValidatedTextField>
                    </Grid>
                    <FixedHeightGrid>]</FixedHeightGrid>
                  </Grid>
                )}
              </Grid>
              <Grid container spacing={1}>
                {inputType === inputTypeEnum.SwitchVariableOrNumberOrArray ? (
                  // 3つ選択のラジオボタン
                  <Grid>
                    <RadioGroup
                      row
                      value={threeWayValue}
                      onChange={handleThreeWayChange}
                    >
                      <FormControlLabel sx={{ margin: 0, paddingBottom: 0 }} value={inputTypeEnum.Number} control={<Radio size="small" />} label={SwitchJpEnum.Number} />
                      <FormControlLabel sx={{ margin: 0, paddingBottom: 0 }} value={inputTypeEnum.Variable} control={<Radio size="small" />} label={SwitchJpEnum.Variable} />
                      <FormControlLabel sx={{ margin: 0, paddingBottom: 0 }} value={inputTypeEnum.Array} control={<Radio size="small" />} label={SwitchJpEnum.Array} />
                    </RadioGroup>
                    <input type='hidden' name={`${name}_${index}_${keyPrefixEnum.Type}`} value={`${threeWayValue}`}></input>
                  </Grid>
                ) : (
                  // 配列スイッチ
                  <Grid>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} data-switch-name={`${name}_${index}_switch`}>
                      <AntSwitch checked={checked} onChange={(handleToggleArraySwitch)} inputProps={{ 'aria-label': 'ant design' }} />
                      <Typography>{SwitchJpEnum.Array}</Typography>
                    </Stack>
                  </Grid>
                )}
                {/* 定数スイッチ */}
                {inputType === inputTypeEnum.SwitchVariableOrArrayWithConstant && (
                  <Grid>
                    <Stack direction="row" spacing={1} sx={{ alignItems: 'center' }} data-switch-name={`${name}_${index}_isConstant`}>
                      <AntSwitch checked={isConstantMode} onChange={handleToggleConstantSwitch} inputProps={{ 'aria-label': 'constant' }} />
                      <Typography>{SwitchJpEnum.Constant}</Typography>
                    </Stack>
                  </Grid>
                )}
              </Grid>
            </Grid>
          </>
        );

      case inputTypeEnum.All:
        //表示文

        switch (radioValue) {
          case inputTypeEnum.Variable:
            tmpLabel = InputTypeJpEnum.Variable;
            pattern = ValidationEnum.Variable;
            break;
          case inputTypeEnum.Number:
            tmpLabel = InputTypeJpEnum.Number;
            pattern = ValidationEnum.Number;
            break;
          case inputTypeEnum.Array:
            tmpLabel = InputTypeJpEnum.Array;
            pattern = ValidationEnum.Variable;
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
                {(radioValue == inputTypeEnum.Variable || radioValue == inputTypeEnum.Number || radioValue == inputTypeEnum.Array || radioValue == inputTypeEnum.String) &&
                  <>
                    <Grid size='grow'>
                      <ValidatedTextField name={`${name}_${index}`} label={tmpLabel} pattern={pattern} restoreValue={restoreValues[`${name}_${index}`]}></ValidatedTextField>
                    </Grid>
                  </>
                }
                <input type='hidden' name={`${name}_${index}_${keyPrefixEnum.Type}`} value={`${radioValue}`}></input>
                {(radioValue == inputTypeEnum.ReturnFunction || radioValue == inputTypeEnum.Void) &&
                  <>
                    <FunctionField name={`${name}`} parentIndex={index} funcType={radioValue} treeItems={treeItems} restoreValues={restoreValues}></FunctionField>
                  </>
                }
                {radioValue == inputTypeEnum.Array &&
                  <Grid container size='grow'>
                    <FixedHeightGrid>[</FixedHeightGrid>
                    <Grid size="grow">
                      <ValidatedTextField
                        name={`${name}_${index}_${keyPrefixEnum.Suffix}`} label={InputTypeJpEnum.Suffix} pattern={ValidationEnum.VariableOrPositiveInteger} restoreValue={restoreValues[`${name}_${index}_${keyPrefixEnum.Suffix}`]} ></ValidatedTextField>
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
                  value={radioValue}
                >
                  <FormControlLabel sx={{ margin: 0, paddingBottom: 0 }} value={inputTypeEnum.Number} control={<Radio size="small" />} label={SwitchJpEnum.Number} />
                  <FormControlLabel sx={{ margin: 0, paddingBottom: 0 }} value={inputTypeEnum.Variable} control={<Radio size="small" />} label={SwitchJpEnum.Variable} />
                  <FormControlLabel sx={{ margin: 0, paddingBottom: 0 }} value={inputTypeEnum.Array} control={<Radio size="small" />} label={SwitchJpEnum.Array} />
                  <FormControlLabel sx={{ margin: 0, paddingBottom: 0 }} value={inputTypeEnum.String} control={<Radio size="small" />} label={SwitchJpEnum.String} />
                  <FormControlLabel sx={{ margin: 0, paddingBottom: 0 }} value={inputTypeEnum.Boolean} control={<Radio size="small" />} label={SwitchJpEnum.Boolean} />
                  <FormControlLabel sx={{ margin: 0, paddingBottom: 0 }} value={inputTypeEnum.ReturnFunction} control={<Radio size="small" />} label={SwitchJpEnum.Function} />
                </RadioGroup>
              </Grid>
            </Grid>
          </>
        );

      case inputTypeEnum.VariableOnly:
      case inputTypeEnum.ArrayWithoutSuffix:
        return <Grid size="grow">
          <ValidatedTextField name={`${name}_${index}`} label={InputTypeJpEnum.Variable} pattern={ValidationEnum.Variable} restoreValue={restoreValues[`${name}_${index}`]}></ValidatedTextField>
        </Grid>

      case inputTypeEnum.Array:
        return <Grid container spacing={0}>
          <Grid size={'grow'}>
            <ValidatedTextField name={`${name}_${index}`} label={InputTypeJpEnum.Array} pattern={ValidationEnum.Variable} restoreValue={restoreValues[`${name}_${index}`]}></ValidatedTextField>
          </Grid>
          <Grid container size='auto'>
            <FixedHeightGrid>[</FixedHeightGrid>
            <Grid size="grow">
              <ValidatedTextField sx={() => ({
                width: '100px',
              })}
                name={`${name}_${index}_${suffixValue}`} label={InputTypeJpEnum.Suffix} pattern={ValidationEnum.VariableOrPositiveInteger} restoreValue={restoreValues[`${name}_${index}_${keyPrefixEnum.Suffix}`]}></ValidatedTextField>
            </Grid>
            <FixedHeightGrid>]</FixedHeightGrid>
          </Grid>
        </Grid>

      case inputTypeEnum.InitializeArray:
        return <Grid container size='auto'>
          <FixedHeightGrid>[</FixedHeightGrid>
          <Grid size="grow">
            <ValidatedTextField name={`${name}_${index}_${keyPrefixEnum.Suffix}`} label={label} pattern={ValidationEnum.InitializeArray} restoreValue={restoreValues[`${name}_${index}_${keyPrefixEnum.Suffix}`]}></ValidatedTextField>
          </Grid>
          <FixedHeightGrid>]</FixedHeightGrid>
        </Grid>;
      case inputTypeEnum.UserDefinedfunction:
        return <Grid size="grow">
          <FunctionField name={`${name}`} parentIndex={index} funcType={inputTypeEnum.UserDefinedfunction} treeItems={treeItems} restoreValues={restoreValues}></FunctionField>
        </Grid>
      case inputTypeEnum.ExecuteUserDefinedFunction:
        return <Grid size="grow">
          <FunctionField name={`${name}`} parentIndex={index} funcType={inputTypeEnum.ExecuteUserDefinedFunction} treeItems={treeItems} restoreValues={restoreValues}></FunctionField>
        </Grid>

      case inputTypeEnum.ForValue:
        pattern = getValidationPattern(inputType, { forValueType });
        tmpLabel = forValueType === inputTypeEnum.Variable ? InputTypeJpEnum.Variable : InputTypeJpEnum.Number;

        return (
          <>
            <Grid container spacing={0} direction='column' sx={{ marginBottom: 1 }}>
              <Grid container direction='row'>
                <Grid size='grow'>
                  <ValidatedTextField
                    name={`${name}_${index}_${suffixValue}`}
                    label={label || tmpLabel}
                    pattern={pattern} restoreValue={restoreValues[`${name}_${index}_${suffixValue}`]}
                  />
                </Grid>
                <input type="hidden" name={`${name}_${index}_${suffixValue}_type`} value={forValueType} />
              </Grid>
              <Grid container spacing={1}>
                <Grid>
                  <RadioGroup
                    row
                    value={forValueType}
                    onChange={handleForValueTypeChange}
                  >
                    <FormControlLabel
                      sx={{ margin: 0, paddingBottom: 0 }}
                      value={inputTypeEnum.Number}
                      control={<Radio size="small" />}
                      label={SwitchJpEnum.Number}
                    />
                    <FormControlLabel
                      sx={{ margin: 0, paddingBottom: 0 }}
                      value={inputTypeEnum.Variable}
                      control={<Radio size="small" />}
                      label={SwitchJpEnum.Variable}
                    />
                  </RadioGroup>
                </Grid>
              </Grid>
            </Grid>
          </>
        );
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