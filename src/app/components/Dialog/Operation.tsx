import { defaultDropAnimationSideEffects, DndContext, DragOverlay } from "@dnd-kit/core";
import { FC, ReactNode, useState } from "react";
import { Box, Button, Divider, FormHelperText, IconButton, Stack } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { DraggableItem } from "./DraggableItem";
import { DnclTextField, DnclTextFieldProps } from "./DnclTextField";
import { Operator } from "./Operator";
import { Droppable } from "../Droppable";
import { bracketEnum, inputTypeEnum, keyPrefixEnum } from "./Enum";
import { BraketSymbolEnum, OperationEnum, OperatorTypeJpEnum, StatementEnum } from "@/app/enum";
import AddIcon from '@mui/icons-material/Add';
import { useUpdateEffect } from './useUpdateEffect ';
import { checkParenthesesBalance, enumsToObjects, getValueByKey } from "@/app/utilities";
import { DroppableOperator } from "../DroppableOperator";
import { ErrorMsgBox } from "./ErrorMsgBox";

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
    const [operandComponents, setOperandComponents] = useState<DnclTextFieldProps[]>([{ name: keyPrefixEnum.RigthSide }]);
    const [activeId, setActiveId] = useState<string>("");
    const [braketError, setBraketError] = useState<string[]>([]);

    //初回レンダリング時に実行しない
    useUpdateEffect(() => {
        checkBraketPair();
    }, [operandComponents]);

    const draggableStringList = enumsToObjects([BraketSymbolEnum, OperatorTypeJpEnum]);

    const checkOperator = (index: number) => {
        setBraketError([...braketError, 'ドリアン'])
    }

    const checkBraketPair = () => {

        console.log(operandComponents)
        let errorArray: string[] = [];

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
    }

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
        //(左辺または右辺)_(オペランドのインデックス)_(オペランドの左側または右側)という文字列を想定
        const overIdSplitArray = id.split('_');
        let propertyName = 'operator';
        //プロパティに変数を使うときは[]をつける
        setOperandComponents((prevItems) =>
            prevItems.map((item: DnclTextFieldProps, i: number) =>
                i === Number(overIdSplitArray[1]) ? { ...item, [propertyName]: activeId } : item
            ));
    }
    const removeOperator = (index: number) => {
        let propertyName = 'operator';
        //プロパティに変数を使うときは[]をつける
        setOperandComponents((prevItems) =>
            prevItems.map((item: DnclTextFieldProps, i: number) =>
                i === Number(index) ? { ...item, [propertyName]: null } : item
            ));
    }

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

    const draggleItems = (statementType: StatementEnum | undefined): ReactNode => {
        const brakets: ReactNode = <>
            <ErrorMsgBox sx={{ display: 'flex', flexDirection: 'column' }} errorArray={braketError}></ErrorMsgBox>
            {operandComponents.map((component, index) => (
                !component.operator && index > 0 ?
                    <ErrorMsgBox sx={{ display: 'flex', flexDirection: 'column' }} errorArray={[`${index}番目と${index + 1}番目のオペランドの間に演算子が必要です`]}></ErrorMsgBox>
                    : null
            ))}
            <Stack direction="row" spacing={2}>
                <DraggableItem id={bracketEnum.LeftBraket} value={BraketSymbolEnum.LeftBraket} />
                <DraggableItem id={bracketEnum.RigthBraket} value={BraketSymbolEnum.RigthBraket} />
            </Stack>
        </>
        switch (statementType) {
            case StatementEnum.Input:
                return <DraggableOperatorsBox>
                    {brakets}
                    <Stack direction="row" spacing={2} sx={{ marginTop: 1 }}>
                        <DraggableItem id={OperationEnum.Arithmetic} value={OperatorTypeJpEnum.Arithmetic} />
                    </Stack>
                </DraggableOperatorsBox>

            case StatementEnum.Condition:
                return <DraggableOperatorsBox>
                    {brakets}
                    <Stack direction="row" spacing={2} sx={{ marginTop: 1 }}>
                        <DraggableItem id={OperationEnum.Arithmetic} value={OperatorTypeJpEnum.Arithmetic} />
                        <DraggableItem id={OperationEnum.Comparison} value={OperatorTypeJpEnum.Comparison} />
                        <DraggableItem id={OperationEnum.Logical} value={OperatorTypeJpEnum.Logical} />
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
                                {(index != 0) && <DroppableOperator id={`${component.name}_${index}_${keyPrefixEnum.Operator}`} name={`${component.name}`} parentIndex={index} isDragging={isDragging && isActiveIdOperator(activeId)} endOfArrayEvent={() => removeOperator(index)} type={component.operator}></DroppableOperator>}
                                {
                                    (statementType == StatementEnum.Output && index > 0) &&
                                    <Operator name={`${component.name}`} parentIndex={index} type={OperationEnum.JoinString}></Operator>
                                }
                                <Droppable id={`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.LeftOfOperand}`} isDragging={isDragging && isNotActiveIdOperator(activeId)} onClick={() => removeOneSideOfOperand(`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.LeftOfOperand}`)} stringArray={component.leftOfOperandValue}>{component.leftOfOperandValue?.join('')}</Droppable>

                                <DnclTextField name={`${component.name}`} index={index} inputType={getSwitchType(statementType)} />
                                <Droppable id={`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.RightOfOperand}`} isDragging={isDragging && isNotActiveIdOperator(activeId)} onClick={() => removeOneSideOfOperand(`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.RightOfOperand}`)} stringArray={component.rightOfOperandValue}>{component.rightOfOperandValue?.join('')}</Droppable>

                                {(statementType == StatementEnum.Condition && index != 0) && <Operator name={`${component.name}`} parentIndex={index} type={OperationEnum.Negation}></Operator>}

                                {(index == operandComponents.length - 1 && index != 0) && <IconButton aria-label="delete" onClick={() => removeOperandComponent(index)}><BackspaceIcon /></IconButton>}
                            </Stack>
                        ))}

                        <Button variant="text" fullWidth size="small" startIcon={<AddIcon />}
                            onClick={addOperandComponent}>
                            オペランドを追加する
                        </Button>
                    </Box>
                </Stack >
                {draggleItems(statementType)}
            </DndContext >
        </Box >
    );
};
