import React from 'react';
import { Box, BoxProps } from "@mui/material";
import { useEffect, useState, Fragment } from "react";
import { DnclValidationType, FlattenedItem, TreeItems } from "../types";
import { BraketSymbolEnum, SimpleAssignmentOperator, ProcessEnum, UserDefinedFunc, OutputEnum, ConditionEnum, ComparisonOperator, LoopEnum, ArithmeticOperator } from "../enum";
import { checkDNCLSyntax, cnvToDivision, containsJapanese, flattenTree, tryParseToJsFunction } from "../utilities";
import Divider from '@mui/material/Divider';

interface CustomBoxProps extends BoxProps {
    children?: React.ReactNode;
    treeItems: TreeItems;
    runResults: string[];
    setRunResults: any;
    dnclValidation: DnclValidationType,
    setDnclValidation: any,
}

const cnvToken = (token: string): string => {
    token = cnvToDivision(token);
    const { convertedStr } = tryParseToJsFunction(token);
    return convertedStr;
}

const convertToHexadecimal = (str: string): string => {
    return Array.from(str)
        .map(char => char.charCodeAt(0).toString(16))
        .join('');
}

const makeVariableName = (hexStr: string): string => {
    return 'var_' + hexStr.replace(/[^a-zA-Z0-9_]/g, '');
}
function extractJapaneseAndNonJapanese(text: string) {
    // 日本語の文字を表す正規表現
    const japanesePattern = /[\u3000-\u303F\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF\uFF00-\uFFEF]/g;

    // 日本語の部分を抽出
    const japaneseMatches = text.match(japanesePattern);
    const japaneseText = japaneseMatches ? japaneseMatches.join('') : '';

    // 日本語以外の部分を抽出
    const nonJapaneseText = text.replace(japanesePattern, '');

    // 結果をオブジェクトにまとめる
    return {
        japanese: japaneseText,
        nonJapanese: nonJapaneseText
    };
}

