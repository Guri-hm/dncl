import { defaultDropAnimationSideEffects, DndContext, DragOverlay, rectIntersection } from "@dnd-kit/core";
import { FC, ReactNode, useEffect, useState } from "react";
import { Box, Button, Divider, FormHelperText, IconButton, Stack } from '@mui/material';
import BackspaceIcon from '@mui/icons-material/Backspace';
import { Operator, Droppable, DroppableOperator, ErrorMsgBox, DraggableItem, DnclTextField, EmphasiseBox } from '@/app/components/Dialog';
import { bracketEnum, inputTypeEnum, keyPrefixEnum } from "./Enum";
import { BraketSymbolEnum, OperationEnum, OperatorTypeJpEnum, ProcessEnum } from "@/app/enum";
import AddIcon from '@mui/icons-material/Add';
import { checkParenthesesBalance, enumsToObjects, getOperatorTypeAndIndex, getValueByKey } from "@/app/utilities";
import { TreeItems } from "@/app/types";
import { useCallback } from 'react';
import { useUpdateEffect } from "@/app/hooks";

type Props = {
    children?: ReactNode;
    processType: ProcessEnum;
    treeItems?: TreeItems;
    rightRestoreMap?: { [index: number]: { [key: string]: string } } | undefined;
};

type OperandComponent = {
    name: string;
    operator?: OperationEnum;
    operatorIndex?: number;
    leftOfOperandValue?: string;
    rightOfOperandValue?: string;
    initialRestoreValues?: { [key: string]: string };
};

type DraggableOperatorsProps = {
    children?: ReactNode;
};

const OperandProp = {
    OPERATOR: 'operator' as const,
    OPERATOR_INDEX: 'operatorIndex' as const,
    LEFT: 'leftOfOperandValue' as const,
    RIGHT: 'rightOfOperandValue' as const,
};
type OperandPropKey = typeof OperandProp[keyof typeof OperandProp];

const Keys = {
    OPERATOR_KEY: 'operator',
} as const;

const DraggableOperatorsBox: FC<DraggableOperatorsProps> = ({ children }) => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
            <Divider orientation="horizontal" />
            <FormHelperText sx={{ display: 'flex', alignItems: 'center' }}>ドラッグ&ドロップしてください</FormHelperText>
            {children}
        </Box>
    );
};

