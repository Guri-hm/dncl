import { useState } from "react";
import { Statement, Validation, OperatorEnum } from "../../types";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { ReactElement } from "react";
import Box from '@mui/material/Box';
import { DnclTextField } from "./DnclTextField";
import { Operator } from "./Operator";
import { processEnum, keyPrefixEnum } from "./Enum";

type Props = {
    statementType: Statement
}

function getEnumIndex<T extends Record<string, string | number>>(enumObj: T, value: T[keyof T]): number {
    return Object.values(enumObj).indexOf(value);
}

export function StatementEditor(params: Props) {

    const [processIndex, setProcessIndex] = useState<number>(getEnumIndex(processEnum, processEnum.SetValueToVariable));
    let elm: ReactElement = <></>;
    let sub: ReactElement = <></>;

    switch (params.statementType) {
        case Statement.Input:
            const result = processNames.filter(item => item.statementType == Statement.Input)
                .flatMap(item => item.names);
            const defaultProps = {
                options: result,
                getOptionLabel: (option: processTypes) => option.title,
            };

            switch (processIndex) {
                case getEnumIndex(processEnum, processEnum.SetValueToVariable):
                    sub =
                        <>
                            <DnclTextField label="変数名" validation={Validation.Variable} name={keyPrefixEnum.LeftSide}></DnclTextField>
                            <Operator type={OperatorEnum.SimpleAssignment}></Operator>
                            <DnclTextField label="値・変数名" validation={Validation.VariableNumber} showSwitch={true} name={keyPrefixEnum.RigthSide}></DnclTextField>
                        </>
                    break;

                case getEnumIndex(processEnum, processEnum.InitializeArray):
                    //配列の初期化
                    sub =
                        <>
                            <DnclTextField label="配列名" validation={Validation.Variable} name={keyPrefixEnum.LeftSide}></DnclTextField>
                            <Operator type={OperatorEnum.SimpleAssignment}></Operator>

                            <Box sx={{
                                display: 'grid',
                                alignItems: 'center',
                                marginRight: '10px',
                                marginLeft: '10px'
                            }}>
                                [
                            </Box>
                            <TextField
                                size="small"
                                required
                                id="outlined-required"
                                label="右辺"
                                defaultValue=""
                                slotProps={{
                                    htmlInput: {
                                        className: 'text-center',
                                        pattern: Validation.InitializeArray
                                    }
                                }}
                            />
                            <Box sx={{
                                display: 'grid',
                                alignItems: 'center',
                                marginRight: '10px',
                                marginLeft: '10px'
                            }}>
                                ]
                            </Box>
                        </>
                    break;
                case getEnumIndex(processEnum, processEnum.AssignValueToIndex):
                    //添字による配列への代入
                    sub =
                        <>
                            <DnclTextField label="配列名" validation={Validation.Variable} name={keyPrefixEnum.LeftSide}></DnclTextField>

                            <Box sx={{
                                display: 'grid',
                                alignItems: 'center',
                                marginRight: '10px',
                                marginLeft: '10px'
                            }}>
                                [
                            </Box>
                            <TextField
                                size="small"
                                required
                                id="outlined-required"
                                label="添字"
                                defaultValue=""
                                slotProps={{
                                    htmlInput: {
                                        className: 'text-center',
                                        pattern: Validation.VariableNumber
                                    }
                                    ,

                                }}
                                sx={{ width: '120px' }}
                            />
                            <Box sx={{
                                display: 'grid',
                                alignItems: 'center',
                                marginRight: '10px',
                                marginLeft: '10px'
                            }}>
                                ]
                            </Box>
                            <Operator type={OperatorEnum.SimpleAssignment}></Operator>

                            <TextField
                                size="small"
                                required
                                id="outlined-required"
                                label="右辺"
                                defaultValue=""
                                slotProps={{
                                    htmlInput: {
                                        className: 'text-center',
                                        pattern: Validation.VariableNumber
                                    }
                                }}
                            />
                        </>
                    break;
                case getEnumIndex(processEnum, processEnum.BulkAssignToArray):
                    sub =
                        <>
                            <DnclTextField label="変数名・配列名" validation={Validation.Variable} name={keyPrefixEnum.LeftSide}></DnclTextField>

                            <Box sx={{
                                display: 'grid',
                                alignItems: 'center',
                                marginRight: '10px',
                                marginLeft: '10px'
                            }}>
                                のすべての要素に
                            </Box>
                            <TextField
                                size="small"
                                required
                                id="outlined-required"
                                label=""
                                defaultValue=""
                                slotProps={{
                                    htmlInput: {
                                        className: 'text-center',
                                        pattern: Validation.VariableNumber
                                    }
                                }}
                            />
                            <Box sx={{
                                display: 'grid',
                                alignItems: 'center',
                                marginRight: '10px',
                                marginLeft: '10px'
                            }}>
                                を代入する
                            </Box>
                        </>
                    break;
                case getEnumIndex(processEnum, processEnum.Increment):
                case getEnumIndex(processEnum, processEnum.Decrement):
                    sub =
                        <>
                            <DnclTextField label="変数名" validation={Validation.Variable} name={keyPrefixEnum.LeftSide}></DnclTextField>

                            <Box sx={{
                                display: 'grid',
                                alignItems: 'center',
                                marginRight: '10px',
                                marginLeft: '10px'
                            }}>
                                を
                            </Box>
                            <TextField
                                size="small"
                                required
                                id="outlined-required"
                                label=""
                                defaultValue=""
                                slotProps={{
                                    htmlInput: {
                                        className: 'text-center',
                                        pattern: Validation.VariableNumber
                                    }
                                }}
                            />
                            <Box sx={{
                                display: 'grid',
                                alignItems: 'center',
                                marginRight: '10px',
                                marginLeft: '10px'
                            }}>
                                {processIndex == getEnumIndex(processEnum, processEnum.Increment) ? '増やす' : '減らす'}
                            </Box>
                        </>
                    break;
                default:
                    break;
            }

            elm =
                <>
                    <Autocomplete
                        {...defaultProps}
                        id="auto-select"
                        autoSelect
                        renderInput={(params) => (
                            <TextField {...params} label="文の内容" variant="standard" />
                        )}
                        onChange={(event: any, newValue: processTypes | null) => {
                            setProcessIndex(getEnumIndex(processEnum, newValue?.type ?? processEnum.SetValueToVariable));
                        }}
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
                        {sub}
                    </Box>
                </>;
            break;
        case Statement.Condition:
            break;
        default:
            break;
    }

    return (
        <div className="mt-3">
            {elm}
        </div>

    );
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

