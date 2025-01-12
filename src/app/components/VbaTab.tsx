import { Box, BoxProps } from "@mui/material";
import { FC, useEffect, useState, Fragment } from "react";
import { TreeItems } from "../types";
import { BraketSymbolEnum, SimpleAssignmentOperator, ProcessEnum, UserDefinedFunc, OutputEnum, ConditionEnum, ComparisonOperatorJs, ComparisonOperatorDncl, LoopEnum, ArithmeticOperatorJs } from "../enum";
import { cnvToRomaji, containsJapanese, getEnumIndex } from "../utilities";
import ScopeBox from "./ScopeBox";
import styles from './tab.module.css';

interface CustomBoxProps extends BoxProps {
    children: React.ReactNode;
    treeItems: TreeItems;
}

const cnvToVba = async (statement: { lineTokens: string[], processIndex: number }) => {

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

            tmpLine = `${OutputEnum.Vba}${BraketSymbolEnum.LeftBraket}${lineTokens[0]}${BraketSymbolEnum.RigthBraket}`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.If):
            tmpLine = `${ConditionEnum.VbaIf} ${lineTokens[0].replace(ComparisonOperatorDncl.EqualToOperator, ComparisonOperatorJs.EqualToOperator)} ${ConditionEnum.VbaThen}`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.ElseIf):
            tmpLine = `${ConditionEnum.VbaElseIf} ${lineTokens[0].replace(ComparisonOperatorDncl.EqualToOperator, ComparisonOperatorJs.EqualToOperator)} ${ConditionEnum.VbaThen}`

            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.Else):
            tmpLine = `${ConditionEnum.VbaElse}`

            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.EndIf):
            tmpLine = `${ConditionEnum.VbaEndIf}`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.While):
            tmpLine = `${LoopEnum.VbaWhile} ${lineTokens[0]}`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.EndWhile):
            tmpLine = `${LoopEnum.VbaEndWhile}`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.DoWhile):
            tmpLine = `${LoopEnum.VbaDoWhile}`;

            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.EndDoWhile):
            tmpLine = `${LoopEnum.VbaEndDoWhile} ${lineTokens[0]}`;
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.ForIncrement):
        case getEnumIndex(ProcessEnum, ProcessEnum.ForDecrement):
            tmpLine = `${LoopEnum.VbaFor} ${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[1]} ${LoopEnum.VbaTo} ${lineTokens[2]}
                    ${LoopEnum.VbaStep} ${statement.processIndex == getEnumIndex(ProcessEnum, ProcessEnum.ForIncrement) ? '' : ArithmeticOperatorJs.SubtractionOperator}${lineTokens[3]}`;
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.EndFor):
            tmpLine = `${LoopEnum.VbaNext}`;
            break;
        case getEnumIndex(ProcessEnum, ProcessEnum.Defined):
            tmpLine = `${UserDefinedFunc.VbaEndFunction}`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.DefineFunction):

            tmpLine = `${UserDefinedFunc.VbaFunction} ${lineTokens[0].replace(' ', '')}`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.ExecuteUserDefinedFunction):
            tmpLine = `${UserDefinedFunc.VbaCall} ${lineTokens[0].replace(' ', '')}`
            break;

        default:
            tmpLine = '';
            break;

    }

    return tmpLine;
}

export const VbaTab: FC<CustomBoxProps> = ({ treeItems, children, sx, ...props }) => {

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
                setNodes(renderNodes(treeItems, 0));
            };
            setShouldRunEffect(false); // フラグをリセット
            convertCode();
        }
    }, [shouldRunEffect]);

    const renderNodes = (nodes: TreeItems, depth: number): React.ReactNode => {
        return nodes.map((node, index) => (
            <Fragment key={node.id}>
                <Box className={(index == 0 && depth != 0) ? styles.noCounter : ""}>{cnvToVba({ lineTokens: node.lineTokens ?? [], processIndex: Number(node.processIndex) })}</Box>
                {node.children.length > 0 && (
                    <ScopeBox nested={true} depth={depth + 1}>
                        {renderNodes(node.children, depth + 1)}
                    </ScopeBox>
                )}
            </Fragment>
        ))
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
