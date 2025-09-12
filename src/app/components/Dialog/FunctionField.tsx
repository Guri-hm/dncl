import React, { useEffect, useState } from "react";
import Box from '@mui/material/Box';
import { InputTypeJpEnum, ReturnFuncDncl, UserDefinedFuncDncl, VoidFuncDncl } from '@/app/enum';
import { ReactElement } from "react";
import IconButton from '@mui/material/IconButton';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { inputTypeEnum, keyPrefixEnum, ValidationEnum } from "./Enum";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, SelectChangeEvent, Typography, TypographyProps } from "@mui/material";
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import Grid from '@mui/material/Grid2';
import { TreeItems } from "@/app/types";
import { getUserDefinedFunctionInfoArray, UserDefinedFunctionInfo } from "@/app/utilities";
import { FixedHeightGrid, ValidatedTextField } from '@/app/components/Dialog';

interface TextIconProps extends SvgIconProps {
  text: string;
  onClick: () => void;
}

const TextIcon: React.FC<TextIconProps> = ({ text, onClick }) => (
  <Typography onClick={onClick} noWrap style={{ fontWeight: 'bold' }}>{text}</Typography>
);


type Props = {
  name?: string
  parentIndex?: number
  event?: () => void;
  funcType: inputTypeEnum
  treeItems?: TreeItems
}

const ReturnFunctions = [
  { name: ReturnFuncDncl.Square, arguments: 1, desc: '引数の値を二乗した値を返します。', icon: (props: SvgIconProps & { onClick: () => void }) => <TextIcon text="二乗" {...props} /> },
  { name: ReturnFuncDncl.Exponentiation, arguments: 2, desc: '「べき乗(m,n)」の場合，値mのn乗の値を返します。', icon: (props: SvgIconProps & { onClick: () => void }) => <TextIcon text="べき乗" {...props} /> },
  { name: ReturnFuncDncl.Random, arguments: 2, desc: '「乱数(m,n)」の場合，値m以上値n以下の整数をランダムに一つ返します。', icon: (props: SvgIconProps & { onClick: () => void }) => <TextIcon text="乱数" {...props} /> },
  { name: ReturnFuncDncl.Odd, arguments: 1, desc: '引数の値が奇数のとき真を返し，そうでないとき偽を返します。', icon: (props: SvgIconProps & { onClick: () => void }) => <TextIcon text="奇数" {...props} /> },
];

const VoidFuncs = [
  { name: UserDefinedFuncDncl.UserDefined, arguments: 0, desc: '', icon: (props: SvgIconProps) => <NotInterestedIcon {...props} sx={{ color: 'gray', opacity: 0.2 }} /> },
]
const UserDefine = [
  { name: UserDefinedFuncDncl.Define, arguments: null, desc: '複数の引数を指定する場合は，『，』で区切ります。', icon: null },]

const ExecuteUserDefinedFunc = [
  { name: UserDefinedFuncDncl.UserDefined, arguments: null, desc: '「新しい関数の定義」で作成した関数を使用します。', icon: null },]

// function createCommaLimitPattern(min: number, max: number) {
//   const pattern = `^(?:(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)(?:,(?:[a-zA-Z_$][a-zA-Z0-9_$]*|[0-9]+)){${min},${max}})$`;
//   return pattern;
// }

