import { Box, BoxProps } from "@mui/material";
import React, { FC, useEffect, useState, Fragment, useCallback, useMemo, useRef } from "react";
import { TreeItem, TreeItems } from "@/app/types";
import { BraketSymbolEnum, SimpleAssignmentOperator, ProcessEnum, UserDefinedFunc, OutputEnum, ConditionEnum, ComparisonOperator, LoopEnum, ArithmeticOperator, ArithmeticOperatorVba } from "@/app/enum";
import { capitalizeTrueFalse, replaceToVbaConcatenation, tryParseToVbaFunc } from "@/app/utilities";
import { ScopeBox } from "@/app/components/Tab";
import styles from './tab.module.css';
import { v4 as uuidv4 } from 'uuid'

const vbaConversionCache = new Map<string, React.ReactNode>();

interface CustomBoxProps extends BoxProps {
    children: React.ReactNode;
    treeItems: TreeItems;
}

const cnvToken = (token: string): string => {
    //VBAのオペランドに変換
    const replaceTexts = (targetString: string) => {
        // 置換規則を定義
        const replacements = [
            { regex: /\s*\|\|\s*/g, replacement: ' Or ' },
            { regex: /\s*\&\&\s*/g, replacement: ' And ' },
            { regex: /!\(/g, replacement: 'Not (' },
            { regex: /!([^=])/g, replacement: 'Not $1' },
            { regex: ArithmeticOperator.DivisionOperatorQuotient, replacement: ArithmeticOperatorVba.DivisionOperatorQuotient },
            { regex: ComparisonOperator.EqualToOperator, replacement: SimpleAssignmentOperator.Other },
            { regex: ArithmeticOperator.DivisionOperatorRemaining, replacement: ArithmeticOperatorVba.DivisionOperatorRemaining },
        ];

        replacements.forEach(({ regex, replacement }) => {
            targetString = targetString.replace(regex, replacement);
        });
        targetString = capitalizeTrueFalse(targetString);

        return targetString;
    }
    token = replaceTexts(token);
    const { convertedStr } = tryParseToVbaFunc(token);
    return convertedStr;
}

const cnvToVba = async (statement: { lineTokens: string[], processIndex: number, isConstant?: boolean }) => {

    const lineTokens: string[] = statement.lineTokens.map(token => { return cnvToken(token) });
    let tmpLine: string = '';

    switch (statement.processIndex) {
        case ProcessEnum.SetValToVariableOrArray:
            if (statement.isConstant) {
                tmpLine = `Const ${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[1]}`
            } else {
                tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[1]}`
            }
            break;
        case ProcessEnum.InitializeArray:
            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${BraketSymbolEnum.LeftBraket}${lineTokens[1]}${BraketSymbolEnum.RigthBraket}`
            break;
        case ProcessEnum.BulkAssignToArray:
            tmpLine = `For i = LBound(${lineTokens[0]}) to UBound(${lineTokens[0]})\n ${lineTokens[0]}(i) ${SimpleAssignmentOperator.Other} ${lineTokens[1]}\n Next`
            break;
        case ProcessEnum.Increment:
            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[0]} ${ArithmeticOperator.AdditionOperator} ${lineTokens[1]}`
            break;
        case ProcessEnum.Decrement:
            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[0]} ${ArithmeticOperator.SubtractionOperator} ${lineTokens[1]}`
            break;

        case ProcessEnum.Output:

            tmpLine = `${OutputEnum.Vba}${BraketSymbolEnum.LeftBraket}${replaceToVbaConcatenation(lineTokens[0])}${BraketSymbolEnum.RigthBraket} `
            break;

        case ProcessEnum.If:
            tmpLine = `${ConditionEnum.VbaIf} ${lineTokens[0]} ${ConditionEnum.VbaThen} `
            break;

        case ProcessEnum.ElseIf:
            tmpLine = `${ConditionEnum.VbaElseIf} ${lineTokens[0]} ${ConditionEnum.VbaThen} `

            break;

        case ProcessEnum.Else:
            tmpLine = `${ConditionEnum.VbaElse} `

            break;

        case ProcessEnum.EndIf:
            tmpLine = `${ConditionEnum.VbaEndIf} `
            break;

        case ProcessEnum.While:
            tmpLine = `${LoopEnum.VbaWhile} ${lineTokens[0]} `
            break;

        case ProcessEnum.EndWhile:
            tmpLine = `${LoopEnum.VbaEndWhile} `
            break;

        case ProcessEnum.DoWhile:
            tmpLine = `${LoopEnum.VbaDoWhile} `;

            break;

        case ProcessEnum.EndDoWhile:
            tmpLine = `${LoopEnum.VbaEndDoWhile} ${lineTokens[0]} `;
            break;

        case ProcessEnum.ForIncrement:
        case ProcessEnum.ForDecrement:
            tmpLine = `${LoopEnum.VbaFor} ${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[1]} ${LoopEnum.VbaTo} ${lineTokens[2]}
                    ${LoopEnum.VbaStep} ${statement.processIndex == ProcessEnum.ForIncrement ? '' : ArithmeticOperator.SubtractionOperator}${lineTokens[3]} `;
            break;

        case ProcessEnum.EndFor:
            tmpLine = `${LoopEnum.VbaNext} `;
            break;
        case ProcessEnum.Defined:
            tmpLine = `${UserDefinedFunc.VbaEndFunction} `
            break;

        case ProcessEnum.DefineFunction:

            tmpLine = `${UserDefinedFunc.VbaFunction} ${lineTokens[0]} `
            break;

        case ProcessEnum.ExecuteUserDefinedFunction:
            tmpLine = `${lineTokens[0]} `
            break;
        case ProcessEnum.Sub:
            tmpLine = `${UserDefinedFunc.VbaSub} Main${BraketSymbolEnum.LeftBraket}${BraketSymbolEnum.RigthBraket} `
            break;
        case ProcessEnum.EndSub:
            tmpLine = `${UserDefinedFunc.VbaEndSub} `
            break;

        default:
            tmpLine = '';
            break;

    }

    return tmpLine;
}

