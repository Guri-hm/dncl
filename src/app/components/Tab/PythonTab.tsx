import { Box, BoxProps } from "@mui/material";
import { TreeItem, TreeItems } from "@/app/types";
import { BraketSymbolEnum, SimpleAssignmentOperator, ProcessEnum, UserDefinedFunc, OutputEnum, ConditionEnum, LoopEnum, ArithmeticOperator, BreakEnum, ArithmeticOperatorPython } from "@/app/enum";
import { capitalizeTrueFalse, cnvToRomaji, containsJapanese, tryParseToPyFunc } from "@/app/utilities";
import React, { FC, Fragment, ReactNode, useCallback, useMemo, useState, useEffect, useRef } from "react";
import { ScopeBox } from "@/app/components/Tab";
import styles from "./tab.module.css"

const pythonConversionCache = new Map<string, React.ReactNode>();

interface CustomBoxProps extends BoxProps {
    children: React.ReactNode;
    treeItems: TreeItems;
}

const cnvToken = (token: string): string => {
    //Pythonのオペランドに変換
    const replaceTexts = (targetString: string) => {
        // 置換規則を定義
        const replacements = [
            { regex: /\s*\|\|\s*/g, replacement: ' or ' },
            { regex: /\s*\&\&\s*/g, replacement: ' and ' },
            { regex: /!\(/g, replacement: 'not (' },
            { regex: /!([^=])/g, replacement: 'not $1' },
            { regex: ArithmeticOperator.DivisionOperatorQuotient, replacement: ArithmeticOperatorPython.DivisionOperatorQuotient },
        ];

        replacements.forEach(({ regex, replacement }) => {
            targetString = targetString.replace(regex, replacement);
        });

        targetString = capitalizeTrueFalse(targetString);

        return targetString;
    }
    token = replaceTexts(token);
    const { convertedStr } = tryParseToPyFunc(token);
    return convertedStr;
}

const cnvToPython = async (statement: { lineTokens: string[], processIndex: number, constants?: string[] }) => {

    const lineTokens: string[] = statement.lineTokens.map(token => { return cnvToken(token) });
    let tmpLine: string = '';

    switch (statement.processIndex) {
        case ProcessEnum.SetValToVariableOrArray:
            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[1]}`
            break;
        case ProcessEnum.InitializeArray:
            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${BraketSymbolEnum.OpenSquareBracket}${lineTokens[1]}${BraketSymbolEnum.CloseSquareBracket}`
            break;

        case ProcessEnum.BulkAssignToArray:
            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} [${lineTokens[1]} for _ in ${lineTokens[0]}]`
            break;
        case ProcessEnum.Increment:
            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[0]} ${ArithmeticOperator.AdditionOperator} ${lineTokens[1]}`
            break;
        case ProcessEnum.Decrement:
            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[0]} ${ArithmeticOperator.SubtractionOperator} ${lineTokens[1]}`
            break;

        case ProcessEnum.Output:

            tmpLine = `${OutputEnum.Python}${BraketSymbolEnum.LeftBraket}${lineTokens[0]}${BraketSymbolEnum.RigthBraket}`
            break;

        case ProcessEnum.If:
            tmpLine = `${ConditionEnum.JsPythonIf} ${lineTokens[0]}:`
            break;

        case ProcessEnum.ElseIf:
            tmpLine = `${ConditionEnum.PythonElseIf} ${lineTokens[0]}:`

            break;

        case ProcessEnum.Else:
            tmpLine = `${ConditionEnum.JsPythonElse}:`

            break;

        case ProcessEnum.While:
            tmpLine = `${LoopEnum.JsPythonWhile} ${lineTokens[0]}:`
            break;

        case ProcessEnum.EndIf:
        case ProcessEnum.EndWhile:
        case ProcessEnum.EndFor:
        case ProcessEnum.Defined:
            break;

        case ProcessEnum.DoWhile:
            tmpLine = `${LoopEnum.PythonDoWhile}:`;

            break;

        case ProcessEnum.EndDoWhile:
            //PythonではDoWhileに相当する書き方が端的に処理できない
            //ifとして処理
            break;

        case ProcessEnum.ForIncrement:
        case ProcessEnum.ForDecrement:
            tmpLine = `${LoopEnum.JsPythonFor} ${lineTokens[0]} ${LoopEnum.PythonIn} ${LoopEnum.PythonRange}${BraketSymbolEnum.LeftBraket}${lineTokens[1]}, ${lineTokens[2]} ${statement.processIndex == ProcessEnum.ForIncrement ? ArithmeticOperator.AdditionOperator : ArithmeticOperator.SubtractionOperator} 1, ${statement.processIndex == ProcessEnum.ForDecrement ? ArithmeticOperator.SubtractionOperator : ''}${lineTokens[3]}${BraketSymbolEnum.RigthBraket}: `;
            break;

        case ProcessEnum.DefineFunction:

            tmpLine = `${UserDefinedFunc.Python} ${lineTokens[0]}: `
            if (containsJapanese(tmpLine)) {
                tmpLine = await cnvToRomaji(tmpLine);
            }
            break;

        case ProcessEnum.ExecuteUserDefinedFunction:
            tmpLine = `${lineTokens[0]} `
            if (containsJapanese(tmpLine)) {
                tmpLine = await cnvToRomaji(tmpLine);
            }
            break;

        case ProcessEnum.Break:
            tmpLine = `${BreakEnum.Break} `
            break;

        default:
            tmpLine = '';
            break;

    }

    return tmpLine;
}

interface GuardedBoxProps {
    className?: string;
    children?: ReactNode;
}

const GuardedBox: React.FC<GuardedBoxProps> = ({ className, children, ...props }) => {
    if (!children) {
        return null; // childrenがない場合は何もレンダリングしない
    }

    return (
        <Box className={className} {...props}>
            {children}
        </Box>
    );
};

export const PythonTab: FC<CustomBoxProps> = React.memo(({ treeItems, children, sx, ...props }) => {
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
    const renderNodes = useCallback(async (nodes: TreeItems, depth: number): Promise<ReactNode> => {
        const promises = nodes.map(async (node: TreeItem, index: number) => {
            // キャッシュキーを作成
            const nodeKey = `${node.id}-${JSON.stringify(node.lineTokens)}-${node.processIndex}`;

            let content;
            if (pythonConversionCache.has(nodeKey)) {
                content = pythonConversionCache.get(nodeKey);
            } else {
                content = await cnvToPython({
                    lineTokens: node.lineTokens ?? [],
                    processIndex: Number(node.processIndex)
                });
                pythonConversionCache.set(nodeKey, content);
            }

            if (Number(node.processIndex) === ProcessEnum.EndDoWhile) {
                const items: TreeItems = [
                    {
                        id: node.id, children: [
                            {
                                id: node.id, children: [], line: '', lineTokens: [], processIndex: ProcessEnum.Break
                            }
                        ], line: '', lineTokens: node.lineTokens, processIndex: ProcessEnum.If,
                    }];
                return (
                    <Fragment key={node.id}>
                        <ScopeBox nested={true} depth={depth + 1}>
                            {await renderNodes(items, depth + 1)}
                        </ScopeBox>
                        {node.children.length > 0 && (
                            <ScopeBox nested={true} depth={depth + 1}>
                                {await renderNodes(node.children, depth + 1)}
                            </ScopeBox>
                        )}
                    </Fragment>
                );
            }

            return (
                <Fragment key={node.id}>
                    <GuardedBox className={(index === 0 && depth !== 0) ? styles.noCounter : ""}>
                        {content}
                    </GuardedBox>
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

            if (pythonConversionCache.has(treeItemsHash)) {
                const cached = pythonConversionCache.get(treeItemsHash);
                if (isMountedRef.current) setNodes(cached);
                return;
            }

            if (isMountedRef.current) setNodes("変換中");

            // 少し遅延を入れて変換中表示を確実に出す
            await new Promise(resolve => setTimeout(resolve, 100));

            if (isMountedRef.current) {
                const result = await renderNodes(treeItems, 0);
                pythonConversionCache.set(treeItemsHash, result);
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