import { useState } from "react";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { ReactElement } from "react";
import Box from '@mui/material/Box';
import { DnclTextField } from "./DnclTextField";
import { Operator } from "./Operator";
import { processEnum, keyPrefixEnum, inputTypeEnum } from "./Enum";
import { NowrapText } from "./NowrapText";
import { OperationEnum, StatementEnum } from "@/app/enum";
import { Operation } from "./Operation";
import { Divider, FormControl, InputLabel, MenuItem, Select, SelectChangeEvent } from "@mui/material";
import { getEnumIndex } from "@/app/utilities";
import { CustomBox } from "./CustomBox";
import Grid from '@mui/material/Grid2';

type Props = {
    statementType: StatementEnum
}

export function EditorBox(params: Props) {

    const [statement, setStatement] = useState<ReactElement | null>(null);

    const handleChange = (event: SelectChangeEvent) => {
        const index = getEnumIndex(processEnum, event.target.value as processEnum ?? processEnum.SetValueToVariableOrArrayElement);
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
            case getEnumIndex(processEnum, processEnum.SetValueToVariableOrArrayElement):
                return <>
                    <Operation statementType={params.statementType}>
                        <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.SwitchVariableOrArray}></DnclTextField>
                        <Operator type={OperationEnum.SimpleAssignment}></Operator>
                    </Operation>
                    {hdnInput(index)}
                </>

            case getEnumIndex(processEnum, processEnum.InitializeArray):
                //配列の初期化
                return <>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.ArrayWithoutSuffix}></DnclTextField>
                    <Operator type={OperationEnum.SimpleAssignment}></Operator>
                    <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.InitializeArray} label=""></DnclTextField>
                    {hdnInput(index)}
                </>
            case getEnumIndex(processEnum, processEnum.BulkAssignToArray):
                return <>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.ArrayWithoutSuffix}></DnclTextField>
                    <NowrapText text={'のすべての要素に'}></NowrapText>
                    <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.SwitchVariableOrNumberOrArray}></DnclTextField>
                    <NowrapText text={'を代入する'}></NowrapText>
                    {hdnInput(index)}
                </>
            case getEnumIndex(processEnum, processEnum.Increment):
            case getEnumIndex(processEnum, processEnum.Decrement):
                return <>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.SwitchVariableOrArray}></DnclTextField>
                    <NowrapText text={'を'}></NowrapText>
                    <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.SwitchVariableOrNumberOrArray}></DnclTextField>
                    <NowrapText text={index == getEnumIndex(processEnum, processEnum.Increment) ? '増やす' : '減らす'}></NowrapText>
                    {hdnInput(index)}
                </>
            case getEnumIndex(processEnum, processEnum.Output):
                return <>
                    <Operation statementType={params.statementType}></Operation>
                    <Divider sx={{ marginLeft: 1 }} orientation="vertical" flexItem />
                    <NowrapText text={'を表示する'}></NowrapText>
                    {hdnInput(index)}
                </>
            case getEnumIndex(processEnum, processEnum.If):
                return <>
                    <NowrapText text={'もし'}></NowrapText>
                    <Divider sx={{ marginRight: 1 }} orientation="vertical" flexItem />
                    <Operation statementType={params.statementType}>
                    </Operation>
                    <Divider sx={{ marginLeft: 1 }} orientation="vertical" flexItem />
                    <NowrapText text={'ならば'}></NowrapText>
                    {hdnInput(index)}
                </>
            case getEnumIndex(processEnum, processEnum.ElseIf):
                return <>
                    <NowrapText text={'を実行し，そうでなくもし'}></NowrapText>
                    <Divider sx={{ marginRight: 1 }} orientation="vertical" flexItem />
                    <Operation statementType={params.statementType}>
                    </Operation>
                    <Divider sx={{ marginLeft: 1 }} orientation="vertical" flexItem />
                    <NowrapText text={'ならば'}></NowrapText>
                    {hdnInput(index)}
                </>
            case getEnumIndex(processEnum, processEnum.Else):
                return <>
                    <NowrapText text={'を実行し，そうでなければ'}></NowrapText>
                    {hdnInput(index)}
                </>
            case getEnumIndex(processEnum, processEnum.EndIf):
                return <>
                    <NowrapText text={'を実行する'}></NowrapText>
                    {hdnInput(index)}
                </>
            case getEnumIndex(processEnum, processEnum.While):
                return <>
                    <Operation statementType={params.statementType}>
                    </Operation>
                    <Divider sx={{ marginLeft: 1 }} orientation="vertical" flexItem />
                    <NowrapText text={'の間，'}></NowrapText>
                    {hdnInput(index)}
                </>
            case getEnumIndex(processEnum, processEnum.EndWhile):
                return <>
                    <NowrapText text={'を繰り返す'}></NowrapText>
                    {hdnInput(index)}
                </>
            case getEnumIndex(processEnum, processEnum.DoWhile):
                return <>
                    <NowrapText text={'繰り返し，'}></NowrapText>
                    {hdnInput(index)}
                </>
            case getEnumIndex(processEnum, processEnum.EndDoWhile):
                return <>
                    <NowrapText text={'を，'}></NowrapText>
                    <Divider sx={{ marginRight: 1 }} orientation="vertical" flexItem />
                    <Operation statementType={params.statementType}>
                    </Operation>
                    <Divider sx={{ marginLeft: 1 }} orientation="vertical" flexItem />
                    <NowrapText text={'になるまで実行する'}></NowrapText>
                    {hdnInput(index)}
                </>
            case getEnumIndex(processEnum, processEnum.ForIncrement):
            case getEnumIndex(processEnum, processEnum.ForDecrement):
                return <>
                    <Grid container spacing={1} direction='column'>
                        <Grid container direction='row'>
                            <Grid size='grow'>
                                <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.VariableOnly}></DnclTextField>
                            </Grid>
                            <NowrapText text={'を'}></NowrapText>
                            <Grid size='grow'>
                                <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.InitialValue}`} name={keyPrefixEnum.RigthSide} suffixValue={keyPrefixEnum.InitialValue} inputType={inputTypeEnum.Number} label={"初期値"}></DnclTextField>
                            </Grid>
                            <NowrapText text={'から'}></NowrapText>
                        </Grid>
                        <Grid container direction='row'>
                            <Grid size='grow'>
                                <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.EndValue}`} name={keyPrefixEnum.RigthSide} suffixValue={keyPrefixEnum.EndValue} inputType={inputTypeEnum.Number} label={"終了値"}></DnclTextField>
                            </Grid>
                            <NowrapText text={'まで'}></NowrapText>
                            <Grid size='grow'>
                                <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.Difference}`} name={keyPrefixEnum.RigthSide} suffixValue={keyPrefixEnum.Difference} inputType={inputTypeEnum.Number} label={"差分"}></DnclTextField>
                            </Grid>
                            <NowrapText text={index == getEnumIndex(processEnum, processEnum.ForIncrement) ? 'ずつ増やしながら，' : 'ずつ減らしながら，'}></NowrapText>
                        </Grid>
                    </Grid>
                    {hdnInput(index)}
                </>
            case getEnumIndex(processEnum, processEnum.EndFor):
                return <>
                    <NowrapText text={'を繰り返す'}></NowrapText>
                    {hdnInput(index)}
                </>
            case getEnumIndex(processEnum, processEnum.Predefinedfunction):
                return <>
                    <Operation statementType={params.statementType}>
                        <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.SwitchVariableOrArray}></DnclTextField>
                        <Operator type={OperationEnum.SimpleAssignment}></Operator>
                    </Operation>
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
            <Select labelId="process-select-label" defaultValue={result[0].title} onChange={handleChange} label="文の内容" >
                {result.map((item, index) => (
                    <MenuItem key={index} value={item.title}> {item.title} </MenuItem>
                ))}
            </Select>
        </FormControl>
    </Box>

    switch (params.statementType) {
        case StatementEnum.Output:
            return <>
                <CustomBox>
                    {statement ?? StatementEditor(getEnumIndex(processEnum, processEnum.Output))}
                </CustomBox>
            </>
        case StatementEnum.Input:
            return <>
                {ddl}
                <CustomBox>
                    {statement ?? StatementEditor(getEnumIndex(processEnum, processEnum.SetValueToVariableOrArrayElement))}
                </CustomBox>
            </>
        case StatementEnum.Condition:
            return <>
                {ddl}
                <CustomBox>
                    {statement ?? StatementEditor(getEnumIndex(processEnum, processEnum.If))}
                </CustomBox>
            </>
        case StatementEnum.ConditionalLoopPreTest:
            return <>
                {ddl}
                <CustomBox>
                    {statement ?? StatementEditor(getEnumIndex(processEnum, processEnum.While))}
                </CustomBox>
            </>
        case StatementEnum.ConditionalLoopPostTest:
            return <>
                {ddl}
                <CustomBox>
                    {statement ?? StatementEditor(getEnumIndex(processEnum, processEnum.DoWhile))}
                </CustomBox>
            </>
        case StatementEnum.SequentialIteration:
            return <>
                {ddl}
                <CustomBox>
                    {statement ?? StatementEditor(getEnumIndex(processEnum, processEnum.ForIncrement))}
                </CustomBox>
            </>
        case StatementEnum.Predefinedfunction:
            return <>
                {ddl}
                <CustomBox>
                    {statement ?? StatementEditor(getEnumIndex(processEnum, processEnum.Predefinedfunction))}
                </CustomBox>
            </>
        default:
            break;
    }
}


interface processTypes {
    title: processEnum;
}

const processNames = [
    {
        statementType: StatementEnum.Output,
        names: [
            { title: processEnum.Output },
        ]
    },
    {
        statementType: StatementEnum.Input,
        names: [
            { title: processEnum.SetValueToVariableOrArrayElement },
            { title: processEnum.InitializeArray },
            { title: processEnum.BulkAssignToArray },
            { title: processEnum.Increment },
            { title: processEnum.Decrement },
        ]
    },
    {
        statementType: StatementEnum.Condition,
        names: [
            { title: processEnum.If },
            { title: processEnum.Else },
            { title: processEnum.ElseIf },
            { title: processEnum.EndIf },
        ]
    },
    {
        statementType: StatementEnum.ConditionalLoopPreTest,
        names: [
            { title: processEnum.While },
            { title: processEnum.EndWhile },
        ]
    },
    {
        statementType: StatementEnum.ConditionalLoopPostTest,
        names: [
            { title: processEnum.DoWhile },
            { title: processEnum.EndDoWhile },
        ]
    },
    {
        statementType: StatementEnum.SequentialIteration,
        names: [
            { title: processEnum.ForIncrement },
            { title: processEnum.ForDecrement },
            { title: processEnum.EndFor },
        ]
    },
    {
        statementType: StatementEnum.Predefinedfunction,
        names: [
            { title: processEnum.Predefinedfunction },
        ]
    },
];