// JSONのシリアライズとパースを使ってディープコピーを作成する関数
function deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
}
const moveElementsToEnd = (items: TreeItems): { movedItems: TreeItems; remainingItems: TreeItems } => {
    // ディープコピーを作成
    const clonedItems = deepClone(items);

    const startIndex = clonedItems.findIndex(item => item.processIndex === ProcessEnum.DefineFunction);
    const endIndex = clonedItems.findIndex(item => item.processIndex === ProcessEnum.Defined);

    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
        return { movedItems: [], remainingItems: clonedItems };
    }

    const elementsToMove = clonedItems.splice(startIndex, endIndex - startIndex + 1);
    return { movedItems: elementsToMove, remainingItems: clonedItems };
};

const wrapRemainingItems = (remainingItems: TreeItems, movedItems: TreeItems): TreeItems => {
    const newParent: TreeItem = {
        id: uuidv4(),
        line: "",
        children: remainingItems,
        lineTokens: [],
        processIndex: ProcessEnum.Sub,
        variables: [],
    };
    const endSub: TreeItem = {
        id: uuidv4(),
        line: "",
        children: [],
        lineTokens: [],
        processIndex: ProcessEnum.EndSub,
        variables: [],
    };
    return [...movedItems, newParent, endSub];
};

export const VbaTab: FC<CustomBoxProps> = React.memo(({ treeItems, children, sx, ...props }) => {
    const [nodes, setNodes] = useState<React.ReactNode>(children);
    const isMountedRef = useRef<boolean>(false);

    // マウント状態を追跡
    useEffect(() => {
        isMountedRef.current = true;
        return () => {
            isMountedRef.current = false;
        };
    }, []);

    // treeItemsのハッシュを作成（変更検出用）
    const treeItemsHash = useMemo(() => {
        return JSON.stringify(treeItems);
    }, [treeItems]);

    // renderNodes関数を最適化
    const renderNodes = useCallback(async (nodes: TreeItems, depth: number): Promise<React.ReactNode> => {
        const promises = nodes.map(async (node: TreeItem, index: number) => {
            // キャッシュキーを作成
            const nodeKey = `${node.id}-${JSON.stringify(node.lineTokens)}-${node.processIndex}-${node.isConstant}`;

            let convertedVba;
            if (vbaConversionCache.has(nodeKey)) {
                convertedVba = vbaConversionCache.get(nodeKey);
            } else {
                convertedVba = await cnvToVba({
                    lineTokens: node.lineTokens ?? [],
                    processIndex: Number(node.processIndex),
                    isConstant: node.isConstant
                });
                vbaConversionCache.set(nodeKey, convertedVba);
            }

            return (
                <Fragment key={node.id}>
                    <Box className={(index === 0 && depth !== 0) ? styles.noCounter : ''}>
                        {convertedVba}
                    </Box>
                    {node.children.length > 0 && (
                        <ScopeBox nested={true} depth={depth + 1}>
                            {await renderNodes(node.children, depth + 1)}
                        </ScopeBox>
                    )}
                </Fragment>
            );
        });

        return Promise.all(promises);
    }, []);

    // コード変換処理をuseEffectに移動
    useEffect(() => {
        const convertAsync = async () => {
            if (!isMountedRef.current) return;

            if (vbaConversionCache.has(treeItemsHash)) {
                const cached = vbaConversionCache.get(treeItemsHash);
                if (isMountedRef.current) setNodes(cached);
                return;
            }

            if (isMountedRef.current) setNodes("変換中");

            // 少し遅延を入れて変換中表示を確実に出す
            await new Promise(resolve => setTimeout(resolve, 100));

            if (isMountedRef.current) {
                // EndSubに変換するTreeItemを挿入
                const { movedItems, remainingItems } = moveElementsToEnd(treeItems);
                const finalTreeItems = wrapRemainingItems(remainingItems, movedItems);
                const result = await renderNodes(finalTreeItems, 0);
                vbaConversionCache.set(treeItemsHash, result);
                if (isMountedRef.current) setNodes(result);
            }
        };

        convertAsync();
    }, [treeItemsHash, renderNodes, treeItems]);

    return (
        <Box className={styles.codeContainer} sx={{ ...sx }} {...props}>
            {nodes}
        </Box>
    );
}, (prevProps, nextProps) => {
    // カスタム比較関数
    return JSON.stringify(prevProps.treeItems) === JSON.stringify(nextProps.treeItems) &&
        JSON.stringify(prevProps.sx) === JSON.stringify(nextProps.sx);
});