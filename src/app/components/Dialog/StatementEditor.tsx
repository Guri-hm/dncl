import { useState } from "react";
import { Statement, OperatorEnum } from "../../types";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { ReactElement } from "react";
import Box from '@mui/material/Box';
import { DnclTextField } from "./DnclTextField";
import { Operator } from "./Operator";
import { processEnum, keyPrefixEnum, inputTypeEnum } from "./Enum";
import { NowrapText } from "./NowrapText";

type Props = {
    statementType: Statement
}

function getEnumIndex<T extends Record<string, string | number>>(enumObj: T, value: T[keyof T]): number {
    return Object.values(enumObj).indexOf(value);
}

export function StatementEditor(params: Props) {

    const [processIndex, setProcessIndex] = useState<number>(getEnumIndex(processEnum, processEnum.SetValueToVariable));
    const [statement, setStatement] = useState<ReactElement | null>(null);

    const handleChange = (event: any, newValue: processTypes | null) => {
        const index = getEnumIndex(processEnum, newValue?.type ?? processEnum.SetValueToVariable);
        setProcessIndex(index);
        setStatement(getStatement(index));
    }
    const getStatement: any = (index: number): ReactElement => {

        switch (index) {
            case getEnumIndex(processEnum, processEnum.SetValueToVariable):
                return <>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.VariableOnly}></DnclTextField>
                    <Operator type={OperatorEnum.SimpleAssignment}></Operator>
                    <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.Switch}></DnclTextField>
                </>

            case getEnumIndex(processEnum, processEnum.InitializeArray):
                //配列の初期化
                return <>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.ArrayWithoutSuffix}></DnclTextField>
                    <Operator type={OperatorEnum.SimpleAssignment}></Operator>
                    <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.InitializeArray} label=""></DnclTextField>
                </>
            case getEnumIndex(processEnum, processEnum.AssignValueToIndex):
                //添字による配列への代入
                return <>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.Array}></DnclTextField>
                    <Operator type={OperatorEnum.SimpleAssignment}></Operator>
                    <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.VariableOrNumber}></DnclTextField>
                </>
            case getEnumIndex(processEnum, processEnum.BulkAssignToArray):
                return <>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}_1`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.ArrayWithoutSuffix}></DnclTextField>
                    <NowrapText text={'のすべての要素に'}></NowrapText>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}_2`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.VariableOrNumber}></DnclTextField>
                    <NowrapText text={'を代入する'}></NowrapText>
                </>
            case getEnumIndex(processEnum, processEnum.Increment):
            case getEnumIndex(processEnum, processEnum.Decrement):
                return <>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}_1`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.Switch}></DnclTextField>
                    <NowrapText text={'を'}></NowrapText>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}_2`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.VariableOrNumber}></DnclTextField>
                    <NowrapText text={processIndex == getEnumIndex(processEnum, processEnum.Increment) ? '増やす' : '減らす'}></NowrapText>
                </>
            default:
                return <></>;
        }
    }

    switch (params.statementType) {
        case Statement.Input:
            const result = processNames.filter(item => item.statementType == Statement.Input)
                .flatMap(item => item.names);
            const defaultProps = {
                options: result,
                getOptionLabel: (option: processTypes) => option.title,
            };
            return <>
                <Autocomplete
                    {...defaultProps}
                    id="auto-select"
                    autoSelect
                    renderInput={(params) => (
                        <TextField {...params} label="文の内容" variant="standard" />
                    )}
                    onChange={handleChange}
                    defaultValue={{ title: processEnum.SetValueToVariable, type: processEnum.SetValueToVariable }}
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
                    {statement ?? getStatement(getEnumIndex(processEnum, processEnum.SetValueToVariable))}
                </Box>
            </>;
        case Statement.Condition:
            break;
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
            { title: processEnum.SetValueToVariable, type: processEnum.SetValueToVariable },
            { title: processEnum.InitializeArray, type: processEnum.InitializeArray },
            { title: processEnum.AssignValueToIndex, type: processEnum.AssignValueToIndex },
            { title: processEnum.BulkAssignToArray, type: processEnum.BulkAssignToArray },
            { title: processEnum.Increment, type: processEnum.Increment },
            { title: processEnum.Decrement, type: processEnum.Decrement },
        ]
    }
];

