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
import { Divider } from "@mui/material";
type Props = {
    statementType: StatementEnum
}

function getEnumIndex<T extends Record<string, string | number>>(enumObj: T, value: T[keyof T]): number {
    return Object.values(enumObj).indexOf(value);
}

export function StatementEditor(params: Props) {

    const [processIndex, setProcessIndex] = useState<number>(0);
    const [statement, setStatement] = useState<ReactElement | null>(null);

    const handleChange = (event: any, newValue: processTypes | null) => {
        const index = getEnumIndex(processEnum, newValue?.title ?? processEnum.SetValueToVariableOrArrayElement);
        setProcessIndex(index);
        setStatement(getStatement(index));
    }
    const getStatement: any = (index: number): ReactElement => {

        switch (index) {
            case getEnumIndex(processEnum, processEnum.SetValueToVariableOrArrayElement):
                return <>
                    <Operation statementType={params.statementType}>
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
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.ArrayWithoutSuffix}></DnclTextField>
                    <NowrapText text={'のすべての要素に'}></NowrapText>
                    <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.SwitchVariableOrNumberOrArray}></DnclTextField>
                    <NowrapText text={'を代入する'}></NowrapText>
                </>
            case getEnumIndex(processEnum, processEnum.Increment):
            case getEnumIndex(processEnum, processEnum.Decrement):
                return <>
                    <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.SwitchVariableOrArray}></DnclTextField>
                    <NowrapText text={'を'}></NowrapText>
                    <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.SwitchVariableOrArray}></DnclTextField>
                    <NowrapText text={index == getEnumIndex(processEnum, processEnum.Increment) ? '増やす' : '減らす'}></NowrapText>
                </>
            case getEnumIndex(processEnum, processEnum.Output):
                return <>
                    <Operation statementType={params.statementType}></Operation>
                    <Divider orientation="vertical" flexItem />
                    <NowrapText text={'を表示する'}></NowrapText>
                </>
            case getEnumIndex(processEnum, processEnum.If):
                return <>
                    <NowrapText text={'もし'}></NowrapText>
                    <Divider sx={{ marginRight: 1 }} orientation="vertical" flexItem />
                    <Operation statementType={params.statementType}>
                    </Operation>
                    <Divider sx={{ marginLeft: 1 }} orientation="vertical" flexItem />
                    <NowrapText text={'ならば'}></NowrapText>
                </>
            case getEnumIndex(processEnum, processEnum.ElseIf):
                return <>
                    <NowrapText text={'を実行し，そうでなくもし'}></NowrapText>
                    <Divider sx={{ marginRight: 1 }} orientation="vertical" flexItem />
                    <Operation statementType={params.statementType}>
                    </Operation>
                    <Divider sx={{ marginLeft: 1 }} orientation="vertical" flexItem />
                    <NowrapText text={'ならば'}></NowrapText>
                </>
            case getEnumIndex(processEnum, processEnum.Else):
                return <>
                    <NowrapText text={'を実行し，そうでなければ'}></NowrapText>
                </>
            case getEnumIndex(processEnum, processEnum.EndIf):
                return <>
                    <NowrapText text={'を実行する'}></NowrapText>
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

    const ddl = <Autocomplete
        {...defaultProps}
        id="auto-select"
        autoSelect
        renderInput={(params) => (
            <TextField {...params} label="文の内容" variant="standard" />
        )}
        onChange={handleChange}
        defaultValue={result[0]}
    />

    switch (params.statementType) {
        case StatementEnum.Output:
            return <>
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
                    {statement ?? getStatement(getEnumIndex(processEnum, processEnum.Output))}
                </Box>
            </>;
        case StatementEnum.Input:
            return <>
                {ddl}
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
        case StatementEnum.Condition:
            return <>
                {ddl}
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
                    {statement ?? getStatement(getEnumIndex(processEnum, processEnum.If))}
                </Box>
            </>;
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
];

