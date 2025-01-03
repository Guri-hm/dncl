import React, { ReactNode, useState } from "react";
import Box from '@mui/material/Box';
import { InputTypeJpEnum, ReturnFuncDncl, UserDefinedFuncDncl, VoidFuncDncl } from '@/app/enum';
import { ReactElement } from "react";
import IconButton from '@mui/material/IconButton';
import SvgIcon, { SvgIconProps } from '@mui/material/SvgIcon';
import { inputTypeEnum, keyPrefixEnum, ValidationEnum } from "./Enum";
import { FormControl, FormHelperText, InputLabel, MenuItem, Select, Typography } from "@mui/material";
import NotInterestedIcon from '@mui/icons-material/NotInterested';
import Grid from '@mui/material/Grid2';
import { FixedHeightGrid } from "./FixedHeightGrid";
import { ValidatedTextField } from "./ValidatedTextField";
import { TreeItems } from "@/app/types";
import { getUserDefineFunctionNameArray } from "@/app/utilities";

const TextIcon: React.FC<any & { text: string }> = ({ text, ...props }) => (
  <Typography noWrap {...props}>{text}</Typography>
)

type Props = {
  name?: string
  parentIndex?: number
  event?: any
  funcType: inputTypeEnum
  treeItems?: TreeItems
}

const ReturnFunctions = [
  { name: UserDefinedFuncDncl.UserDefined, arguments: 0, desc: '「新しい関数の定義」で作成した関数を使用します。', icon: (props: SvgIconProps) => <NotInterestedIcon {...props} sx={{ color: 'gray', opacity: 0.2 }} /> },
  { name: ReturnFuncDncl.Square, arguments: 1, desc: '引数の値を二乗した値を返します。', icon: (props: SvgIconProps) => <TextIcon {...props} text="二乗" /> },
  { name: ReturnFuncDncl.Exponentiation, arguments: 2, desc: '「べき乗(m,n)」の場合，値mのn乗の値を返します。', icon: (props: SvgIconProps) => <TextIcon {...props} text="べき乗" /> },
  { name: ReturnFuncDncl.Random, arguments: 2, desc: '「乱数(m,n)」の場合，値m以上値n以下の整数をランダムに一つ返します。', icon: (props: SvgIconProps) => <TextIcon {...props} text="乱数" /> },
  { name: ReturnFuncDncl.Odd, arguments: 1, desc: '引数の値が奇数のとき真を返し，そうでないとき偽を返します。', icon: (props: SvgIconProps) => <TextIcon {...props} text="奇数" /> },
  // { name: ReturnFuncDncl.Binary, arguments: 1, desc: '引数の値を2進表現の値で返します。', icon: (props: SvgIconProps) => <TextIcon {...props} text="二進" /> },
]
const VoidFuncs = [
  { name: VoidFuncDncl.Binary, arguments: 1, desc: '引数の値を2進表現の値で返します。', icon: (props: SvgIconProps) => <TextIcon {...props} text="二進" /> },
]
const UserDefine = [
  { name: UserDefinedFuncDncl.Define, arguments: 0, desc: '複数の引数を指定する場合は，『，』で区切ります。', icon: null },]

const ExecuteUserDefinedFunc = [
  { name: UserDefinedFuncDncl.UserDefined, arguments: 0, desc: '「新しい関数の定義」で作成した関数を使用します。', icon: null },]

export function FunctionField({ name = "", parentIndex = 0, event, funcType, treeItems = [] }: Props) {

  const [operatorIndex, setOperatorIndex] = useState<number>(0);

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
  const funcs = getFuncs(funcType);

  const handleOnClick = () => {
    let newIndex: number = operatorIndex + 1;
    if (operatorIndex == funcs.length - 1) {
      newIndex = 0;
      if (event) event();
    }
    setOperatorIndex(newIndex);
  }

  let SvgIconButton: any;
  let newIndex: number = operatorIndex;

  if (operatorIndex > funcs.length - 1) {
    setOperatorIndex(0);
    newIndex = 0;
  }

  SvgIconButton = funcs.map(func => func.icon)[newIndex];

  const argumentsCount = funcs.map(func => func.arguments)[newIndex] ?? 0;
  const ArgumentFields: React.ReactNode[] = [];
  const userDefinedFuncNameArray = getUserDefineFunctionNameArray(treeItems);
  //「新しい関数の定義」以外の場合、定義した関数がなければユーザ定義関数のリストを表示するエリアに空の内容を返す
  const isDisabledUserDefined = (funcs.map(func => func.name)[newIndex] == UserDefinedFuncDncl.UserDefined) && (userDefinedFuncNameArray.length == 0);

  for (let i = 0; i < argumentsCount; i++) {
    ArgumentFields.push(
      <React.Fragment key={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${newIndex}_${i}_fragment`}>
        {ArgumentFields.length > 0 && <Grid size="auto" key={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${newIndex}_${i}_comma`}><FixedHeightGrid>,</FixedHeightGrid></Grid>}
        <Grid size="grow" key={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${newIndex}_${i}`}>
          <ValidatedTextField name={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${i}`} label={InputTypeJpEnum.Argument} pattern={ValidationEnum.VariableOrNumber}></ValidatedTextField>
        </Grid>
      </React.Fragment>
    );
  }

  if (ArgumentFields.length == 0) {
    ArgumentFields.push(
      <Grid size="grow" key={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${newIndex}_${0}`}>
        <ValidatedTextField
          name={`${name}_${parentIndex}_${keyPrefixEnum.Argument}_${0}`} label={InputTypeJpEnum.Argument} pattern={ValidationEnum.InitializeArray}></ValidatedTextField>
      </Grid>
    );
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
          <Grid size="grow">
            <ValidatedTextField name={`${name}_${parentIndex}_${keyPrefixEnum.FunctionName}`} label={InputTypeJpEnum.Function} pattern={ValidationEnum.String}></ValidatedTextField>
          </Grid>
        }
        {funcs.map(func => func.name)[newIndex] == UserDefinedFuncDncl.UserDefined &&
          <Grid size="grow">
            {userDefinedFuncNameArray.length > 0 &&
              <FormControl fullWidth size="small">
                <InputLabel id="select-label">定義した関数</InputLabel>
                <Select
                  labelId="select-label"
                  id="select"
                  value={"0"}
                  label="UserDefinedfunction"
                  name={`${name}_${parentIndex}_${keyPrefixEnum.FunctionName}`}
                >
                  {userDefinedFuncNameArray.map((name, index) => (
                    <MenuItem key={`${index}`} value={index}>{name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            }
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
      </Grid>
      <Grid>
        <FormHelperText sx={{ display: 'flex', alignItems: 'center' }}>{funcs.map(func => func.desc)[newIndex] ?? ""}</FormHelperText>
      </Grid>
    </>
  );
}
