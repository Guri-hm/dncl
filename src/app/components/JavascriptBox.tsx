import { Box, BoxProps } from "@mui/material";
import { FC, useEffect, useState, Fragment } from "react";
import { TreeItem, TreeItems } from "../types";
import { BraketSymbolEnum, SimpleAssignmentOperator, ProcessEnum, UserDefinedFuncJpDncl, UserDefinedFuncJs, OutputEnum, ConditionEnum, ComparisonOperatorJs, ComparisonOperatorDncl } from "../enum";
import { cnvToRomaji, containsJapanese, getEnumIndex } from "../utilities";
import Kuroshiro from 'kuroshiro';
import KuromojiAnalyzer from '@sglkc/kuroshiro-analyzer-kuromoji';
import ScopeBox from "./ScopeBox";

interface CustomBoxProps extends BoxProps {
    children: React.ReactNode;
    treeItems: TreeItems;
}

const extractFromTreeItems = (treeItems: TreeItem[]): { lineTokens: string[], processIndex: number }[] => {
    const result: { lineTokens: string[], processIndex: number }[] = [];

    const traverse = (item: TreeItem) => {
        result.push({ lineTokens: item.lineTokens ?? [], processIndex: item.processIndex ?? getEnumIndex(ProcessEnum, ProcessEnum.Unknown) });
        item.children.forEach(child => traverse(child));
    };

    treeItems.forEach(item => traverse(item));
    return result;
};

const cnvToJs = async (statement: { lineTokens: string[], processIndex: number }) => {

    const lineTokens: string[] = statement.lineTokens;
    let tmpLine: string = '';


    switch (statement.processIndex) {
        case getEnumIndex(ProcessEnum, ProcessEnum.SetValToVariableOrArray):
        case getEnumIndex(ProcessEnum, ProcessEnum.InitializeArray):
        case getEnumIndex(ProcessEnum, ProcessEnum.BulkAssignToArray):
        case getEnumIndex(ProcessEnum, ProcessEnum.Increment):
        case getEnumIndex(ProcessEnum, ProcessEnum.Decrement):

            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[2]};`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.Output):

            tmpLine = `${OutputEnum.Js}(${lineTokens[0]});`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.If):
            tmpLine = `${ConditionEnum.JsIf}${BraketSymbolEnum.LeftBraket}${lineTokens[0].replace(ComparisonOperatorDncl.EqualToOperator, ComparisonOperatorJs.EqualToOperator)}${BraketSymbolEnum.RigthBraket}${BraketSymbolEnum.OpenBrace}`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.ElseIf):
            tmpLine = `${BraketSymbolEnum.CloseBrace}${ConditionEnum.JsElseIf}${BraketSymbolEnum.LeftBraket}${lineTokens[0].replace(ComparisonOperatorDncl.EqualToOperator, ComparisonOperatorJs.EqualToOperator)}${BraketSymbolEnum.RigthBraket}${BraketSymbolEnum.OpenBrace}`

            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.Else):
            tmpLine = `${BraketSymbolEnum.CloseBrace}${ConditionEnum.JsElse}${BraketSymbolEnum.OpenBrace}`

            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.EndIf):
            tmpLine = `${BraketSymbolEnum.CloseBrace};`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.While):
            tmpLine = `${ConditionEnum.JsWhile}${BraketSymbolEnum.LeftBraket}${lineTokens[0]}${BraketSymbolEnum.RigthBraket}${BraketSymbolEnum.OpenBrace}`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.EndWhile):
            tmpLine = `${BraketSymbolEnum.CloseBrace};`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.DoWhile):
            tmpLine = `${ConditionEnum.JsDoWhile}${BraketSymbolEnum.OpenBrace}`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.EndDoWhile):
            tmpLine = `${BraketSymbolEnum.CloseBrace}${ConditionEnum.JsWhile}${BraketSymbolEnum.LeftBraket}${lineTokens[0]}${BraketSymbolEnum.RigthBraket}${BraketSymbolEnum.OpenBrace}`
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.ForIncrement):
        case getEnumIndex(ProcessEnum, ProcessEnum.ForDecrement):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.EndFor):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.DefineFunction):

            tmpLine = `${UserDefinedFuncJs.UserDefined} ${lineTokens[0]}${BraketSymbolEnum.OpenBrace}`
            if (containsJapanese(tmpLine)) {
                tmpLine = await cnvToRomaji(tmpLine);
            }
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.Defined):
            break;

        case getEnumIndex(ProcessEnum, ProcessEnum.ExecuteUserDefinedFunction):
            break;

        default:
            break;

    }

    return tmpLine;
}

export const JavascriptBox: FC<CustomBoxProps> = ({ treeItems, children, sx, ...props }) => {
    // console.log(treeItems)
    const dnclStatements = extractFromTreeItems(treeItems);
    // console.log(codeValues)
    // const romajiFromHiragana = wanakana.toRomaji("あいうえお");
    // const aaa = wanakana.toRomaji("apple()");
    // console.log(romajiFromHiragana)

    const [codeLines, setCodeLines] = useState<string[]>(['変換中']);
    const [shouldRunEffect, setShouldRunEffect] = useState(false);
    const [nodes, setNodes] = useState<React.ReactNode>(false);

    useEffect(() => {
        if (dnclStatements.length > 0) {
            console.log(treeItems)
            const timer = setTimeout(() => {
                setShouldRunEffect(true);
            }, 1000); // 1秒後に実行
            return () => clearTimeout(timer); // クリーンアップ
        }
    }, [treeItems]);

    useEffect(() => {
        if (shouldRunEffect) {
            console.log(treeItems)
            const convertCode = async () => {
                if (dnclStatements) {
                    setNodes(renderNodes(treeItems));
                    // let jsCodeLines = [];
                    // for (let i = 0; i < dnclStatements.length; i++) {
                    //     const jsLine = await cnvToJs(dnclStatements[i])
                    //     jsCodeLines.push(jsLine);

                    // }

                    // setCodeLines(jsCodeLines);
                }
            };
            setShouldRunEffect(false); // フラグをリセット
            convertCode();
        }
    }, [shouldRunEffect]);

    const renderNodes = (nodes: TreeItems): React.ReactNode => {
        return nodes.map((node) => (
            <Fragment key={node.id}>
                <Box>{node.line}</Box>
                {node.children.length > 0 && (
                    <ScopeBox nested={true}>
                        {renderNodes(node.children)}
                    </ScopeBox>
                )}
            </Fragment>
        ))
    }

    return (
        <Box sx={{
            ...sx,
        }} {...props} >
            {nodes}
            {/* {codeLines.map((line: string, index: number) => (

                <div key={index}>{line}</div>

            ))} */}
        </Box>
    );
};
