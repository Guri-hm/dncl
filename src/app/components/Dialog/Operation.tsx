import { defaultDropAnimationSideEffects, DndContext, DragOverlay } from "@dnd-kit/core";
import { FC, ReactNode, useState } from "react";
import { Box, Button, Divider, FormHelperText, IconButton, Stack } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { Operator, Droppable, DroppableOperator, ErrorMsgBox, DraggableItem, DnclTextField, DnclTextFieldProps, EmphasiseBox } from '@/app/components/Dialog';
import { bracketEnum, inputTypeEnum, keyPrefixEnum } from "./Enum";
import { BraketSymbolEnum, OperationEnum, OperatorTypeJpEnum, ProcessEnum } from "@/app/enum";
import AddIcon from '@mui/icons-material/Add';
import { checkParenthesesBalance, enumsToObjects, getValueByKey } from "@/app/utilities";
import { TreeItems } from "@/app/types";
import { useCallback } from 'react';
import { useUpdateEffect } from "@/app/hooks";

type Props = {
    children?: ReactNode;
    processType: ProcessEnum;
    treeItems?: TreeItems
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

export const Operation: FC<Props> = ({ children, processType, treeItems = [] }) => {

    const [isDragging, setIsDragging] = useState(false);
    const [operandComponents, setOperandComponents] = useState<DnclTextFieldProps[]>([{ name: keyPrefixEnum.RigthSide }]);
    const [activeId, setActiveId] = useState<string>("");
    const [braketError, setBraketError] = useState<string[]>([]);

    const draggableStringList = enumsToObjects([BraketSymbolEnum, OperatorTypeJpEnum]);

    const checkBraketPair = useCallback(() => {

        const errorArray: string[] = [];

        let tmpCode: string[] = [];
        for (let i = 0; i < operandComponents.length; i++) {
            tmpCode = [...tmpCode, ...(operandComponents[i].leftOfOperandValue ?? [])];
            tmpCode = [...tmpCode, ...(operandComponents[i].rightOfOperandValue ?? [])];
        }

        const result: { isBalanced: boolean, isCorrectOrder: boolean, balance: number, hasEmptyParentheses: boolean } = (checkParenthesesBalance(tmpCode));

        if (!result.isBalanced) {
            if (result.balance > 0) {
                errorArray.push(`『 ${BraketSymbolEnum.RigthBraket} 』を追加してください`);
            } else {
                errorArray.push(`『 ${BraketSymbolEnum.LeftBraket} 』を追加してください`);
            }
        }
        if (!result.isCorrectOrder) {
            errorArray.push(`『 ${BraketSymbolEnum.RigthBraket} 』の前方には対になる『 ${BraketSymbolEnum.LeftBraket} 』が必要です`);
        }
        if (result.hasEmptyParentheses) {
            errorArray.push(`『 ${BraketSymbolEnum.LeftBraket} 』と『 ${BraketSymbolEnum.RigthBraket} 』の内側には要素が必要です`);
        }
        setBraketError(errorArray);
    }, [operandComponents]);

    //初回レンダリング時に実行しない
    useUpdateEffect(() => {
        checkBraketPair();
    }, [operandComponents]);

    const addOperandComponent = () => {
        setOperandComponents([...operandComponents, { name: keyPrefixEnum.RigthSide }]);
    };
    const removeOperandComponent = (index: number) => {
        setOperandComponents(operandComponents.filter((_, i) => i !== index));
    };

    const removeOneSideOfOperand = (id: string) => {

        const popElment = (array: string[] | undefined): string[] => {
            if (!array) return [];
            array.pop();
            return array;
        }

        //(左辺または右辺)_(オペランドのインデックス)_(オペランドの左側または右側)という文字列を想定
        const overIdSplitArray = id.split('_');
        const item: DnclTextFieldProps | undefined = operandComponents.find((item: DnclTextFieldProps, i: number) =>
            i === Number(overIdSplitArray[1]
            ));
        if (!item) return;

        let newArray: string[] = [];
        let propertyName = '';
        if (overIdSplitArray[2] == keyPrefixEnum.LeftOfOperand) {
            newArray = popElment(item.leftOfOperandValue);
            propertyName = 'leftOfOperandValue';
        } else {
            newArray = popElment(item.rightOfOperandValue)
            propertyName = 'rightOfOperandValue';
        }
        //プロパティに変数を使うときは[]をつける
        setOperandComponents((prevItems) =>
            prevItems.map((item: DnclTextFieldProps, i: number) =>
                i === Number(overIdSplitArray[1]) ? { ...item, [propertyName]: newArray } : item
            ));
    }

    const setOperator = (id: string) => {
        const overIdSplitArray = id.split('_');
        const propertyName = 'operator'; // constを使用
        setOperandComponents((prevItems) =>
            prevItems.map((item, i) =>
                i === Number(overIdSplitArray[1])
                    ? { ...item, [propertyName]: activeId } as DnclTextFieldProps
                    : item
            )
        );
    };

    const removeOperator = (index: number) => {
        const propertyName = 'operator'; // constを使用
        setOperandComponents((prevItems) =>
            prevItems.map((item, i) =>
                i === Number(index)
                    ? { ...item, [propertyName]: null as unknown as OperationEnum } // 型アサーションを使用して null を変換
                    : item
            )
        );
    };

    const addOneSideOfOperand = (id: string) => {

        //(左辺または右辺)_(オペランドのインデックス)_(オペランドの左側または右側)という文字列を想定
        const overIdSplitArray = id.split('_');
        const item: DnclTextFieldProps | undefined = operandComponents.find((item: DnclTextFieldProps, i: number) =>
            i === Number(overIdSplitArray[1]
            ));
        if (!item) return;
        let newArray: string[] = [];
        let propertyName = '';
        const draggingString = getValueByKey(draggableStringList, activeId);

        if (overIdSplitArray[2] == keyPrefixEnum.LeftOfOperand) {
            newArray = (item.leftOfOperandValue ?? []).concat(draggingString);
            propertyName = 'leftOfOperandValue';
        } else {
            newArray = (item.rightOfOperandValue ?? []).concat(draggingString);
            propertyName = 'rightOfOperandValue';
        }
        //プロパティに変数を使うときは[]をつける
        setOperandComponents((prevItems) =>
            prevItems.map((item: DnclTextFieldProps, i: number) =>
                i === Number(overIdSplitArray[1]) ? { ...item, [propertyName]: newArray } : item
            ));
    }

    const draggleItems = (process: ProcessEnum | undefined): ReactNode => {
        const brakets: ReactNode = <>
            <ErrorMsgBox sx={{ display: 'flex', flexDirection: 'column' }} errorArray={braketError}></ErrorMsgBox>
            {operandComponents.map((component, index) => (
                !component.operator && index > 0 ?
                    <ErrorMsgBox key={index} sx={{ display: 'flex', flexDirection: 'column' }} errorArray={[`${index}番目と${index + 1}番目のオペランドの間に演算子が必要です`]}></ErrorMsgBox>
                    : null
            ))}
            <Stack direction="row" spacing={2}>
                <DraggableItem id={bracketEnum.LeftBraket} value={BraketSymbolEnum.LeftBraket} />
                <DraggableItem id={bracketEnum.RigthBraket} value={BraketSymbolEnum.RigthBraket} />
            </Stack>
        </>
        switch (process) {
            case ProcessEnum.SetValToVariableOrArray:
                return <DraggableOperatorsBox>
                    {brakets}
                    <Stack direction="row" spacing={2} sx={{ marginTop: 1 }}>
                        <DraggableItem id={OperationEnum.Arithmetic} value={OperatorTypeJpEnum.Arithmetic} />
                    </Stack>
                </DraggableOperatorsBox>

            case ProcessEnum.If:
            case ProcessEnum.ElseIf:
                return <DraggableOperatorsBox>
                    {brakets}
                    <Stack direction="row" spacing={2} sx={{ marginTop: 1 }}>
                        <DraggableItem id={OperationEnum.Arithmetic} value={OperatorTypeJpEnum.Arithmetic} />
                        <DraggableItem id={OperationEnum.Comparison} value={OperatorTypeJpEnum.Comparison} />
                        <DraggableItem id={OperationEnum.Logical} value={OperatorTypeJpEnum.Logical} />
                    </Stack>
                </DraggableOperatorsBox>
            case ProcessEnum.While:
            case ProcessEnum.EndDoWhile:
                return <DraggableOperatorsBox>
                    <Stack direction="row" spacing={2} sx={{ marginTop: 1 }}>
                        <DraggableItem id={OperationEnum.Comparison} value={OperatorTypeJpEnum.Comparison} />
                    </Stack>
                </DraggableOperatorsBox>
            default:
                return null;
        }
    }

    const isActiveIdOperator = (activeId: string): boolean => {
        return [OperationEnum.Arithmetic, OperationEnum.Comparison, OperationEnum.Logical].some(elm => elm == activeId);
    }
    const isNotActiveIdOperator = (activeId: string): boolean => {
        return [OperationEnum.Arithmetic, OperationEnum.Comparison, OperationEnum.Logical].every(elm => elm !== activeId);
    }
    const getSwitchType = (processType: ProcessEnum | undefined): inputTypeEnum => {
        switch (processType) {
            case ProcessEnum.Output:
                return inputTypeEnum.All;
            case ProcessEnum.SetValToVariableOrArray:
            case ProcessEnum.If:
            case ProcessEnum.ElseIf:
            case ProcessEnum.While:
            case ProcessEnum.EndDoWhile:
            case ProcessEnum.InitializeArray:
                return inputTypeEnum.All;
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
                    if (over.id.toString().includes(keyPrefixEnum.Operator)) {
                        if (isNotActiveIdOperator(activeId)) return;
                        setOperator(over.id.toString())
                    } else {
                        if (isActiveIdOperator(activeId)) return;
                        addOneSideOfOperand(over.id.toString());
                    }

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
                        <DraggableItem id={activeId} value={getValueByKey(draggableStringList, activeId)} cursor="grabbing" />
                    </DragOverlay>
                    {children}
                    <Box>
                        {operandComponents.map((component, index) => (
                            <Stack direction="row" spacing={0} key={`${component.name}_${index}`}>
                                {(index == 0) && (processType == ProcessEnum.InitializeArray) ? <EmphasiseBox>{BraketSymbolEnum.OpenSquareBracket}</EmphasiseBox> : ''}
                                {(index != 0) && <DroppableOperator id={`${component.name}_${index}_${keyPrefixEnum.Operator}`} name={`${component.name}`} parentIndex={index} isDragging={isDragging && isActiveIdOperator(activeId)} endOfArrayEvent={() => removeOperator(index)} type={component.operator}></DroppableOperator>}
                                {
                                    //表示文
                                    (processType == ProcessEnum.Output && index > 0) &&
                                    <Operator name={`${component.name}`} parentIndex={index} type={OperationEnum.JoinString}></Operator>
                                }
                                {
                                    (processType == ProcessEnum.InitializeArray && index > 0) &&
                                    <Operator name={`${component.name}`} parentIndex={index} type={OperationEnum.Comma}></Operator>
                                }
                                <Droppable id={`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.LeftOfOperand}`} isDragging={isDragging && isNotActiveIdOperator(activeId)} onClick={() => removeOneSideOfOperand(`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.LeftOfOperand}`)} stringArray={component.leftOfOperandValue}>{component.leftOfOperandValue?.join('')}</Droppable>

                                <DnclTextField name={`${component.name}`} index={index} inputType={getSwitchType(processType)} treeItems={treeItems} />
                                <Droppable id={`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.RightOfOperand}`} isDragging={isDragging && isNotActiveIdOperator(activeId)} onClick={() => removeOneSideOfOperand(`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.RightOfOperand}`)} stringArray={component.rightOfOperandValue}>{component.rightOfOperandValue?.join('')}</Droppable>

                                {([ProcessEnum.If, ProcessEnum.ElseIf].includes(processType) && index != 0) && <Operator name={`${component.name}`} parentIndex={index} type={OperationEnum.Negation}></Operator>}

                                {(operandComponents.length - 1 == index) && (processType == ProcessEnum.InitializeArray) ? <EmphasiseBox>{BraketSymbolEnum.CloseSquareBracket}</EmphasiseBox> : ''}
                                {(index == operandComponents.length - 1 && index != 0) && <IconButton aria-label="delete" onClick={() => removeOperandComponent(index)}><BackspaceIcon /></IconButton>}
                            </Stack>
                        ))}

                        <Button variant="text" fullWidth size="small" startIcon={<AddIcon />}
                            onClick={addOperandComponent}>
                            {processType == ProcessEnum.InitializeArray ? '引数を追加する' : 'オペランドを追加する'}
                        </Button>
                    </Box>
                </Stack >
                {draggleItems(processType)}
            </DndContext >
        </Box >
    );
};
