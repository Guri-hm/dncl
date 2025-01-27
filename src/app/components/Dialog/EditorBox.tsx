import { useState } from "react";
import { ReactElement } from "react";
import Box from '@mui/material/Box';
import { DnclTextField } from "./DnclTextField";
import { Operator } from "./Operator";
import { keyPrefixEnum, inputTypeEnum } from "./Enum";
import { NowrapText } from "./NowrapText";
import { OperationEnum, StatementEnum, ProcessEnum, DnclStatement } from "@/app/enum";
import { Operation } from "./Operation";
import { Divider, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { CustomBox } from "./CustomBox";
import Grid from '@mui/material/Grid2';
import { TreeItems } from "@/app/types";
import { WrapText } from "./WrapText";
import { Arguments } from "./Arguments";

type Props = {
    statementType: StatementEnum
    treeItems: TreeItems
}

export function EditorBox(params: Props) {

    const [statement, setStatement] = useState<ReactElement | null>(null);

    const handleChange = (event: SelectChangeEvent) => {
        const index = event.target.value ?? ProcessEnum.SetValToVariableOrArray;
        setStatement(StatementEditor(index));
    }

    const StatementEditor: any = (index: number): ReactElement => {

        const hdnInput = (index: number): ReactElement => {
            return (
                <>
                    <input name="processIndex" type="hidden" value={index}></input>
                </>
            )
        }

        switch (index) {
            case ProcessEnum.SetValToVariableOrArray:
                return <>
                    <Operation processType={ProcessEnum.SetValToVariableOrArray} treeItems={params.treeItems}>
                        <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.SwitchVariableOrArray}></DnclTextField>
                        <Operator type={OperationEnum.ForDncl}></Operator>
                    </Operation>
                    {hdnInput(index)}
                </>

            case ProcessEnum.InitializeArray:
                //配列の初期化
                return <>
                    <Operation treeItems={params.treeItems} processType={ProcessEnum.InitializeArray}>
                        <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.ArrayWithoutSuffix}></DnclTextField>
                        <Operator type={OperationEnum.ForDncl}></Operator>
                    </Operation>
                    {hdnInput(index)}
                    {/* <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.InitializeArray} label=""></DnclTextField> */}
                </>
            case ProcessEnum.BulkAssignToArray:
                return <>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.ArrayWithoutSuffix}></DnclTextField>
                    <NowrapText text={'のすべての要素に'}></NowrapText>
                    <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.SwitchVariableOrNumberOrArray}></DnclTextField>
                    <NowrapText text={'を代入する'}></NowrapText>
                    {hdnInput(index)}
                </>
            case ProcessEnum.Increment:
            case ProcessEnum.Decrement:
                return <>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.SwitchVariableOrArray}></DnclTextField>
                    <NowrapText text={'を'}></NowrapText>
                    <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.SwitchVariableOrNumberOrArray}></DnclTextField>
                    <NowrapText text={index == ProcessEnum.Increment ? '増やす' : '減らす'}></NowrapText>
                    {hdnInput(index)}
                </>
            case ProcessEnum.Output:
                return <>
                    <Operation processType={ProcessEnum.Output} treeItems={params.treeItems}></Operation>
                    <Divider sx={{ marginLeft: 1 }} orientation="vertical" flexItem />
                    <NowrapText text={'を表示する'}></NowrapText>
                    {hdnInput(index)}
                </>
            case ProcessEnum.If:
                return <>
                    <NowrapText text={'もし'}></NowrapText>
                    <Divider sx={{ marginRight: 1 }} orientation="vertical" flexItem />
                    <Operation processType={ProcessEnum.If} treeItems={params.treeItems}>
                    </Operation>
                    <Divider sx={{ marginLeft: 1 }} orientation="vertical" flexItem />
                    <NowrapText text={'ならば'}></NowrapText>
                    {hdnInput(index)}
                </>
            case ProcessEnum.ElseIf:
                return <>
                    <WrapText text={'を実行し，そうでなくもし'}></WrapText>
                    <Divider sx={{ marginRight: 1 }} orientation="vertical" flexItem />
                    <Operation processType={ProcessEnum.ElseIf} treeItems={params.treeItems}>
                    </Operation>
                    <Divider sx={{ marginLeft: 1 }} orientation="vertical" flexItem />
                    <NowrapText text={'ならば'}></NowrapText>
                    {hdnInput(index)}
                </>
            case ProcessEnum.Else:
                return <>
                    <NowrapText text={'を実行し，そうでなければ'}></NowrapText>
                    {hdnInput(index)}
                </>
            case ProcessEnum.EndIf:
                return <>
                    <NowrapText text={'を実行する'}></NowrapText>
                    {hdnInput(index)}
                </>
            case ProcessEnum.While:
                return <>
                    <Operation processType={ProcessEnum.While} treeItems={params.treeItems}>
                    </Operation>
                    <Divider sx={{ marginLeft: 1 }} orientation="vertical" flexItem />
                    <NowrapText text={'の間，'}></NowrapText>
                    {hdnInput(index)}
                </>
            case ProcessEnum.EndWhile:
                return <>
                    <NowrapText text={'を繰り返す'}></NowrapText>
                    {hdnInput(index)}
                </>
            case ProcessEnum.DoWhile:
                return <>
                    <NowrapText text={'繰り返し，'}></NowrapText>
                    {hdnInput(index)}
                </>
            case ProcessEnum.EndDoWhile:
                return <>
                    <NowrapText text={'を，'}></NowrapText>
                    <Divider sx={{ marginRight: 1 }} orientation="vertical" flexItem />
                    <Operation  processType={ProcessEnum.EndDoWhile}>
                    </Operation>
                    <Divider sx={{ marginLeft: 1 }} orientation="vertical" flexItem />
                    <NowrapText text={'になるまで実行する'}></NowrapText>
                    {hdnInput(index)}
                </>
            case ProcessEnum.ForIncrement:
            case ProcessEnum.ForDecrement:
                return <>
                    <Grid container spacing={1} direction='column'>
                        <Grid container direction='row'>
                            <Grid size='grow'>
                                <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.VariableOnly}></DnclTextField>
                            </Grid>
                            <NowrapText text={'を'}></NowrapText>
                            <Grid size='grow'>
                                <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.InitialValue}`} name={keyPrefixEnum.RigthSide} suffixValue={keyPrefixEnum.InitialValue} inputType={inputTypeEnum.VariableOrNumber} label={"初期値"}></DnclTextField>
                            </Grid>
                            <NowrapText text={'から'}></NowrapText>
                        </Grid>
                        <Grid container direction='row'>
                            <Grid size='grow'>
                                <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.EndValue}`} name={keyPrefixEnum.RigthSide} suffixValue={keyPrefixEnum.EndValue} inputType={inputTypeEnum.VariableOrNumber} label={"終了値"}></DnclTextField>
                            </Grid>
                            <NowrapText text={'まで'}></NowrapText>
                            <Grid size='grow'>
                                <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.Difference}`} name={keyPrefixEnum.RigthSide} suffixValue={keyPrefixEnum.Difference} inputType={inputTypeEnum.VariableOrNumber} label={"差分"}></DnclTextField>
                            </Grid>
                            <NowrapText text={index == ProcessEnum.ForIncrement ? 'ずつ増やしながら，' : 'ずつ減らしながら，'}></NowrapText>
                        </Grid>
                    </Grid>
                    {hdnInput(index)}
                </>
            case ProcessEnum.EndFor:
                return <>
                    <NowrapText text={'を繰り返す'}></NowrapText>
                    {hdnInput(index)}
                </>
            case ProcessEnum.DefineFunction:
                return <>
                    <NowrapText text={'関数'}></NowrapText>
                    <Divider sx={{ marginRight: 1 }} orientation="vertical" flexItem />
                    <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.UserDefinedfunction}`} name={keyPrefixEnum.RigthSide} suffixValue={keyPrefixEnum.UserDefinedfunction} inputType={inputTypeEnum.UserDefinedfunction}></DnclTextField>
                    <Divider sx={{ marginLeft: 1 }} orientation="vertical" flexItem />
                    <NowrapText text={'を'}></NowrapText>
                    {hdnInput(index)}
                </>
            case ProcessEnum.Defined:
                return <>
                    <NowrapText text={'と定義する'}></NowrapText>
                    {hdnInput(index)}
                </>
            case ProcessEnum.ExecuteUserDefinedFunction:
                return <>
                    <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.UserDefinedfunction}`} name={keyPrefixEnum.RigthSide} suffixValue={keyPrefixEnum.UserDefinedfunction} inputType={inputTypeEnum.ExecuteUserDefinedFunction} treeItems={params.treeItems}></DnclTextField>
                    {hdnInput(index)}
                </>
            default:
                return <></>
        }
    }

    const result = processNames.filter(item => item.statementType == params.statementType)
        .flatMap(item => item.names);
    // const defaultProps = {
    //     options: result,
    //     getOptionLabel: (option: processTypes) => option.title,
    // };

    const ddl = <Box sx={{ minWidth: 120 }}>
        <FormControl variant="standard" fullWidth>
            <InputLabel id="process-select-label">文の内容</InputLabel>
            <Select labelId="process-select-label" defaultValue={result[0].value.toString()} onChange={handleChange} label="文の内容" >
                {result.map((item, index) => (
                    <MenuItem key={index} value={item.value}> {item.title} </MenuItem>
                ))}
            </Select>
        </FormControl>
    </Box>

    switch (params.statementType) {
        case StatementEnum.Output:
            return <>
                <CustomBox>
                    {statement ?? StatementEditor(ProcessEnum.Output)}
                </CustomBox>
            </>
        case StatementEnum.Input:
            return <>
                {ddl}
                <CustomBox>
                    {statement ?? StatementEditor(ProcessEnum.SetValToVariableOrArray)}
                </CustomBox>
            </>
        case StatementEnum.Condition:
            return <>
                {ddl}
                <CustomBox>
                    {statement ?? StatementEditor(ProcessEnum.If)}
                </CustomBox>
            </>
        case StatementEnum.ConditionalLoopPreTest:
            return <>
                {ddl}
                <CustomBox>
                    {statement ?? StatementEditor(ProcessEnum.While)}
                </CustomBox>
            </>
        case StatementEnum.ConditionalLoopPostTest:
            return <>
                {ddl}
                <CustomBox>
                    {statement ?? StatementEditor(ProcessEnum.DoWhile)}
                </CustomBox>
            </>
        case StatementEnum.SequentialIteration:
            return <>
                {ddl}
                <CustomBox>
                    {statement ?? StatementEditor(ProcessEnum.ForIncrement)}
                </CustomBox>
            </>
        case StatementEnum.UserDefinedfunction:
            return <>
                {ddl}
                <CustomBox>
                    {statement ?? StatementEditor(ProcessEnum.DefineFunction)}
                </CustomBox>
            </>
        case StatementEnum.ExecuteUserDefinedFunction:
            return <>
                {ddl}
                <CustomBox>
                    {statement ?? StatementEditor(ProcessEnum.ExecuteUserDefinedFunction)}
                </CustomBox>
            </>
        default:
            break;
    }
}


interface processTypes {
    title: ProcessEnum;
}

const processNames = [
    {
        statementType: StatementEnum.Output,
        names: [
            { title: DnclStatement.Output, value: ProcessEnum.Output },
        ]
    },
    {
        statementType: StatementEnum.Input,
        names: [
            { title: DnclStatement.SetValToVariableOrArray, value: ProcessEnum.SetValToVariableOrArray },
            { title: DnclStatement.InitializeArray, value: ProcessEnum.InitializeArray },
            { title: DnclStatement.BulkAssignToArray, value: ProcessEnum.BulkAssignToArray },
            { title: DnclStatement.Increment, value: ProcessEnum.Increment },
            { title: DnclStatement.Decrement, value: ProcessEnum.Decrement },
        ]
    },
    {
        statementType: StatementEnum.Condition,
        names: [
            { title: DnclStatement.If, value: ProcessEnum.If },
            { title: DnclStatement.Else, value: ProcessEnum.Else },
            { title: DnclStatement.ElseIf, value: ProcessEnum.ElseIf },
            { title: DnclStatement.EndIf, value: ProcessEnum.EndIf },
        ]
    },
    {
        statementType: StatementEnum.ConditionalLoopPreTest,
        names: [
            { title: DnclStatement.While, value: ProcessEnum.While },
            { title: DnclStatement.EndWhile, value: ProcessEnum.EndWhile },
        ]
    },
    {
        statementType: StatementEnum.ConditionalLoopPostTest,
        names: [
            { title: DnclStatement.DoWhile, value: ProcessEnum.DoWhile },
            { title: DnclStatement.EndDoWhile, value: ProcessEnum.EndDoWhile },
        ]
    },
    {
        statementType: StatementEnum.SequentialIteration,
        names: [
            { title: DnclStatement.ForIncrement, value: ProcessEnum.ForIncrement },
            { title: DnclStatement.ForDecrement, value: ProcessEnum.ForDecrement },
            { title: DnclStatement.EndFor, value: ProcessEnum.EndFor },
        ]
    },
    {
        statementType: StatementEnum.UserDefinedfunction,
        names: [
            { title: DnclStatement.DefineFunction, value: ProcessEnum.DefineFunction },
            { title: DnclStatement.Defined, value: ProcessEnum.Defined },
        ]
    },
    {
        statementType: StatementEnum.ExecuteUserDefinedFunction,
        names: [
            { title: DnclStatement.ExecuteUserDefinedFunction, value: ProcessEnum.ExecuteUserDefinedFunction },
        ]
    },
];

