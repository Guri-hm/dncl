import { useState } from "react";
import { Statement } from "../../types";
import TextField from '@mui/material/TextField';
import Autocomplete from '@mui/material/Autocomplete';
import { ReactElement } from "react";
import Box from '@mui/material/Box';
import { DnclTextField } from "./DnclTextField";
import { Operator } from "./Operator";
import { processEnum, keyPrefixEnum, inputTypeEnum, bracketEnum } from "./Enum";
import { NowrapText } from "./NowrapText";
import { OperatorEnum, BraketSymbolEnum } from "@/app/enum";
import Button from '@mui/material/Button';
import AddIcon from '@mui/icons-material/Add';
import { DnclTextFieldProps } from "./DnclTextField";
import IconButton from '@mui/material/IconButton';
import BackspaceIcon from '@mui/icons-material/Backspace';
import Stack from '@mui/material/Stack';
import { DraggableItem } from "./DraggableItem";
import {
    DndContext,
    DragOverlay,
    defaultDropAnimationSideEffects
} from "@dnd-kit/core";
import { Droppable } from "../Droppable";
import { createPortal } from "react-dom";

type Props = {
    statementType: Statement
}

function getEnumIndex<T extends Record<string, string | number>>(enumObj: T, value: T[keyof T]): number {
    return Object.values(enumObj).indexOf(value);
}

const searchValue = (key: string | null) => {

    if (key == null) return;
    function getEnumValueByKey(enumObj: any, key: string): any {
        return enumObj[key as keyof typeof enumObj];
    }
    const keys = Object.keys(BraketSymbolEnum);
    return keys.includes(key) ? getEnumValueByKey(BraketSymbolEnum, key) : null;
};

export function StatementEditor(params: Props) {

    const [processIndex, setProcessIndex] = useState<number>(getEnumIndex(processEnum, processEnum.SetValueToVariable));
    const [statement, setStatement] = useState<ReactElement | null>(null);
    const [termComponents, setTermComponents] = useState<DnclTextFieldProps[]>([{ name: keyPrefixEnum.RigthSide }]);
    const [dropCount, setDropCount] = useState(0);
    const [isDragging, setIsDragging] = useState(false);
    const [activeId, setActiveId] = useState<string>("");

    const addTermComponent = () => {
        setTermComponents([...termComponents, { name: keyPrefixEnum.RigthSide }]);
    };
    const removeTermComponent = (index: number) => {
        setTermComponents(termComponents.filter((_, i) => i !== index));
    };

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
            case getEnumIndex(processEnum, processEnum.ArithmeticOperation):
                return <>
                    <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                        <DndContext
                            onDragStart={(event) => {
                                const { active } = event;
                                if (active == null) {
                                    return;
                                }
                                setActiveId(event.active.id.toString());
                                setIsDragging(true);
                            }}
                            onDragEnd={(event) => {
                                const { over } = event;
                                setIsDragging(false);
                                setActiveId("");
                                if (over == null) {
                                    return;
                                }
                                setDropCount((x) => x + 1);
                            }}
                        >
                            <Stack direction="row" spacing={2}>
                                <DraggableItem id={bracketEnum.LeftBraket} value={BraketSymbolEnum.LeftBraket} />
                                <DraggableItem id={bracketEnum.RigthBraket} value={BraketSymbolEnum.RigthBraket} />
                            </Stack>
                            <Stack direction="row" spacing={0}>
                                <DragOverlay
                                    dropAnimation={{
                                        //ドロップ後、元の位置に戻るアニメーションを隠す
                                        sideEffects: defaultDropAnimationSideEffects({
                                            styles: {
                                                active: {},
                                                dragOverlay: {
                                                    opacity: "0",
                                                }
                                            }
                                        }),
                                        //隠すアニメーションの待ち時間なし
                                        duration: 0
                                    }}
                                >
                                    <DraggableItem id={activeId} value={searchValue(activeId)} cursor="grabbing" />
                                </DragOverlay>
                                <DnclTextField key={`${keyPrefixEnum.LeftSide}_${index}_1`} name={keyPrefixEnum.LeftSide} inputType={inputTypeEnum.SwitchVariableOrArrayWithoutSuffix}></DnclTextField>
                                <Operator type={OperatorEnum.SimpleAssignment}></Operator>
                                <Box>
                                    {termComponents.map((component, index) => (
                                        <Stack direction="row" spacing={0} key={`${component.name}_${index}`}>
                                            <Droppable id={`${keyPrefixEnum.RigthSide}${keyPrefixEnum.LeftOfTerm}_${index}`} isDragging={isDragging}>{dropCount}</Droppable>
                                            {index > 0 && <Operator name={`${component.name}`} parentIndex={index} type={OperatorEnum.ArithmeticOperation}></Operator>}
                                            <DnclTextField name={`${component.name}`} index={index} inputType={inputTypeEnum.Switch} />
                                            {(index == termComponents.length - 1 && index != 0) && <IconButton aria-label="delete" onClick={() => removeTermComponent(index)}><BackspaceIcon /></IconButton>}
                                            <Droppable id={`${keyPrefixEnum.RigthSide}${keyPrefixEnum.RightOfTerm}_${index}`} isDragging={isDragging}>{dropCount}</Droppable>
                                        </Stack>
                                    )
                                    )
                                    }

                                    <Button variant="text" fullWidth size="small" startIcon={<AddIcon />}
                                        onClick={addTermComponent}>
                                        項を追加する
                                    </Button>
                                </Box>
                            </Stack >
                        </DndContext >
                    </Box >
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
            { title: processEnum.SetValueToVariable, type: processEnum.SetValueToVariable },
            { title: processEnum.InitializeArray, type: processEnum.InitializeArray },
            { title: processEnum.AssignValueToIndex, type: processEnum.AssignValueToIndex },
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
            { title: processEnum.SetValueToVariable, type: processEnum.SetValueToVariable },
        ]
    },
];