export const Operation: FC<Props> = ({ children, processType, treeItems = [], rightRestoreMap }) => {

    const [isDragging, setIsDragging] = useState(false);
    const [operandComponents, setOperandComponents] = useState<OperandComponent[]>([{ name: keyPrefixEnum.RigthSide }]);
    const [activeId, setActiveId] = useState<string>("");
    const [braketError, setBraketError] = useState<string[]>([]);

    const draggableStringList = enumsToObjects([BraketSymbolEnum, OperatorTypeJpEnum]);

    const allowedForProcess = (ptype: ProcessEnum): OperationEnum[] => {
        switch (ptype) {
            case ProcessEnum.SetValToVariableOrArray:
                return [OperationEnum.Arithmetic];
            case ProcessEnum.Output:
                return [OperationEnum.JoinString];
            case ProcessEnum.If:
            case ProcessEnum.ElseIf:
                return [OperationEnum.Arithmetic, OperationEnum.Comparison, OperationEnum.Logical, OperationEnum.Negation];
            case ProcessEnum.While:
            case ProcessEnum.EndDoWhile:
                return [OperationEnum.Comparison];
            case ProcessEnum.InitializeArray:
                return [];
            default:
                return [OperationEnum.Arithmetic, OperationEnum.Comparison, OperationEnum.Logical];
        }
    };

    useEffect(() => {
        if (!rightRestoreMap) {
            setOperandComponents([{ name: keyPrefixEnum.RigthSide }]);
            return;
        }
        const indices = Object.keys(rightRestoreMap).map(Number).sort((a, b) => a - b);
        if (indices.length === 0) {
            setOperandComponents([{ name: keyPrefixEnum.RigthSide }]);
            return;
        }

        const allowedOps = allowedForProcess(processType);

        const newOperands = indices.map(i => {
            const block = rightRestoreMap[i] ?? {};
            const prefix = `${keyPrefixEnum.RigthSide}_${i}`;

            const operatorStr = block[`${prefix}_${keyPrefixEnum.Operator}`] ?? Object.entries(block).find(([k]) => k.endsWith(`_${keyPrefixEnum.Operator}`))?.[1];
            const left = block[`${prefix}_${keyPrefixEnum.LeftOfOperand}`] ?? Object.entries(block).find(([k]) => k.endsWith(`_${keyPrefixEnum.LeftOfOperand}`))?.[1] ?? '';
            const right = block[`${prefix}_${keyPrefixEnum.RightOfOperand}`] ?? Object.entries(block).find(([k]) => k.endsWith(`_${keyPrefixEnum.RightOfOperand}`))?.[1] ?? '';

            // operator を検証し、許可されない場合は破棄する
            let operatorType: OperationEnum | undefined = undefined;
            let operatorIndex: number | undefined = undefined;
            if (operatorStr) {
                const info = getOperatorTypeAndIndex(operatorStr);
                if (info && allowedOps.includes(info.type)) {
                    operatorType = info.type;
                    operatorIndex = info.index ?? undefined;
                } else {
                    operatorType = undefined;
                    operatorIndex = undefined;
                }
            }

            // initialRestoreValues は許可されない operator キーを削って渡す（ここでサニタイズ）
            const sanitizedBlock = Object.fromEntries(
                Object.entries(block).filter(([k]) => !k.endsWith(`_${keyPrefixEnum.Operator}`))
            );
            const initialVals = Object.keys(sanitizedBlock).length ? sanitizedBlock : undefined;

            return {
                name: keyPrefixEnum.RigthSide,
                operator: operatorType,
                operatorIndex: operatorIndex,
                leftOfOperandValue: left,
                rightOfOperandValue: right,
                initialRestoreValues: initialVals
            } as OperandComponent;
        });
        setOperandComponents(newOperands);
    }, [rightRestoreMap, processType]);

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
        const removeLastChar = (str: string): string => {
            return str.slice(0, -1);
        }
        //(左辺または右辺)_(オペランドのインデックス)_(オペランドの左側または右側)という文字列を想定
        const overIdSplitArray = id.split('_');
        const item: OperandComponent | undefined = operandComponents.find((item: OperandComponent, i: number) =>
            i === Number(overIdSplitArray[1]
            ));
        if (!item) return;

        let newValue = '';
        let propertyName: typeof OperandProp.LEFT | typeof OperandProp.RIGHT = OperandProp.LEFT;
        if (overIdSplitArray[2] == keyPrefixEnum.LeftOfOperand) {
            const current = (item[OperandProp.LEFT as keyof OperandComponent] ?? '') as string;
            const removed = removeLastChar(current);
            newValue = removed;
            propertyName = OperandProp.LEFT;
        } else {
            const current = (item[OperandProp.RIGHT as keyof OperandComponent] ?? '') as string;
            const removed = removeLastChar(current);
            newValue = removed;
            propertyName = OperandProp.RIGHT;
        }
        setOperandComponents((prevItems) =>
            prevItems.map((item: OperandComponent, i: number) =>
                i === Number(overIdSplitArray[1]) ? { ...item, [propertyName]: newValue } : item
            )
        );
    }

    const setOperator = (id: string) => {
        const overIdSplitArray = id.split('_');
        setOperandComponents((prevItems) =>
            prevItems.map((item, i) =>
                i === Number(overIdSplitArray[1])
                    ? { ...item, [OperandProp.OPERATOR]: activeId } as OperandComponent
                    : item
            )
        );
    };

    const removeOperator = (index: number) => {
        setOperandComponents((prevItems) =>
            prevItems.map((item, i) =>
                i === Number(index)
                    ? { ...item, [OperandProp.OPERATOR]: null as unknown as OperationEnum } // 型アサーションを使用して null を変換
                    : item
            )
        );
    };

    const addOneSideOfOperand = (id: string) => {

        //(左辺または右辺)_(オペランドのインデックス)_(オペランドの左側または右側)という文字列を想定
        const overIdSplitArray = id.split('_');
        const item: OperandComponent | undefined = operandComponents.find((item: OperandComponent, i: number) =>
            i === Number(overIdSplitArray[1]
            ));
        if (!item) return;
        const draggingString = getValueByKey(draggableStringList, activeId);
        let propertyName: typeof OperandProp.LEFT | typeof OperandProp.RIGHT = OperandProp.LEFT;
        let newValue = '';

        if (overIdSplitArray[2] === keyPrefixEnum.LeftOfOperand) {
            const current = (item[OperandProp.LEFT as keyof OperandComponent] ?? '') as string;
            newValue = current + draggingString;
            propertyName = OperandProp.LEFT;
        } else {
            const current = (item[OperandProp.RIGHT as keyof OperandComponent] ?? '') as string;
            newValue = current + draggingString;
            propertyName = OperandProp.RIGHT;
        }

        //プロパティに変数を使うときは[]をつける
        setOperandComponents((prevItems) =>
            prevItems.map((item: OperandComponent, i: number) =>
                i === Number(overIdSplitArray[1]) ? { ...item, [propertyName]: newValue } : item
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
                        <DraggableItem id={OperationEnum.Comparison} value={OperatorTypeJpEnum.Comparison} />
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
                collisionDetection={rectIntersection}
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
                                {(() => {
                                    // processType による表示差分を switch でまとめる
                                    const leftBracket = (index === 0 && processType === ProcessEnum.InitializeArray)
                                        ? <EmphasiseBox>{BraketSymbolEnum.OpenSquareBracket}</EmphasiseBox>
                                        : null;

                                    // デフォルトは DroppableOperator を表示（index != 0）
                                    let operatorDrop = (index !== 0) ? (
                                        <DroppableOperator
                                            id={`${component.name}_${index}_${keyPrefixEnum.Operator}`}
                                            name={`${component.name}`}
                                            parentIndex={index}
                                            operatorDefaultIndex={component.operatorIndex}
                                            isDragging={isDragging && isActiveIdOperator(activeId)}
                                            endOfArrayEvent={() => removeOperator(index)}
                                            type={component.operator}
                                        />
                                    ) : null;

                                    // processType 固有の中間表示（JoinString / Comma / Negation 等）
                                    let middleOp: React.ReactNode = null;
                                    if (processType === ProcessEnum.Output && index > 0) {
                                        middleOp = <Operator name={`${component.name}`} parentIndex={index} type={OperationEnum.JoinString} />;
                                    } else if (processType === ProcessEnum.InitializeArray && index > 0) {
                                        // InitializeArray のときは演算子ドロップを無効にしてカンマを出す
                                        operatorDrop = null;
                                        middleOp = <Operator name={`${component.name}`} parentIndex={index} type={OperationEnum.Comma} />;
                                    } else if ([ProcessEnum.If, ProcessEnum.ElseIf].includes(processType) && index !== 0) {
                                        // 否定演算子は右側に表示（既存ロジックと同じ場所で出す）
                                        // Negation は後ろで条件付きで出す（下の別行で出しているならここは不要）
                                    }

                                    const leftDroppable = (processType !== ProcessEnum.InitializeArray) ? (
                                        <Droppable
                                            id={`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.LeftOfOperand}`}
                                            isDragging={isDragging && isNotActiveIdOperator(activeId)}
                                            onClick={() => removeOneSideOfOperand(`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.LeftOfOperand}`)}
                                            stringValue={component.leftOfOperandValue}
                                        >
                                            {component.leftOfOperandValue ?? ''}
                                        </Droppable>
                                    ) : null;

                                    const rightDroppable = (processType !== ProcessEnum.InitializeArray) ? (
                                        <Droppable
                                            id={`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.RightOfOperand}`}
                                            isDragging={isDragging && isNotActiveIdOperator(activeId)}
                                            onClick={() => removeOneSideOfOperand(`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.RightOfOperand}`)}
                                            stringValue={component.rightOfOperandValue}
                                        >
                                            {component.rightOfOperandValue ?? ''}
                                        </Droppable>
                                    ) : null;

                                    const closeBracket = ((operandComponents.length - 1 === index) && (processType === ProcessEnum.InitializeArray))
                                        ? <EmphasiseBox>{BraketSymbolEnum.CloseSquareBracket}</EmphasiseBox>
                                        : null;

                                    const deleteButton = (index === operandComponents.length - 1 && index !== 0)
                                        ? <IconButton aria-label="delete" onClick={() => removeOperandComponent(index)}><BackspaceIcon /></IconButton>
                                        : null;

                                    const negationOp = ([ProcessEnum.If, ProcessEnum.ElseIf].includes(processType) && index !== 0)
                                        ? <Operator name={`${component.name}`} parentIndex={index} type={OperationEnum.Negation}></Operator>
                                        : null;

                                    return (
                                        <>
                                            {leftBracket}
                                            {operatorDrop}
                                            {middleOp}
                                            {leftDroppable}
                                            <DnclTextField name={`${component.name}`} index={index} inputType={getSwitchType(processType)} treeItems={treeItems} initialRestoreValues={component.initialRestoreValues} />
                                            {rightDroppable}
                                            {negationOp}
                                            {closeBracket}
                                            {deleteButton}
                                        </>
                                    );
                                })()}
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
