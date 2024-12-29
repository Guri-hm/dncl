import { useState } from "react";
import { Statement } from "../../types";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { ReactElement } from "react";
import Box from '@mui/material/Box';
import { DnclTextField } from "./DnclTextField";
import { Operator } from "./Operator";
import { processEnum, keyPrefixEnum, inputTypeEnum } from "./Enum";
import { NowrapText } from "./NowrapText";
import { OperationEnum, OperatorEnum } from "@/app/enum";
import { Operation } from "./Operation";
type Props = {
    statementType: Statement
}

function getEnumIndex<T extends Record<string, string | number>>(enumObj: T, value: T[keyof T]): number {
    return Object.values(enumObj).indexOf(value);
}

export function StatementEditor(params: Props) {

    const [processIndex, setProcessIndex] = useState<number>(getEnumIndex(processEnum, processEnum.SetValueToVariableOrArrayElement));
    const [statement, setStatement] = useState<ReactElement | null>(null);

    const handleChange = (event: any, newValue: processTypes | null) => {
        const index = getEnumIndex(processEnum, newValue?.type ?? processEnum.SetValueToVariableOrArrayElement);
        setProcessIndex(index);
        setStatement(getStatement(index));
    }
    const getStatement: any = (index: number): ReactElement => {

        switch (index) {
            case getEnumIndex(processEnum, processEnum.SetValueToVariableOrArrayElement):
                return <>
                    <Operation>
                        <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.SwitchVariableOrArray}></DnclTextField>
                        <Operator type={OperationEnum.SimpleAssignment}></Operator>
                    </Operation>
                </>

            case getEnumIndex(processEnum, processEnum.InitializeArray):
                //配列の初期化
                return <>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.ArrayWithoutSuffix}></DnclTextField>
                    <Operator type={OperationEnum.SimpleAssignment}></Operator>
                    <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.InitializeArray} label=""></DnclTextField>
                </>
            case getEnumIndex(processEnum, processEnum.BulkAssignToArray):
                return <>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}_1`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.ArrayWithoutSuffix}></DnclTextField>
                    <NowrapText text={'のすべての要素に'}></NowrapText>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}_2`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.SwitchVariableOrNumberOrArray}></DnclTextField>
                    <NowrapText text={'を代入する'}></NowrapText>
                </>
            case getEnumIndex(processEnum, processEnum.Increment):
            case getEnumIndex(processEnum, processEnum.Decrement):
                return <>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}_0`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.SwitchVariableOrArray}></DnclTextField>
                    <NowrapText text={'を'}></NowrapText>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}_1`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.SwitchVariableOrArray}></DnclTextField>
                    <NowrapText text={processIndex == getEnumIndex(processEnum, processEnum.Increment) ? '増やす' : '減らす'}></NowrapText>
                </>
            case getEnumIndex(processEnum, processEnum.ArithmeticOperation):
                return <>
                    <Operation>
                        <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.SwitchVariableOrArray}></DnclTextField>
                        <Operator type={OperationEnum.SimpleAssignment}></Operator>
                    </Operation>
                </>
            default:
                return <></>;
        }
    }

    const result = processNames.filter(item => item.statementType == params.statementType)
        .flatMap(item => item.names);
    const defaultProps = {
        options: result,
        getOptionLabel: (option: processTypes) => option.title,
    };
    switch (params.statementType) {
        case Statement.Input:
            return <>
                <Autocomplete
                    {...defaultProps}
                    id="auto-select"
                    autoSelect
                    renderInput={(params) => (
                        <TextField {...params} label="文の内容" variant="standard" />
                    )}
                    onChange={handleChange}
                    defaultValue={{ title: processEnum.SetValueToVariableOrArrayElement, type: processEnum.SetValueToVariableOrArrayElement }}
                />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        p: 1,
                        m: 1,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                    }}
                >
                    {statement ?? getStatement(getEnumIndex(processEnum, processEnum.SetValueToVariableOrArrayElement))}
                </Box>
            </>;
        case Statement.Operation:
            return <>
                <Autocomplete
                    {...defaultProps}
                    id="auto-select"
                    autoSelect
                    renderInput={(params) => (
                        <TextField {...params} label="文の内容" variant="standard" />
                    )}
                    onChange={handleChange}
                    defaultValue={{ title: processEnum.ArithmeticOperation, type: processEnum.ArithmeticOperation }}
                />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        p: 1,
                        m: 1,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                    }}
                >
                    {statement ?? getStatement(getEnumIndex(processEnum, processEnum.ArithmeticOperation))}
                </Box>
            </>;
        case Statement.Condition:
            return <>
                <Autocomplete
                    {...defaultProps}
                    id="auto-select"
                    autoSelect
                    renderInput={(params) => (
                        <TextField {...params} label="文の内容" variant="standard" />
                    )}
                    onChange={handleChange}
                    defaultValue={null}
                />
                <Box
                    sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        p: 1,
                        m: 1,
                        bgcolor: 'background.paper',
                        borderRadius: 1,
                    }}
                >
                </Box>
            </>;
        default:
            break;
    }
}


interface processTypes {
    title: processEnum;
    type: processEnum;
}



const processNames = [
    {
        statementType: Statement.Input,
        names: [
            { title: processEnum.SetValueToVariableOrArrayElement, type: processEnum.SetValueToVariableOrArrayElement },
            { title: processEnum.InitializeArray, type: processEnum.InitializeArray },
            { title: processEnum.BulkAssignToArray, type: processEnum.BulkAssignToArray },
            { title: processEnum.Increment, type: processEnum.Increment },
            { title: processEnum.Decrement, type: processEnum.Decrement },
        ]
    },
    {
        statementType: Statement.Operation,
        names: [
            { title: processEnum.ArithmeticOperation, type: processEnum.ArithmeticOperation },
            { title: processEnum.ComparisonOperation, type: processEnum.ComparisonOperation },
        ]
    },
    {
        statementType: Statement.Condition,
        names: [
            { title: processEnum.SetValueToVariableOrArrayElement, type: processEnum.SetValueToVariableOrArrayElement },
        ]
    },
];

