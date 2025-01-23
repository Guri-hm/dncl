import React from 'react';
import { Box, BoxProps } from "@mui/material";
import { useEffect, useState, Fragment } from "react";
import { DnclValidationType, TreeItems } from "../types";
import { BraketSymbolEnum, SimpleAssignmentOperator, ProcessEnum, UserDefinedFunc, OutputEnum, ConditionEnum, ComparisonOperator, LoopEnum, ArithmeticOperator } from "../enum";
import { cnvToDivision, cnvToRomaji, containsJapanese, flattenTree, tryParseToJsFunction } from "../utilities";
import Divider from '@mui/material/Divider';

interface CustomBoxProps extends BoxProps {
    children?: React.ReactNode;
    treeItems: TreeItems;
    runResults: string[];
    setRunResults: any;
    dnclValidation: DnclValidationType,
    tmpMsg: string,
    setTmpMsg: any,
}
type Err = {
    msg: string,
    color: string
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

const Color = {
    error: 'var(--error)',
    warnning: 'var(--warnning)',
    darkgray: 'var(--darkgray)',
    white: 'white'
}

export const ConsoleTab: React.FC<CustomBoxProps> = ({ treeItems, runResults, setRunResults, dnclValidation, tmpMsg, setTmpMsg }) => {

    const [code, setCode] = useState('');
    const [error, setError] = useState<Err | null>(null);

    useEffect(() => {

        const fetchLintResults = async () => {

            if (!code) {
                return;
            }

            if (dnclValidation.hasError) {
                return;
            }

            try {
                const response = await fetch('/api/lint', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ code }), // コードを送信
                });

                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Something went wrong');
                }

                const data = await response.json();

                setTmpMsg('エラーを解決してください');

                console.log(data)
                if (data.resultText == '') {
                    execute();
                    setTmpMsg('');
                } else {
                    setError({ color: Color.warnning, msg: data.resultText });
                }

            } catch (err: any) {
                setError({ color: Color.error, msg: err.message || 'An unexpected error occurred' });
            } finally {
            }

        };

        fetchLintResults();

    }, [dnclValidation])

    useEffect(() => {
        if (dnclValidation.errors.length > 0) {
            setError({ color: Color.warnning, msg: dnclValidation.errors.join('\n') || 'An unexpected error occurred' });
        }

        const convertCode = async () => {
            setCode(await renderCode(treeItems))
        };
        if (!dnclValidation.hasError) {
            convertCode();
        } else {
            setTmpMsg('エラーを解決してください');
        }

    }, [dnclValidation]);

    const execute = async () => {
        setError(null);

        try {
            const response = await fetch('/api/execute', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ code }),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Something went wrong');
            }

            const data = await response.json();
            setRunResults((prevResults: string[]) => (prevResults ? [...prevResults, data.result] : [data.result]));
        } catch (err: any) {
            setError({ color: Color.error, msg: err.message || 'An unexpected error occurred' });
        }
    };

    const renderCode = async (nodes: TreeItems): Promise<string> => {
        const flatten = flattenTree(treeItems);

        const renderCodeArray = await Promise.all(flatten.map(async (node, index) => {

            const content = await cnvToJs({ lineTokens: node.lineTokens ?? [], processIndex: Number(node.processIndex) });
            return content
        }));

        return renderCodeArray.join('\n');
    }

    const convertNewLinesToBreaks = (text: string | null) => {
        if (!text) {
            return null;
        }
        return text.split('\n').map((line, index) => (
            <Fragment key={index}>
                {line}
                <br />
            </Fragment>
        ));
    };
    const renderResults = (results: string[]): React.ReactNode => {
        return results.map((result, index) => (
            <Fragment key={index}>
                {index > 0 && <Divider sx={{ borderColor: Color.white }} />}
                <Box sx={{ paddingY: 0.2, paddingX: 1 }}>
                    {convertNewLinesToBreaks(result)}
                </Box>
            </Fragment>
        ))
    }

    return <Box>

        {tmpMsg && <Box sx={{ padding: 1 }}> {tmpMsg}</Box>}
        {(error) && <Box sx={{ padding: 1, color: error.color }}>エラー
            <Box>
                {(error) && convertNewLinesToBreaks(error.msg)}
            </Box>
        </Box>
        }
        <Box>
            {runResults && renderResults(runResults)}
        </Box>
    </Box>
};
