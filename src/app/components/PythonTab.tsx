import { Box, BoxProps } from "@mui/material";
import { FC, useEffect, useState, Fragment, ReactNode } from "react";
import { TreeItem, TreeItems } from "../types";
import { BraketSymbolEnum, SimpleAssignmentOperator, ProcessEnum, UserDefinedFunc, OutputEnum, ConditionEnum, ComparisonOperatorJs, ComparisonOperatorDncl, LoopEnum, ArithmeticOperatorJs, BreakEnum } from "../enum";
import { cnvToRomaji, containsJapanese, getEnumIndex } from "../utilities";
import ScopeBox from "./ScopeBox";
import styles from './tab.module.css';
import { TreeItem } from "./TreeItem";

interface CustomBoxProps extends BoxProps {
    children: React.ReactNode;
    treeItems: TreeItems;
}

const cnvToPython = async (statement: { lineTokens: string[], processIndex: number }) => {

    const lineTokens: string[] = statement.lineTokens;
    let tmpLine: string = '';


    switch (statement.processIndex) {
        case getEnumIndex(ProcessEnum, ProcessEnum.SetValToVariableOrArray):
        case getEnumIndex(ProcessEnum, ProcessEnum.InitializeArray):
        case getEnumIndex(ProcessEnum, ProcessEnum.BulkAssignToArray):
        case getEnumIndex(ProcessEnum, ProcessEnum.Increment):
        case getEnumIndex(ProcessEnum, ProcessEnum.Decrement):

            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[2]}`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.Output):

            tmpLine = `${OutputEnum.Python}${BraketSymbolEnum.LeftBraket}${lineTokens[0]}${BraketSymbolEnum.RigthBraket}`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.If):
            tmpLine = `${ConditionEnum.JsPythonIf} ${lineTokens[0].replace(ComparisonOperatorDncl.EqualToOperator, ComparisonOperatorJs.EqualToOperator)}:`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.ElseIf):
            tmpLine = `${ConditionEnum.PythonElseIf} ${lineTokens[0].replace(ComparisonOperatorDncl.EqualToOperator, ComparisonOperatorJs.EqualToOperator)}:`

            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.Else):
            tmpLine = `${ConditionEnum.JsPythonElse}:`

            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.While):
            tmpLine = `${LoopEnum.JsPythonWhile} ${lineTokens[0]}:`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.EndIf):
        case getEnumIndex(ProcessEnum, ProcessEnum.EndWhile):
        case getEnumIndex(ProcessEnum, ProcessEnum.EndFor):
        case getEnumIndex(ProcessEnum, ProcessEnum.Defined):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.DoWhile):
            tmpLine = `${LoopEnum.PythonDoWhile}:`;

            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.EndDoWhile):
            //PythonではDoWhileに相当する書き方が端的に処理できない
            //ifとして処理
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.ForIncrement):
        case getEnumIndex(ProcessEnum, ProcessEnum.ForDecrement):
            tmpLine = `${LoopEnum.JsPythonFor} ${lineTokens[0]} ${LoopEnum.PythonIn} ${LoopEnum.PythonRange}${BraketSymbolEnum.LeftBraket}${lineTokens[1]}, ${lineTokens[2]} ${statement.processIndex == getEnumIndex(ProcessEnum, ProcessEnum.ForIncrement) ? ArithmeticOperatorJs.AdditionOperator : ArithmeticOperatorJs.SubtractionOperator} 1, ${statement.processIndex == getEnumIndex(ProcessEnum, ProcessEnum.ForDecrement) ? ArithmeticOperatorJs.SubtractionOperator : ''}${lineTokens[3]}${BraketSymbolEnum.RigthBraket}:`;
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.DefineFunction):

            tmpLine = `${UserDefinedFunc.Python} ${lineTokens[0].replace(' ', '')}:`
            if (containsJapanese(tmpLine)) {
                tmpLine = await cnvToRomaji(tmpLine);
            }
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.ExecuteUserDefinedFunction):
            tmpLine = `${lineTokens[0].replace(' ', '')}`
            if (containsJapanese(tmpLine)) {
                tmpLine = await cnvToRomaji(tmpLine);
            }
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.Break):
            tmpLine = `${BreakEnum.Break}`
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
    [key: string]: any;
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


export const PythonTab: FC<CustomBoxProps> = ({ treeItems, children, sx, ...props }) => {

    const [shouldRunEffect, setShouldRunEffect] = useState(false);
    const [nodes, setNodes] = useState<React.ReactNode>(children);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShouldRunEffect(true);
        }, 1000); // 1秒後に実行
        return () => clearTimeout(timer); // クリーンアップ
    }, [treeItems]);

    useEffect(() => {
        if (shouldRunEffect) {
            const convertCode = async () => {
                setNodes(await renderNodes(treeItems, 0));
            };
            setShouldRunEffect(false); // フラグをリセット
            convertCode();
        }
    }, [shouldRunEffect]);

    const renderNodes = async (nodes: TreeItems, depth: number): Promise<ReactNode> => {
        const renderedNodes = await Promise.all(nodes.map(async (node, index) => {
            const content = await cnvToPython({ lineTokens: node.lineTokens ?? [], processIndex: Number(node.processIndex) });

            if (Number(node.processIndex) == getEnumIndex(ProcessEnum, ProcessEnum.EndDoWhile)) {
                const items: TreeItem[] = [
                    {
                        id: node.id, children: [
                            {
                                id: node.id, children: [

                                ], line: '', lineTokens: [], processIndex: getEnumIndex(ProcessEnum, ProcessEnum.Break)
                            }
                        ], line: '', lineTokens: node.lineTokens, processIndex: getEnumIndex(ProcessEnum, ProcessEnum.If)
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
                )
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
        }));

        return renderedNodes;
    }



    return (
        <Box className={styles.codeContainer} sx={{
            ...sx,
            fontSize: '1rem', lineHeight: 1.5
        }} {...props} >
            {nodes}
        </Box>
    );
};
