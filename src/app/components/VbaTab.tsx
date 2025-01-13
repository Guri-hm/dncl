import { Box, BoxProps } from "@mui/material";
import { FC, useEffect, useState, Fragment } from "react";
import { TreeItem, TreeItems } from "../types";
import { BraketSymbolEnum, SimpleAssignmentOperator, ProcessEnum, UserDefinedFunc, OutputEnum, ConditionEnum, ComparisonOperator, ComparisonOperatorDncl, LoopEnum, ArithmeticOperator, ArithmeticOperatorPython, ArithmeticOperatorVba } from "../enum";
import { tryParseToVbaFunc } from "../utilities";
import ScopeBox from "./ScopeBox";
import styles from './tab.module.css';

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

        return targetString;
    }
    token = replaceTexts(token);
    const { convertedStr } = tryParseToVbaFunc(token);
    return convertedStr;
}

const cnvToVba = async (statement: { lineTokens: string[], processIndex: number }) => {

    const lineTokens: string[] = statement.lineTokens.map(token => { return cnvToken(token) });
    let tmpLine: string = '';

    switch (statement.processIndex) {
        case ProcessEnum.SetValToVariableOrArray:
        case ProcessEnum.InitializeArray:
        case ProcessEnum.BulkAssignToArray:
        case ProcessEnum.Increment:
        case ProcessEnum.Decrement:

            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[2]}`
            break;

        case ProcessEnum.Output:

            tmpLine = `${OutputEnum.Vba}${BraketSymbolEnum.LeftBraket}${lineTokens[0]}${BraketSymbolEnum.RigthBraket}`
            break;

        case ProcessEnum.If:
            tmpLine = `${ConditionEnum.VbaIf} ${lineTokens[0]} ${ConditionEnum.VbaThen}`
            break;

        case ProcessEnum.ElseIf:
            tmpLine = `${ConditionEnum.VbaElseIf} ${lineTokens[0]} ${ConditionEnum.VbaThen}`

            break;

        case ProcessEnum.Else:
            tmpLine = `${ConditionEnum.VbaElse}`

            break;

        case ProcessEnum.EndIf:
            tmpLine = `${ConditionEnum.VbaEndIf}`
            break;

        case ProcessEnum.While:
            tmpLine = `${LoopEnum.VbaWhile} ${lineTokens[0]}`
            break;

        case ProcessEnum.EndWhile:
            tmpLine = `${LoopEnum.VbaEndWhile}`
            break;

        case ProcessEnum.DoWhile:
            tmpLine = `${LoopEnum.VbaDoWhile}`;

            break;

        case ProcessEnum.EndDoWhile:
            tmpLine = `${LoopEnum.VbaEndDoWhile} ${lineTokens[0]}`;
            break;

        case ProcessEnum.ForIncrement:
        case ProcessEnum.ForDecrement:
            tmpLine = `${LoopEnum.VbaFor} ${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[1]} ${LoopEnum.VbaTo} ${lineTokens[2]}
                    ${LoopEnum.VbaStep} ${statement.processIndex == ProcessEnum.ForIncrement ? '' : ArithmeticOperator.SubtractionOperator}${lineTokens[3]}`;
            break;

        case ProcessEnum.EndFor:
            tmpLine = `${LoopEnum.VbaNext}`;
            break;
        case ProcessEnum.Defined:
            tmpLine = `${UserDefinedFunc.VbaEndFunction}`
            break;

        case ProcessEnum.DefineFunction:

            tmpLine = `${UserDefinedFunc.VbaFunction} ${lineTokens[0]}`
            break;

        case ProcessEnum.ExecuteUserDefinedFunction:
            tmpLine = `${lineTokens[0]}`
            break;
        case ProcessEnum.Sub:
            tmpLine = `${UserDefinedFunc.VbaSub}${BraketSymbolEnum.LeftBraket}${BraketSymbolEnum.RigthBraket}`
            break;
        case ProcessEnum.EndSub:
            tmpLine = `${UserDefinedFunc.VbaEndSub}`
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

    let isStartedSub: boolean = false;
    const renderNodes = (nodes: TreeItems, depth: number): React.ReactNode => {

        const reactNodes = nodes.map((node, index) => {
            [ProcessEnum.DefineFunction, ProcessEnum.Defined]

            //Subプロシージャの開始と終了を出力
            if (!isStartedSub && depth == 0 && ![ProcessEnum.DefineFunction, ProcessEnum.Defined].includes(Number(node.processIndex))) {
                //再帰的に呼び出すときに分岐させる
                isStartedSub = true;
                const sub = <Fragment key={node.id}>
                    <Box className={(index == 0 && depth != 0) ? styles.noCounter : ""}>{cnvToVba({ lineTokens: [], processIndex: ProcessEnum.Sub })}</Box>
                    <ScopeBox nested={true} depth={depth + 1}>
                        {renderNodes([node], depth + 1)}
                    </ScopeBox>
                    <Box>{cnvToVba({ lineTokens: [], processIndex: ProcessEnum.EndSub })}</Box>
                </Fragment>
                isStartedSub = false;
                return sub;
            }

            return (

                <Fragment key={node.id}>
                    <Box className={(index == 0 && depth != 0) ? styles.noCounter : ""}>{cnvToVba({ lineTokens: node.lineTokens ?? [], processIndex: Number(node.processIndex) })}</Box>
                    {node.children.length > 0 && (
                        <ScopeBox nested={true} depth={depth + 1}>
                            {renderNodes(node.children, depth + 1)}
                        </ScopeBox>
                    )}
                </Fragment>
            )

        })

        return reactNodes;
    }

    return (
        <Box className={styles.codeContainer} sx={{
            ...sx
        }} {...props} >
            {nodes}
        </Box>
    );
};