export function FunctionField({ name = "", parentIndex = 0, event, funcType, treeItems = [] }: Props) {

  const [operatorIndex, setOperatorIndex] = useState<number>(0);
  const [selectedValue, setSelectedValue] = useState<string>('0');

  function getFuncs(funcType: inputTypeEnum) {
    switch (funcType) {
      case inputTypeEnum.ReturnFunction:
        return ReturnFunctions;
      case inputTypeEnum.Void:
        return VoidFuncs;
      case inputTypeEnum.ExecuteUserDefinedFunction:
        return ExecuteUserDefinedFunc;
      default:
        return UserDefine;
    }
  }
  function getArgumentCount(funcType: inputTypeEnum) {
    switch (funcType) {
      case inputTypeEnum.ReturnFunction:
      case inputTypeEnum.Void:

        if ((funcs.map(func => func.name)[newIndex] == UserDefinedFuncDncl.UserDefined)) {
          return userDefinedFunctionInfoArray[Number(selectedValue)]?.argumentCount ?? 0;
        }
        return funcs.map(func => func.arguments)[newIndex] ?? 0;
      case inputTypeEnum.ExecuteUserDefinedFunction:
        return userDefinedFunctionInfoArray[Number(selectedValue)]?.argumentCount ?? 0;
      default:
        return 1;
    }
  }

  const funcs = getFuncs(funcType);

  const handleOnClick = () => {
    let newIndex: number = operatorIndex + 1;
    if (operatorIndex == funcs.length - 1) {
      newIndex = 0;
      if (event) event();
    }
    setOperatorIndex(newIndex);
  }
  const handleChange = (event: SelectChangeEvent) => {
    setSelectedValue(event.target.value as string);
  };

  let newIndex: number = operatorIndex;

  if (operatorIndex > funcs.length - 1) {
    setOperatorIndex(0);
    newIndex = 0;
  }

  const SvgIconButton = funcs.map(func => func.icon)[newIndex];

  const ArgumentFields: React.ReactNode[] = [];
  const userDefinedFunctionInfoArray: UserDefinedFunctionInfo[] = getUserDefinedFunctionInfoArray(treeItems);
  const argumentCount = getArgumentCount(funcType);
  //「新しい関数の定義」以外の場合、定義した関数がなければユーザ定義関数のリストを表示するエリアに空の内容を返す
  const isDisabledUserDefined = (funcs.map(func => func.name)[newIndex] == UserDefinedFuncDncl.UserDefined) && (userDefinedFunctionInfoArray.length == 0);

  switch (funcType) {
    //定義した関数の実行
    case inputTypeEnum.ExecuteUserDefinedFunction:
    case inputTypeEnum.ReturnFunction:
    case inputTypeEnum.Void:
      for (let i = 0; i < argumentCount; i++) {
        ArgumentFields.push(
          <React.Fragment key={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${newIndex}_${i}_fragment`}>
            {ArgumentFields.length > 0 && <Grid size="auto" key={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${newIndex}_${i}_comma`}><FixedHeightGrid>,</FixedHeightGrid></Grid>}
            <Grid size="grow" key={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${newIndex}_${i}`}>
              <ValidatedTextField name={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${i}`} label={InputTypeJpEnum.Argument} pattern={ValidationEnum.VariableOrInteger}></ValidatedTextField>
            </Grid>
          </React.Fragment>
        );

      }
      break;

    default:

      //新しい関数の定義の場面
      ArgumentFields.push(
        <Grid size="grow" key={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${newIndex}_${0}`}>
          <ValidatedTextField
            name={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${0}`} label={InputTypeJpEnum.Argument} pattern={ValidationEnum.Parameters}></ValidatedTextField>
        </Grid>
      );
      break;
  }

  let btns: ReactElement = <></>;
  btns = <>
    {SvgIconButton &&
      <>
        <IconButton sx={{ padding: 0 }} color="primary" aria-label="comparison-operation">
          <SvgIconButton onClick={handleOnClick}></SvgIconButton>
        </IconButton>
        <input type="hidden" name={`${name}_${parentIndex}_${keyPrefixEnum.Function}`} value={funcs.map(func => func.name)[newIndex] ?? ""}></input>
      </>
    }
  </>

  return (
    <>
      <Grid container direction='row'>
        <Box sx={{
          display: 'grid',
          height: '40px',
          alignItems: 'center',
          marginRight: '0px',
          marginLeft: '0px'
        }}>
          {btns}
        </Box>
        {funcs.map(func => func.name)[newIndex] == UserDefinedFuncDncl.Define &&
          //新しい関数の定義
          <Grid size="grow">
            <ValidatedTextField name={`${name}_${parentIndex}_${keyPrefixEnum.FunctionName}`} label={InputTypeJpEnum.Function} pattern={ValidationEnum.Function}></ValidatedTextField>
          </Grid>
        }
        {(funcs.map(func => func.name)[newIndex] == UserDefinedFuncDncl.UserDefined) && userDefinedFunctionInfoArray.length > 0 &&
          <Grid size="grow">
            <FormControl fullWidth size="small">
              <InputLabel id="select-label">定義した関数</InputLabel>
              <Select
                labelId="select-label"
                id="select"
                value={selectedValue}
                label="UserDefinedfunction"
                onChange={handleChange}
              >
                {userDefinedFunctionInfoArray.map((info: UserDefinedFunctionInfo, index) => (
                  <MenuItem key={`${index}`} value={index}>{info.funcName ?? ""}</MenuItem>
                ))}
              </Select>
              <input type="hidden" name={`${name}_${parentIndex}_${keyPrefixEnum.FunctionName}`} value={userDefinedFunctionInfoArray[Number(selectedValue)].funcName}></input>

            </FormControl>
          </Grid>
        }
        {isDisabledUserDefined == true ?
          <FixedHeightGrid>定義した関数なし</FixedHeightGrid>
          :
          <>
            <Grid size='auto'>
              <FixedHeightGrid>(</FixedHeightGrid>
            </Grid>
            {ArgumentFields}
            <Grid size='auto'>
              <FixedHeightGrid>)</FixedHeightGrid>
            </Grid>
          </>
        }

        <input type="hidden" name={`${name}_${parentIndex}_${keyPrefixEnum.Argument}`} value={argumentCount}></input>

      </Grid>
      <Grid>
        <FormHelperText sx={{ display: 'flex', alignItems: 'center' }}>{funcs.map(func => func.desc)[newIndex] ?? ""}</FormHelperText>
      </Grid>
    </>
  );
}
