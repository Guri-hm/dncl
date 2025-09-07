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
  toUpperCase?: boolean;
  restoreValue?: string;
}

const getErrorMessage = (value: string, pattern: string): string => {
  const regex = new RegExp(pattern);
  if (!regex.test(value)) {
    // パターンに応じたエラーメッセージを分岐
    if (pattern === ValidationEnum.Variable) {
      return `変数名は英字で始まる英数字と「_」の並びを入力してください`;
    } else if (pattern === ValidationEnum.Number) {
      return `整数または小数で入力してください`;
    } else if (pattern === ValidationEnum.VariableOrPositiveInteger) {
      return `正の整数または変数名（英字で始まる英数字と「_」の並び）を入力してください`;
    } else if (pattern === ValidationEnum.Parameters) {
      return `変数名または数値をカンマ区切りで入力してください`;
    } else if (pattern === ValidationEnum.Constant) {
      return `定数名は大文字の英字で始まる英数字と「_」の並びを入力してください`;
    }
    return `入力値「${value}」に不適切な文字が使用されています`;
  }
  return '';
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

export function ValidatedTextField({ sx = [], name, label, pattern, isIMEOn = false, restoreValue, toUpperCase = false, ...params }: Props) {

  const [inputValue, setInputValue] = useState('');
  const [inputError, setInputError] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [hasRestored, setHasRestored] = useState(false);

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    let value = event.target.value;
    if (toUpperCase) {
      value = value.toUpperCase();
    }
    setInputValue(value);

    const regex = new RegExp(pattern);
    if (value === "" || regex.test(value)) {
      setInputError(false);
      setErrorMessage('');
    } else {
      setInputError(true);
      setErrorMessage(getErrorMessage(value, pattern));
    }
  };


  const handleFocus = (event: React.FocusEvent<HTMLInputElement>) => {
    // フォーカス時に外部から設定された値を状態に反映
    const currentValue = event.target.value;
    if (currentValue !== inputValue) {
      let value = currentValue;
      if (toUpperCase) {
        value = value.toUpperCase();
      }
      setInputValue(value);

      const regex = new RegExp(pattern);
      if (value === "" || regex.test(value)) {
        setInputError(false);
        setErrorMessage('');
      } else {
        setInputError(true);
        setErrorMessage(getErrorMessage(value, pattern));
      }
    }
  };

  useEffect(() => {
    if (restoreValue !== undefined && !hasRestored) {
      let value = restoreValue;
      if (toUpperCase) {
        value = value.toUpperCase();
      }
      setInputValue(value);

      const regex = new RegExp(pattern);
      if (value === "" || regex.test(value)) {
        setInputError(false);
        setErrorMessage('');
      } else {
        setInputError(true);
        setErrorMessage(getErrorMessage(value, pattern));
      }
      setHasRestored(true);
    }
  }, [restoreValue, toUpperCase, pattern, inputValue]);

  useEffect(() => {
    const handleRestoreComplete = () => {
      setHasRestored(false);
    };

    window.addEventListener('restoreComplete', handleRestoreComplete);
    return () => {
      window.removeEventListener('restoreComplete', handleRestoreComplete);
    };
  }, []);

  useEffect(() => {
    // 定数スイッチ切り替え時にpatternが変わるので，この値を使ってハンドルする
    let value = inputValue;
    if (toUpperCase) {
      value = value.toUpperCase();
      if (value !== inputValue) {
        setInputValue(value);
        // ここでreturnして次のuseEffectでバリデーション
        return;
      }
    }
    const regex = new RegExp(pattern);
    if (value === "" || regex.test(value)) {
      setInputError(false);
      setErrorMessage('');
    } else {
      setInputError(true);
      setErrorMessage(getErrorMessage(value, pattern));
    }
  }, [inputValue, pattern, toUpperCase]);

  return (
    <TextField
      sx={[
        ...(Array.isArray(sx) ? sx : [sx]),
      ]}
      value={inputValue}
      error={inputError}
      fullWidth
      size="small"
      required
      id="outlined-required"
      label={label}
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
      onFocus={handleFocus}
    />
  );
}
