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
import { getEnumIndex } from "@/app/utilities";
import { CustomBox } from "./Droppable copy";
type Props = {
    statementType: StatementEnum
}

export function EditorBox(params: Props) {

    const [statement, setStatement] = useState<ReactElement | null>(null);

    const handleChange = (event: any, newValue: processTypes | null) => {
        const index = getEnumIndex(processEnum, newValue?.title ?? processEnum.SetValueToVariableOrArrayElement);
        setStatement(StatementEditor(index));
    }
    const StatementEditor: any = (index: number): ReactElement => {

        const hdnInput = (index: number): ReactElement => {
            return (
                <div>
                    <input name="processIndex" type="hidden" value={index}></input>;
                </div>
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
                    <DnclTextField key={`${keyPrefixEnum.RigthSide}_${index}`} name={keyPrefixEnum.RigthSide} inputType={inputTypeEnum.SwitchVariableOrArray}></DnclTextField>
                    <NowrapText text={index == getEnumIndex(processEnum, processEnum.Increment) ? '増やす' : '減らす'}></NowrapText>
                    {hdnInput(index)}
                </>
            case getEnumIndex(processEnum, processEnum.Output):
                return <>
                    <Operation statementType={params.statementType}></Operation>
                    <Divider orientation="vertical" flexItem />
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
                <CustomBox>
                    {statement ?? StatementEditor(getEnumIndex(processEnum, processEnum.Output))}
                </CustomBox>
            </>;
        case StatementEnum.Input:
            return <>
                {ddl}
                <CustomBox>
                    {statement ?? StatementEditor(getEnumIndex(processEnum, processEnum.SetValueToVariableOrArrayElement))}
                </CustomBox>
            </>;
        case StatementEnum.Condition:
            return <>
                {ddl}
                <CustomBox>
                    {statement ?? StatementEditor(getEnumIndex(processEnum, processEnum.If))}
                </CustomBox>
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

