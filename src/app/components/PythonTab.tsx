import { Box, BoxProps } from "@mui/material";
import { TreeItems } from "../types";
import { BraketSymbolEnum, SimpleAssignmentOperator, ProcessEnum, UserDefinedFunc, OutputEnum, ConditionEnum, ComparisonOperator, ComparisonOperatorDncl, LoopEnum, ArithmeticOperator, BreakEnum, ArithmeticOperatorPython } from "../enum";
import { cnvToRomaji, containsJapanese, getEnumIndex, tryParseToPyFunc } from "../utilities";
import { FC, Fragment, ReactNode, useEffect, useState } from "react";
import ScopeBox from "./ScopeBox";
import styles from "./tab.module.css"

interface CustomBoxProps extends BoxProps {
    children: React.ReactNode;
    treeItems: TreeItems;
}

//Pythonのオペランドに変換
export const cnvLogicalOperators = (targetString: string) => {
    // 置換規則を定義
    const replacements = [
        { regex: /\s*\|\|\s*/g, replacement: ' or ' },
        { regex: /\s*\&\&\s*/g, replacement: ' and ' },
        { regex: /!\(/g, replacement: 'not (' },
        { regex: /!([^=])/g, replacement: 'not $1' }
    ];

    replacements.forEach(({ regex, replacement }) => {
        targetString = targetString.replace(regex, replacement);
    });

    return targetString;
}

const cnvToken = (token: string): string => {
    token = token.replace(ArithmeticOperator.DivisionOperatorQuotient, ArithmeticOperatorPython.DivisionOperatorQuotient)
    token = cnvLogicalOperators(token);
    const { convertedStr } = tryParseToPyFunc(token);
    return convertedStr;
}

const cnvToPython = async (statement: { lineTokens: string[], processIndex: number }) => {

    const lineTokens: string[] = statement.lineTokens.map(token => { return cnvToken(token) });
    let tmpLine: string = '';

    switch (statement.processIndex) {
        case ProcessEnum.SetValToVariableOrArray:
        case ProcessEnum.InitializeArray:
        case ProcessEnum.BulkAssignToArray:
        case ProcessEnum.Increment:
        case ProcessEnum.Decrement:

            tmpLine = `${lineTokens[0]} ${lineTokens[1]} ${lineTokens[2]}`
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

            if (Number(node.processIndex) == ProcessEnum.EndDoWhile) {
                const items: TreeItems = [
                    {
                        id: node.id, children: [
                            {
                                id: node.id, children: [

                                ], line: '', lineTokens: [], processIndex: ProcessEnum.Break
                            }
                        ], line: '', lineTokens: node.lineTokens, processIndex: ProcessEnum.If
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
            ...sx
        }} {...props} >
            {nodes}
        </Box>
    );
};