const cnvToJs = async (statement: { lineTokens: string[], processIndex: number }) => {

    const lineTokens: string[] = statement.lineTokens.map(token => { return cnvToken(token) });
    let tmpLine: string = '';
    switch (statement.processIndex) {
        case ProcessEnum.SetValToVariableOrArray:
            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[1]};`
            break;
        case ProcessEnum.InitializeArray:
            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${BraketSymbolEnum.OpenSquareBracket}${lineTokens[1]}${BraketSymbolEnum.CloseSquareBracket};`
            break;

        case ProcessEnum.BulkAssignToArray:
            tmpLine = `${lineTokens[0]}.fill(${lineTokens[1]});`
            break;

        case ProcessEnum.Increment:
            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[0]} ${ArithmeticOperator.AdditionOperator} ${lineTokens[1]};`
            break;
        case ProcessEnum.Decrement:
            tmpLine = `${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[0]} ${ArithmeticOperator.SubtractionOperator} ${lineTokens[1]};`
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
            tmpLine = `${LoopEnum.JsPythonFor} ${BraketSymbolEnum.LeftBraket} ${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[1]}; ${lineTokens[0]} ${ComparisonOperator.LessThanOrEqualToOperator} ${lineTokens[2]}; ${lineTokens[0]} ${SimpleAssignmentOperator.Other} ${lineTokens[0]} ${statement.processIndex == ProcessEnum.ForIncrement ? ArithmeticOperator.AdditionOperator : ArithmeticOperator.SubtractionOperator} ${lineTokens[3]}${BraketSymbolEnum.RigthBraket} ${BraketSymbolEnum.OpenBrace}`;
            break;

        case ProcessEnum.DefineFunction:

            let funcName = `${lineTokens[0]}`
            if (containsJapanese(funcName)) {
                // tmpLine = await cnvToRomaji(tmpLine);
                const extracted = extractJapaneseAndNonJapanese(funcName);
                const hexStr = convertToHexadecimal(extracted.japanese);
                const variableName = makeVariableName(hexStr);
                funcName = variableName + extracted.nonJapanese;
            }
            tmpLine = `${UserDefinedFunc.Js} ${funcName} ${BraketSymbolEnum.OpenBrace}`
            break;

        case ProcessEnum.ExecuteUserDefinedFunction:
            tmpLine = `${lineTokens[0]};`
            if (containsJapanese(tmpLine)) {
                // tmpLine = await cnvToRomaji(tmpLine);
                const extracted = extractJapaneseAndNonJapanese(tmpLine);
                const hexStr = convertToHexadecimal(extracted.japanese);
                const variableName = makeVariableName(hexStr);
                tmpLine = variableName + extracted.nonJapanese;
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

export const ConsoleTab: React.FC<CustomBoxProps> = ({ treeItems, runResults, setRunResults, setDnclValidation, dnclValidation }) => {

    const [shouldRunEffect, setShouldRunEffect] = useState(false);
    const [tmpMsg, setTmpMsg] = useState<string>('ここに出力結果が表示されます');

    const fetchLintResults = async (code: string) => {

        if (!code || code == '') {
            setTmpMsg('');
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

            if (data.messages.length == 0) {
                setTmpMsg('プログラム実行中…');
                execute(code);
            } else {
                const formattedMessages = data.lineNumbers.map((lineNumber: number, index: number) => {
                    return `${lineNumber}行目：${data.messages[index]}`;
                });
                const result: DnclValidationType = { color: Color.warnning, errors: formattedMessages, hasError: true, lineNum: data.lineNumbers };
                setDnclValidation(result);
            }

        } catch (err: any) {
            const result: DnclValidationType = { color: Color.error, errors: err.message || 'An unexpected error occurred', hasError: true, lineNum: [] };
            setDnclValidation(result);
        } finally {
            setTmpMsg('');
        }

    };

    useEffect(() => {

        setTmpMsg("DNCL解析中…")
        setDnclValidation(null);
        const timer = setTimeout(() => {
            setShouldRunEffect(true);
        }, 2000); // 2秒後に実行
        return () => clearTimeout(timer); // クリーンアップ

    }, [treeItems]);

    useEffect(() => {

        if (shouldRunEffect) {
            // フラグをリセット
            setShouldRunEffect(false);

            let result: DnclValidationType = { errors: [], hasError: false, lineNum: [] };
            const flatten = flattenTree(treeItems);
            flatten.map((item: FlattenedItem, index) => {
                const { hasError, errors } = checkDNCLSyntax(flatten, item, index + 1);
                if (hasError) {
                    result.hasError = true;
                    result.errors.push(...errors);
                    result.lineNum.push(index + 1);
                }
            })

            setDnclValidation(result);
            if (result.hasError) {
                setTmpMsg('');
                return;
            }

            const convertCode = async () => {
                const code = await renderCode(treeItems);
                fetchLintResults(code);
            };

            convertCode();

        }

    }, [shouldRunEffect]);

    const execute = async (code: string) => {
        setDnclValidation(null);

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
            if (data.result != '') {
                setRunResults((prevResults: string[]) => (prevResults ? [...prevResults, data.result] : [data.result]));
            }
        } catch (err: any) {
            const result: DnclValidationType = { color: Color.error, errors: err.message || 'An unexpected error occurred', hasError: true, lineNum: [] };
            setDnclValidation(result);
        }
    };

    const renderCode = async (nodes: TreeItems): Promise<string> => {
        const flatten = flattenTree(nodes);

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
                {index > 0 && <Divider sx={{ borderColor: 'var(--slate-300)' }} />}
                <Box sx={{ paddingY: 0.2, paddingX: 1 }}>
                    {convertNewLinesToBreaks(result)}
                </Box>
            </Fragment>
        ))
    }
    return <Box>


        {tmpMsg && <Box sx={{ padding: 1 }}> {tmpMsg}</Box>}
        {(dnclValidation?.hasError) && <Box sx={{ padding: 1, color: dnclValidation?.color || Color.warnning }}>エラーを解決してください
            <Box>
                {dnclValidation?.errors ? convertNewLinesToBreaks(dnclValidation?.errors.join('\n')) : ''}
            </Box>
        </Box>
        }
        <Box>
            {runResults && renderResults(runResults)}
        </Box>
    </Box>
};
