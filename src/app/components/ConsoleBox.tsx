import { Box, BoxProps } from "@mui/material";
import { FC, useEffect, useState, Fragment } from "react";
import { TreeItems } from "../types";
import { BraketSymbolEnum, SimpleAssignmentOperator, ProcessEnum, UserDefinedFunc, OutputEnum, ConditionEnum, ComparisonOperator, LoopEnum, ArithmeticOperator } from "../enum";
import { cnvToDivision, cnvToRomaji, containsJapanese, flattenTree, getEnumIndex, tryParseToJsFunction } from "../utilities";
import ScopeBox from "./ScopeBox";
import styles from './tab.module.css';
import { SxProps, Theme } from '@mui/material';

interface CustomBoxProps extends BoxProps {
    children: React.ReactNode;
    treeItems: TreeItems;
    sx?: SxProps<Theme>;
}

const cnvToken = (token: string): string => {
    token = cnvToDivision(token);
    const { convertedStr } = tryParseToJsFunction(token);
    return convertedStr;
}

const cnvToJs = async (statement: { lineTokens: string[], processIndex: number }) => {

    const lineTokens: string[] = statement.lineTokens.map(token => { return cnvToken(token) });
    let tmpLine: string = '';

    switch (statement.processIndex) {
        case ProcessEnum.SetValToVariableOrArray:
        case ProcessEnum.InitializeArray:
        case ProcessEnum.BulkAssignToArray:
        case ProcessEnum.Increment:
        case ProcessEnum.Decrement:

            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[1]};`
            break;

        case ProcessEnum.Output:

            tmpLine = `${OutputEnum.Js}${BraketSymbolEnum.LeftBraket}${lineTokens[0]}${BraketSymbolEnum.RigthBraket};`
            break;

        case ProcessEnum.If:
            tmpLine = `${ConditionEnum.JsPythonIf} ${BraketSymbolEnum.LeftBraket}${lineTokens[0]}${BraketSymbolEnum.RigthBraket}${BraketSymbolEnum.OpenBrace}`
            break;

        case ProcessEnum.ElseIf:
            tmpLine = `${BraketSymbolEnum.CloseBrace}${ConditionEnum.JsElseIf}${BraketSymbolEnum.LeftBraket}${lineTokens[0]}${BraketSymbolEnum.RigthBraket}${BraketSymbolEnum.OpenBrace}`

            break;

        case ProcessEnum.Else:
            tmpLine = `${BraketSymbolEnum.CloseBrace}${ConditionEnum.JsPythonElse}${BraketSymbolEnum.OpenBrace}`

            break;

        case ProcessEnum.EndIf:
            tmpLine = `${BraketSymbolEnum.CloseBrace}`
            break;

        case ProcessEnum.While:
            tmpLine = `${LoopEnum.JsPythonWhile}${BraketSymbolEnum.LeftBraket}${lineTokens[0]}${BraketSymbolEnum.RigthBraket}${BraketSymbolEnum.OpenBrace}`
            break;

        case ProcessEnum.EndWhile:
        case ProcessEnum.EndFor:
        case ProcessEnum.Defined:
            tmpLine = `${BraketSymbolEnum.CloseBrace}`
            break;

        case ProcessEnum.DoWhile:
            tmpLine = `${LoopEnum.JsDoWhile}${BraketSymbolEnum.OpenBrace}`;

            break;

        case ProcessEnum.EndDoWhile:
            tmpLine = `${BraketSymbolEnum.CloseBrace}${LoopEnum.JsPythonWhile}${BraketSymbolEnum.LeftBraket}${lineTokens[0]}${BraketSymbolEnum.RigthBraket};`;
            break;

        case ProcessEnum.ForIncrement:
        case ProcessEnum.ForDecrement:
            tmpLine = `${LoopEnum.JsPythonFor} ${BraketSymbolEnum.LeftBraket}
            ${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[1]}; 
            ${lineTokens[0]} ${ComparisonOperator.LessThanOrEqualToOperator} ${lineTokens[2]}; 
            ${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[0]} ${statement.processIndex == ProcessEnum.ForIncrement ? ArithmeticOperator.AdditionOperator : ArithmeticOperator.SubtractionOperator} ${lineTokens[3]}${BraketSymbolEnum.RigthBraket} ${BraketSymbolEnum.OpenBrace}`;
            break;

        case ProcessEnum.DefineFunction:

            tmpLine = `${UserDefinedFunc.Js} ${lineTokens[0]} ${BraketSymbolEnum.OpenBrace}`
            if (containsJapanese(tmpLine)) {
                tmpLine = await cnvToRomaji(tmpLine);
            }
            break;

        case ProcessEnum.ExecuteUserDefinedFunction:
            tmpLine = `${lineTokens[0]};`
            if (containsJapanese(tmpLine)) {
                tmpLine = await cnvToRomaji(tmpLine);
            }
            break;

        default:
            tmpLine = '';
            break;

    }

    return tmpLine;
}

export const ConsoleBox: FC<CustomBoxProps> = ({ treeItems, children, sx, ...props }) => {

    const [shouldRunEffect, setShouldRunEffect] = useState(false);
    const [nodes, setNodes] = useState<React.ReactNode>(children);

    const [lintResults, setLintResults] = useState<string>('');

    // useEffect(() => {
    //     const fetchLintResults = async () => {
    //         try {
    //             const res = await fetch('/api/lint');
    //             const data = await res.json();
    //             console.log(data);
    //             setLintResults(data.resultText);
    //         } catch (error) {
    //             console.error('Error fetching lint results:', error);
    //         }
    //     };

    //     fetchLintResults();
    // }, []);

    useEffect(() => {
        const timer = setTimeout(() => {
            setShouldRunEffect(true);
        }, 1000); // 1秒後に実行
        return () => clearTimeout(timer); // クリーンアップ
    }, [treeItems]);

    useEffect(() => {
        if (shouldRunEffect) {
            const convertCode = async () => {
                setNodes(await renderNodes(treeItems));
            };
            setShouldRunEffect(false); // フラグをリセット
            convertCode();
        }
    }, [shouldRunEffect]);


    const renderNodes = async (nodes: TreeItems): Promise<string> => {

        const flatten = flattenTree(nodes);

        const renderedNodes = await Promise.all(flatten.map(async (node, index) => {

            const content = await cnvToJs({ lineTokens: node.lineTokens ?? [], processIndex: Number(node.processIndex) });
            return content
        }));

        return renderedNodes.join('');
    }
    return (
        <Box sx={{
            ...sx
        }} {...props} >
            {lintResults}
            {nodes}
        </Box>
    );
};
