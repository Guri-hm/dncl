import { defaultDropAnimationSideEffects, DndContext, DragOverlay } from "@dnd-kit/core";
import { FC, ReactNode, useState } from "react";
import { Box, Button, Divider, FormHelperText, IconButton, Stack } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { DraggableItem } from "./DraggableItem";
import { DnclTextField, DnclTextFieldProps } from "./DnclTextField";
import { Operator } from "./Operator";
import { Droppable } from "../Droppable";
import { bracketEnum, inputTypeEnum, keyPrefixEnum, LogicalOperationEnum } from "./Enum";
import { BraketSymbolEnum, LogicalOperationJpEnum, OperationEnum, StatementEnum } from "@/app/enum";
import AddIcon from '@mui/icons-material/Add';
import { useUpdateEffect } from './useUpdateEffect ';
import { enumsToObjects, getValueByKey } from "@/app/utilities";

type Props = {
    children?: ReactNode;
    statementType?: StatementEnum
};

type DraggableOperatorsProps = {
    children?: ReactNode;
};
const DraggableOperatorsBox: FC<DraggableOperatorsProps> = ({ children }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <Divider orientation="horizontal" />
            <FormHelperText sx={{ display: 'flex', alignItems: 'center' }}>ドラッグ&ドロップしてください</FormHelperText>
            {children}
        </Box>
    );
};

