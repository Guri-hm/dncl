import TextField from '@mui/material/TextField';
import { useState } from "react";
import { ValidationEnum } from "./Enum";
import { SxProps, Theme } from '@mui/material/styles';

type Props = {
  label?: string | null
  name: string
  pattern: ValidationEnum
  sx?: SxProps<Theme>;
  isIMEOn?: boolean;
}

enum validationMessageEnum {
  NamingConventions = '命名規則に違反します',
  Error = '入力に誤りがあります',
  VariableOrNumber = '値・変数名を入力してください',
}

// 逆引きマップを作成
// const reverseValidationEnum = Object.entries(ValidationEnum).reduce((acc, [key, value]) => {
//   acc[value] = key as keyof typeof ValidationEnum;
//   return acc;
// }, {} as Record<string, keyof typeof ValidationEnum>);

// 値を使ってキーを取得する関数
// function getKeyByValue(value: string): keyof typeof ValidationEnum | undefined {
//   return reverseValidationEnum[value];
// }

// function getValueByKey(key: keyof typeof ValidationEnum | undefined): string | undefined {
//   return validationMessageEnum[key as keyof typeof ValidationEnum];
// }

const getMsgByValidationEnum = (validation: ValidationEnum) => {

  switch (validation) {

    case ValidationEnum.Variable:
    case ValidationEnum.Array:
      return validationMessageEnum.NamingConventions;
    case ValidationEnum.VariableOrNumber:
      return validationMessageEnum.VariableOrNumber;
    default:
      return validationMessageEnum.Error
  }
}

export function ValidatedTextField({ sx = [], name, label, pattern, isIMEOn = false, ...params }: Props) {

  const [inputError, setInputError] = useState(false);

  const handleChange = (event: any) => {
    const elm = event.target;
    if (!elm.validity.valid) {
      setInputError(true);
    } else {
      setInputError(false);
    }
  };

  return (
    <TextField
      sx={[
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      error={inputError}
      fullWidth
      size="small"
      required
      id="outlined-required"
      label={label}
      defaultValue=""
      slotProps={{
        htmlInput: {
          className: 'text-center',
          pattern: pattern,
          inputMode: isIMEOn ? 'text' : 'none',
          maxLength: 15
        }
        ,
      }}
      name={name}
      helperText={inputError && getMsgByValidationEnum(pattern)}
      onChange={handleChange}
      onFocus={handleChange}
    />
  );
}