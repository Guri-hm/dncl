import { Box, BoxProps, Button } from "@mui/material";
import { FC, useEffect, useState, Fragment, ReactElement } from "react";
import { TreeItem, TreeItems } from "../types";
import { BraketSymbolEnum, SimpleAssignmentOperator, ProcessEnum, UserDefinedFunc, OutputEnum, ConditionEnum, ComparisonOperator, LoopEnum, ArithmeticOperator } from "../enum";
import { cnvToDivision, cnvToRomaji, containsJapanese, flattenTree, getEnumIndex, tryParseToJsFunction } from "../utilities";
import { SxProps, Theme } from '@mui/material';
import { ErrObj } from "../types";
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import styles from './editor.module.css';
import ClearAllIcon from '@mui/icons-material/ClearAll';
import { styled } from '@mui/system';

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

const checkDNCLSyntax = (items: TreeItems, item: TreeItem, lineIndex: number): ErrObj => {

    const processIndex = item.processIndex;

    let result: ErrObj = { errors: [], hasError: false };

    switch (processIndex) {
        case ProcessEnum.Output:
            //処理なし
            break;
        case ProcessEnum.SetValToVariableOrArray:
            //右辺に配列がある場合，同じまたは上位の深度で初期化されている必要がある

            //代入先に配列がある場合，存在しないインデックスに入れられない
            break;
        case ProcessEnum.InitializeArray:
            //処理なし
            break;
        case ProcessEnum.BulkAssignToArray:
        case ProcessEnum.Increment:
        case ProcessEnum.Decrement:

            break;


        case ProcessEnum.If:
            break;

        case ProcessEnum.ElseIf:

            break;

        case ProcessEnum.Else:

            break;

        case ProcessEnum.EndIf:
            break;

        case ProcessEnum.While:
            break;

        case ProcessEnum.EndWhile:
        case ProcessEnum.EndFor:
        case ProcessEnum.Defined:
            break;

        case ProcessEnum.DoWhile:

            break;

        case ProcessEnum.EndDoWhile:
            break;

        case ProcessEnum.ForIncrement:
        case ProcessEnum.ForDecrement:
            break;

        case ProcessEnum.DefineFunction:
            break;

        case ProcessEnum.ExecuteUserDefinedFunction:
            break;

        default:
            break;

    }

    return result;
}

export const ConsoleBox: FC<CustomBoxProps> = ({ treeItems, children, sx, ...props }) => {

    const [shouldRunEffect, setShouldRunEffect] = useState(false);
    const [code, setCode] = useState('');
    const [runResults, setRunResults] = useState<string[] | null>(null);
    const [error, setError] = useState<string | null>(null);
    const [tmpMsg, setTmpMsg] = useState<string | null>(null);

    interface CheckerProps extends BoxProps {
        children: React.ReactNode;
        flattenItems: TreeItems;
        lineIndex: number;
        sx?: SxProps<Theme>;
    }
    const LineSyntaxChecker: FC<CheckerProps> = ({ flattenItems, lineIndex, ...props }) => {

        return (
            <Box>
                aaa
            </Box>
        );
    }
    const fetchLintResults = async () => {

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

            if (data.resultText == '') {
                execute();
            } else {
                setError(data.resultText);
            }

        } catch (err: any) {
            setError(err.message || 'An unexpected error occurred');
        } finally {
            setTmpMsg(null);
        }

    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setShouldRunEffect(true);
        }, 1000); // 1秒後に実行
        return () => clearTimeout(timer); // クリーンアップ
    }, [treeItems]);

    useEffect(() => {
        if (code) {
            fetchLintResults();
        }
        // handleExecute();
    }, [code]);

    useEffect(() => {
        if (shouldRunEffect) {
            const convertCode = async () => {
                setCode(await renderCode(treeItems));
            };
            setShouldRunEffect(false); // フラグをリセット
            setTmpMsg('コード解析中・・・');

            let result: ErrObj = { errors: [], hasError: false };
            flatten.map((item, index) => {
                const { hasError, errors } = checkDNCLSyntax(treeItems, item, index);
                if (hasError) {
                    result.hasError = true;
                    result.errors.push(...errors);
                }
            })

            if (!(result.hasError)) {
                convertCode();
            } else {
                setTmpMsg(null);
            }
        }
    }, [shouldRunEffect]);

    const execute = async () => {
        setError(null);

        try {
            // const response = await fetch('/api/lint', {
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
            setRunResults((prevResults) => (prevResults ? [...prevResults, data.result] : [data.result]));
        } catch (err: any) {
            setError(err.message);
        }
    };

    const flatten = flattenTree(treeItems);

    const renderCode = async (nodes: TreeItems): Promise<string> => {

        const renderCodeArray = await Promise.all(flatten.map(async (node, index) => {

            const content = await cnvToJs({ lineTokens: node.lineTokens ?? [], processIndex: Number(node.processIndex) });
            return content
        }));

        return renderCodeArray.join('\n');
    }

    const renderResults = (results: string[]): React.ReactNode => {
        const convertNewLinesToBreaks = (text: string) => {
            return text.split('\n').map((line, index) => (
                <Fragment key={index}>
                    {line}
                    <br />
                </Fragment>
            ));
        };
        return results.map((result, index) => (
            <Fragment key={index}>
                {index > 0 && <Divider />}
                <Box sx={{ paddingY: 0.2, paddingX: 1, height: 'auto' }}>
                    {convertNewLinesToBreaks(result)}
                </Box>
            </Fragment>
        ))
    }

    const resetRunResults = () => {
        setRunResults(null);
    }

    return (
        <Box sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            ...sx
        }} {...props} >
            <Grid className={`${styles.bgSlate900}`} sx={{
                color: 'white', paddingX: 1, paddingY: 0.5, flexBasis: '0%', display: 'flex'
            }} container justifyContent="space-between" alignItems="center">
                <Grid>
                    <Box>
                        コンソール
                    </Box>
                </Grid>
                <Grid>
                    <Box>
                        <Button variant="contained" startIcon={<ClearAllIcon sx={{ fontSize: '10px' }} />} sx={{ paddingLeft: '6px', paddingRight: '4px', paddingTop: '2px', paddingBottom: '2px', fontSize: '10px', backgroundColor: '#424242', color: 'white' }}
                            onClick={() => {
                                resetRunResults();
                            }}>
                            リセット
                        </Button>
                    </Box>
                </Grid>
            </Grid>
            <Box sx={{ flex: 1, height: '100%' }}>

                {tmpMsg && <Box sx={{ padding: 1 }}> {tmpMsg}</Box>}
                {error && <Box sx={{ padding: 1, color: 'red' }}>Error: {error}</Box>}

                <Box sx={{ height: '100%' }}>
                    <div style={{ height: 'calc(100% - 90px)', overflowY: 'auto' }}>
                        {runResults && renderResults(runResults)}
                    </div>
                </Box>

            </Box>
        </Box>
    );
};