export const Operation: FC<Props> = ({ children, statementType }) => {

    const [isDragging, setIsDragging] = useState(false);
    const [termComponents, setTermComponents] = useState<DnclTextFieldProps[]>([{ name: keyPrefixEnum.RigthSide }]);
    const [activeId, setActiveId] = useState<string>("");
    const [braketError, setBraketError] = useState<string>("");

    //初回レンダリング時に実行しない
    useUpdateEffect(() => {
        // checkBraketPair();
    }, [termComponents]);

    const charList = enumsToObjects([BraketSymbolEnum, LogicalOperationJpEnum]);

    const checkBraketPair = () => {
        const leftOfTermValues: (string | undefined)[] = termComponents.map(item => item.leftOfTermValue);
        const rightOfTermValues: (string | undefined)[] = termComponents.map(item => item.rightOfTermValue);
        const values: string = leftOfTermValues.join('') + rightOfTermValues.join('');

        const leftBraketCount = values.split(BraketSymbolEnum.LeftBraket).length - 1;
        const rightBraketCount = values.split(BraketSymbolEnum.RigthBraket).length - 1;
        if (leftBraketCount == rightBraketCount) {
            setBraketError("");
            return;
        }

        if (leftBraketCount > rightBraketCount) {
            setBraketError(`『 ${BraketSymbolEnum.RigthBraket} 』を追加してください`);
        } else {
            setBraketError(`『 ${BraketSymbolEnum.LeftBraket} 』を追加してください`);
        }
    }

    const addTermComponent = () => {
        setTermComponents([...termComponents, { name: keyPrefixEnum.RigthSide }]);
    };
    const removeTermComponent = (index: number) => {
        setTermComponents(termComponents.filter((_, i) => i !== index));
    };

    const removeOneSideOfTerm = (id: string) => {

        const popElment = (array: string[]): string[] => {
            array.pop();
            console.log(array)
            return array;
        }

        //(左辺または右辺)_(項の左側または右側)_(インデックス)という文字列を想定
        const overIdSplitArray = id.split('_');
        if (overIdSplitArray[1] == keyPrefixEnum.LeftOfTerm) {
            setTermComponents((prevItems) =>
                prevItems.map((item: DnclTextFieldProps, i: number) =>
                    i === Number(overIdSplitArray[2]) ? { ...item, leftOfTermValue: popElment(item.leftOfTermValue ?? []) } : item
                ));
        } else {
            setTermComponents((prevItems) =>
                prevItems.map((item: DnclTextFieldProps, i: number) =>
                    i === Number(overIdSplitArray[2]) ? { ...item, rightOfTermValue: popElment(item.rightOfTermValue ?? []) } : item
                ));
        }
    }
    const addOneSideOfTerm = (id: string) => {
        //(左辺または右辺)_(項の左側または右側)_(インデックス)という文字列を想定
        const overIdSplitArray = id.split('_');
        if (overIdSplitArray[1] == keyPrefixEnum.LeftOfTerm) {
            setTermComponents((prevItems) =>
                prevItems.map((item: DnclTextFieldProps, i: number) =>
                    i === Number(overIdSplitArray[2]) ? { ...item, leftOfTermValue: (item.leftOfTermValue ?? []).concat(getValueByKey(charList, activeId)) } : item
                ));
        } else {
            setTermComponents((prevItems) =>
                prevItems.map((item: DnclTextFieldProps, i: number) =>
                    i === Number(overIdSplitArray[2]) ? { ...item, rightOfTermValue: (item.rightOfTermValue ?? []).concat(getValueByKey(charList, activeId)) } : item
                ));
        }
    }

    const draggleItems = (statementType: StatementEnum | undefined): ReactNode => {
        const brakets: ReactNode = <>
            <FormHelperText sx={{ display: 'flex', alignItems: 'center' }} error >{braketError}</FormHelperText>
            <Stack direction="row" spacing={2}>
                <DraggableItem id={bracketEnum.LeftBraket} value={BraketSymbolEnum.LeftBraket} />
                <DraggableItem id={bracketEnum.RigthBraket} value={BraketSymbolEnum.RigthBraket} />
            </Stack>
        </>
        switch (statementType) {
            case StatementEnum.Input:
                return <DraggableOperatorsBox>
                    {brakets}
                </DraggableOperatorsBox>
                    ;
            case StatementEnum.Condition:
                return <DraggableOperatorsBox>
                    {brakets}
                    <Stack direction="row" spacing={1}>
                        <DraggableItem id={LogicalOperationEnum.And} value={LogicalOperationJpEnum.And} />
                        <DraggableItem id={LogicalOperationEnum.Or} value={LogicalOperationJpEnum.Or} />
                        <DraggableItem id={LogicalOperationEnum.Not} value={LogicalOperationJpEnum.Not} />
                    </Stack>
                </DraggableOperatorsBox>
                    ;
            default:
                return null;
        }
    }

    const getOperationType = (type: StatementEnum | undefined): OperationEnum => {
        switch (type) {
            case StatementEnum.Output:
                return OperationEnum.JoinString;
            default:
                return OperationEnum.Operation;
        }
    }
    const getSwitchType = (type: StatementEnum | undefined): inputTypeEnum => {
        switch (type) {
            case StatementEnum.Output:
                return inputTypeEnum.Radio;
            default:
                return inputTypeEnum.SwitchVariableOrNumberOrArray;
        }
    }

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column' }}>
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

                    addOneSideOfTerm(over.id.toString());

                }}
            >
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
                        <DraggableItem id={activeId} value={getValueByKey(charList, activeId)} cursor="grabbing" />
                    </DragOverlay>
                    {children}
                    <Box>
                        {termComponents.map((component, index) => (
                            <Stack direction="row" spacing={0} key={`${component.name}_${index}`}>
                                <Droppable id={`${keyPrefixEnum.RigthSide}_${keyPrefixEnum.LeftOfTerm}_${index}`} isDragging={isDragging} onClick={() => removeOneSideOfTerm(`${keyPrefixEnum.RigthSide}_${keyPrefixEnum.LeftOfTerm}_${index}`)}>{component.leftOfTermValue}</Droppable>
                                {index > 0 && <Operator name={`${component.name}`} parentIndex={index} type={getOperationType(statementType)}></Operator>}
                                <DnclTextField name={`${component.name}`} index={index} inputType={getSwitchType(statementType)} />
                                <Droppable id={`${keyPrefixEnum.RigthSide}_${keyPrefixEnum.RightOfTerm}_${index}`} isDragging={isDragging} onClick={() => removeOneSideOfTerm(`${keyPrefixEnum.RigthSide}_${keyPrefixEnum.RightOfTerm}_${index}`)}>{component.rightOfTermValue}</Droppable>
                                {(index == termComponents.length - 1 && index != 0) && <IconButton aria-label="delete" onClick={() => removeTermComponent(index)}><BackspaceIcon /></IconButton>}
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
                {draggleItems(statementType)}
            </DndContext >
        </Box >
    );
};
