import { defaultDropAnimationSideEffects, DndContext, DragOverlay } from "@dnd-kit/core";
import { FC, ReactNode, useState } from "react";
import { Box, Button, FormHelperText, IconButton, Stack } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { DraggableItem } from "./DraggableItem";
import { DnclTextField, DnclTextFieldProps } from "./DnclTextField";
import { Operator } from "./Operator";
import { Droppable } from "../Droppable";
import { bracketEnum, inputTypeEnum, keyPrefixEnum } from "./Enum";
import { BraketSymbolEnum, OperationEnum, StatementEnum } from "@/app/enum";
import AddIcon from '@mui/icons-material/Add';
import { useUpdateEffect } from './useUpdateEffect ';

type Props = {
    children?: ReactNode;
    statementType?: StatementEnum
};

function searchEnumValue<T>(enumObj: T, key: string | null): T[keyof T] | null {

    const getEnumKeys = <T extends object>(enumObj: T): (keyof T)[] => { return Object.keys(enumObj).filter(key => isNaN(Number(key))) as (keyof T)[]; };

    if (key == null) return null;
    function getEnumValueByKey(enumObj: T, key: string): any {
        return enumObj[key as keyof typeof enumObj];
    }
    const keys = getEnumKeys(enumObj as Object);
    return keys.includes(key as keyof Object) ? getEnumValueByKey(enumObj, key) : null;
};



export const Operation: FC<Props> = ({ children, statementType }) => {

    const [isDragging, setIsDragging] = useState(false);
    const [termComponents, setTermComponents] = useState<DnclTextFieldProps[]>([{ name: keyPrefixEnum.RigthSide }]);
    const [activeId, setActiveId] = useState<string>("");
    const [braketError, setBraketError] = useState<string>("");

    //初回レンダリング時に実行しない
    useUpdateEffect(() => {
        checkBraketPair();
    }, [termComponents]);

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
        //(左辺または右辺)_(項の左側または右側)_(インデックス)という文字列を想定
        const overIdSplitArray = id.split('_');
        if (overIdSplitArray[1] == keyPrefixEnum.LeftOfTerm) {
            setTermComponents((prevItems) =>
                prevItems.map((item: DnclTextFieldProps, i: number) =>
                    i === Number(overIdSplitArray[2]) ? { ...item, leftOfTermValue: ((item.leftOfTermValue ? item.leftOfTermValue : "").length > 0 ? item.leftOfTermValue?.slice(0, -1) : "") } : item
                ));
        } else {
            setTermComponents((prevItems) =>
                prevItems.map((item: DnclTextFieldProps, i: number) =>
                    i === Number(overIdSplitArray[2]) ? { ...item, rightOfTermValue: ((item.rightOfTermValue ? item.rightOfTermValue : "").length > 0 ? item.rightOfTermValue?.slice(0, -1) : "") } : item
                ));
        }
    }
    const addOneSideOfTerm = (id: string) => {
        //(左辺または右辺)_(項の左側または右側)_(インデックス)という文字列を想定
        const overIdSplitArray = id.split('_');
        if (overIdSplitArray[1] == keyPrefixEnum.LeftOfTerm) {
            setTermComponents((prevItems) =>
                prevItems.map((item: DnclTextFieldProps, i: number) =>
                    i === Number(overIdSplitArray[2]) ? { ...item, leftOfTermValue: (item.leftOfTermValue ?? "") + searchEnumValue(BraketSymbolEnum, activeId) } : item
                ));
        } else {
            setTermComponents((prevItems) =>
                prevItems.map((item: DnclTextFieldProps, i: number) =>
                    i === Number(overIdSplitArray[2]) ? { ...item, rightOfTermValue: (item.rightOfTermValue ?? "") + searchEnumValue(BraketSymbolEnum, activeId) } : item
                ));
        }
    }

    const draggleItems = (): ReactNode => {
        switch (statementType) {
            case StatementEnum.Input:
            case StatementEnum.Condition:
                return <>
                    <Stack direction="row" spacing={2}>
                        <DraggableItem id={bracketEnum.LeftBraket} value={BraketSymbolEnum.LeftBraket} />
                        <DraggableItem id={bracketEnum.RigthBraket} value={BraketSymbolEnum.RigthBraket} />
                        <FormHelperText sx={{ display: 'flex', alignItems: 'center' }} error >{braketError}</FormHelperText>
                    </Stack>
                </>;
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

                    addOneSideOfTerm(over.id.toString());

                }}
            >
                {draggleItems()}
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
                        <DraggableItem id={activeId} value={searchEnumValue(BraketSymbolEnum, activeId)} cursor="grabbing" />
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
            </DndContext >
        </Box >
    );
};
