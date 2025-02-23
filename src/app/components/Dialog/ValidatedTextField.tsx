import TextField from '@mui/material/TextField';
import { useEffect, useRef, useState } from "react";
import { ValidationEnum } from "./Enum";
import { SxProps, Theme } from '@mui/material/styles';

type Props = {
  label?: string | null
  name: string
  pattern: ValidationEnum
  sx?: SxProps<Theme>;
  isIMEOn?: boolean;
}

const getErrorMessage = (value: string, pattern: string): string => {
  const regex = new RegExp(pattern);
  const match = value.match(regex);
  if (match) {
    return `入力値「${value}」はパターン「${pattern}」に一致しません`;
  } else {
    const diffIndex = getFirstMismatchIndex(value, pattern);
    if (diffIndex !== -1) {
      return `「${value[diffIndex]}」は使用できません`;
    }
    return `入力値に不適切な文字が使用されています`;
  }
};

const getFirstMismatchIndex = (value: string, pattern: string): number => {
  for (let i = 0; i < value.length; i++) {
    const subStr = value.substring(0, i + 1);
    const regex = new RegExp(`^${pattern}`);
    if (!regex.test(subStr)) {
      return i;
    }
  }
  return -1;
};

export function ValidatedTextField({ sx = [], name, label, pattern, isIMEOn = false, ...params }: Props) {

  const [inputError, setInputError] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const elm = event.target;
    const regex = new RegExp(pattern);
    if (elm.value === "" || regex.test(elm.value)) {
      setInputError(false);
      setErrorMessage('');
    } else {
      setInputError(true);
      setErrorMessage(getErrorMessage(elm.value, pattern));
    }
  };

  useEffect(() => {
    setInputError(false);
    if (inputRef.current) {
      const inputElement = inputRef.current;
      const regex = new RegExp(pattern);
      if (inputElement.value !== "" && !regex.test(inputElement.value)) {
        setInputError(true);
        setErrorMessage(getErrorMessage(inputElement.value, pattern));
      }
    }
  }, [pattern]);

  return (
    <TextField
      inputRef={inputRef}
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
        },
      }}

      name={name}
      helperText={inputError && errorMessage}
      onChange={handleChange}
    />
  );
}