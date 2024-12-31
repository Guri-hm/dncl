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
import { checkParenthesesBalance, enumsToObjects, getValueByKey } from "@/app/utilities";

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
    const [braketError, setBraketError] = useState<string[]>([]);
    const [logicalOperatorError, setLogicalOperatorError] = useState<string[]>([]);

    //初回レンダリング時に実行しない
    useUpdateEffect(() => {
        checkBraketPair();
    }, [termComponents]);

    const draggableStringList = enumsToObjects([BraketSymbolEnum, LogicalOperationJpEnum]);

    const checkBraketPair = () => {

        let errorArray: string[] = [];

        let tmpCode: string[] = [];
        for (let i = 0; i < termComponents.length; i++) {
            tmpCode = [...tmpCode, ...(termComponents[i].leftOfTermValue ?? [])];
            tmpCode = [...tmpCode, ...(termComponents[i].rightOfTermValue ?? [])];
        }

        const result: { isBalanced: boolean, isCorrectOrder: boolean, balance: number, hasEmptyParentheses: boolean } = (checkParenthesesBalance(tmpCode.join('')));

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
            // errorArray.push(`『 ${BraketSymbolEnum.LeftBraket} 』と『 ${BraketSymbolEnum.RigthBraket} 』の内側には要素が必要です`);
        }
        setBraketError(errorArray);
    }

    const addTermComponent = () => {
        setTermComponents([...termComponents, { name: keyPrefixEnum.RigthSide }]);
    };
    const removeTermComponent = (index: number) => {
        setTermComponents(termComponents.filter((_, i) => i !== index));
    };

    const removeOneSideOfTerm = (id: string) => {

        const popElment = (array: string[] | undefined): string[] => {
            if (!array) return [];
            array.pop();
            return array;
        }

        //(左辺または右辺)_(項のインデックス)_(項の左側または右側)という文字列を想定
        const overIdSplitArray = id.split('_');
        const item: DnclTextFieldProps | undefined = termComponents.find((item: DnclTextFieldProps, i: number) =>
            i === Number(overIdSplitArray[1]
            ));
        if (!item) return;

        let newArray: string[] = [];
        let propertyName = '';
        if (overIdSplitArray[2] == keyPrefixEnum.LeftOfTerm) {
            newArray = popElment(item.leftOfTermValue);
            propertyName = 'leftOfTermValue';
        } else {
            newArray = popElment(item.rightOfTermValue)
            propertyName = 'rightOfTermValue';
        }
        //プロパティに変数を使うときは[]をつける
        setTermComponents((prevItems) =>
            prevItems.map((item: DnclTextFieldProps, i: number) =>
                i === Number(overIdSplitArray[1]) ? { ...item, [propertyName]: newArray } : item
            ));
    }
    const addOneSideOfTerm = (id: string) => {

        //(左辺または右辺)_(項のインデックス)_(項の左側または右側)という文字列を想定
        const overIdSplitArray = id.split('_');
        const item: DnclTextFieldProps | undefined = termComponents.find((item: DnclTextFieldProps, i: number) =>
            i === Number(overIdSplitArray[1]
            ));
        if (!item) return;
        let newArray: string[] = [];
        let propertyName = '';
        const draggingString = getValueByKey(draggableStringList, activeId);
        let errorArray: string[] = [];

        if (overIdSplitArray[2] == keyPrefixEnum.LeftOfTerm && draggingString == LogicalOperationJpEnum.Not) {

            //左側「でない」の論理演算子を禁止
            errorArray.push(`「${LogicalOperationJpEnum.Not}」は左側で使用できません`);
        }
        if (overIdSplitArray[2] == keyPrefixEnum.LeftOfTerm && Number(overIdSplitArray[1]) == 0) {

            //先頭で「かつ」「または」の論理演算子を禁止
            switch (draggingString) {
                case LogicalOperationJpEnum.And:
                case LogicalOperationJpEnum.Or:
                    errorArray.push(`「${LogicalOperationJpEnum.And}」「${LogicalOperationJpEnum.Or}」「${LogicalOperationJpEnum.Not}」は先頭で使用できません`);
            }
        }
        if (overIdSplitArray[2] == keyPrefixEnum.RightOfTerm && Number(overIdSplitArray[1]) == termComponents.length - 1) {
            //末尾で「かつ」「または」の論理演算子を禁止
            switch (draggingString) {
                case LogicalOperationJpEnum.And:
                case LogicalOperationJpEnum.Or:
                    errorArray.push(`「${LogicalOperationJpEnum.And}」「${LogicalOperationJpEnum.Or}」は末尾で使用できません`);
            }
        }
        setLogicalOperatorError(errorArray);
        if (errorArray.length > 0) {
            return;
        }
        if (overIdSplitArray[2] == keyPrefixEnum.LeftOfTerm) {
            newArray = (item.leftOfTermValue ?? []).concat(draggingString);
            propertyName = 'leftOfTermValue';
        } else {
            newArray = (item.rightOfTermValue ?? []).concat(draggingString);
            propertyName = 'rightOfTermValue';
        }
        //プロパティに変数を使うときは[]をつける
        setTermComponents((prevItems) =>
            prevItems.map((item: DnclTextFieldProps, i: number) =>
                i === Number(overIdSplitArray[1]) ? { ...item, [propertyName]: newArray } : item
            ));
    }

    const draggleItems = (statementType: StatementEnum | undefined): ReactNode => {
        const brakets: ReactNode = <>
            <FormHelperText sx={{ display: 'flex', flexDirection: 'column' }} error >
                {braketError.map((error, index) => (
                    <span key={index}> {error} </span>)
                )}
            </FormHelperText>
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
                    <FormHelperText sx={{ display: 'flex', flexDirection: 'column' }} error >
                        {logicalOperatorError.map((error, index) => (
                            <span key={index}> {error} </span>)
                        )}
                    </FormHelperText>
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
            case StatementEnum.Condition:
                return OperationEnum.Condition;
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
                        <DraggableItem id={activeId} value={getValueByKey(draggableStringList, activeId)} cursor="grabbing" />
                    </DragOverlay>
                    {children}
                    <Box>
                        {termComponents.map((component, index) => (
                            <Stack direction="row" spacing={0} key={`${component.name}_${index}`}>
                                {index > 0 && <Operator name={`${component.name}`} parentIndex={index} type={getOperationType(statementType)}></Operator>}
                                <Droppable id={`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.LeftOfTerm}`} isDragging={isDragging} onClick={() => removeOneSideOfTerm(`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.LeftOfTerm}`)} stringArray={component.leftOfTermValue}>{component.leftOfTermValue?.join('')}</Droppable>
                                <DnclTextField name={`${component.name}`} index={index} inputType={getSwitchType(statementType)} />
                                <Droppable id={`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.RightOfTerm}`} isDragging={isDragging} onClick={() => removeOneSideOfTerm(`${keyPrefixEnum.RigthSide}_${index}_${keyPrefixEnum.RightOfTerm}`)} stringArray={component.rightOfTermValue}>{component.rightOfTermValue?.join('')}</Droppable>
                                {(index == termComponents.length - 1 && index != 0) && <IconButton aria-label="delete" onClick={() => removeTermComponent(index)}><BackspaceIcon /></IconButton>}
                            </Stack>
                        ))}

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
