import { Box, BoxProps, Button } from "@mui/material";
import { FC, useEffect, useState, Fragment, ReactElement } from "react";
import { FlattenedItem, TreeItem, TreeItems } from "../types";
import { BraketSymbolEnum, SimpleAssignmentOperator, ProcessEnum, UserDefinedFunc, OutputEnum, ConditionEnum, ComparisonOperator, LoopEnum, ArithmeticOperator } from "../enum";
import { cnvToDivision, cnvToRomaji, containsJapanese, flattenTree, getEnumIndex, tryParseToJsFunction } from "../utilities";
import { SxProps, Theme } from '@mui/material';
import { ErrObj } from "../types";
import Divider from '@mui/material/Divider';
import Grid from '@mui/material/Grid2';
import styles from '@/app/components/common.module.css';
import ClearAllIcon from '@mui/icons-material/ClearAll';

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

const checkDNCLSyntax = (items: FlattenedItem[], targetItem: FlattenedItem, lineNum: number): ErrObj => {

    const processIndex = targetItem.processIndex;

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
            break;

        case ProcessEnum.DoWhile:

            break;

        case ProcessEnum.EndDoWhile:
            break;

        case ProcessEnum.ForIncrement:
        case ProcessEnum.ForDecrement:
            break;

        case ProcessEnum.DefineFunction:
        case ProcessEnum.Defined:

            //対応するitemと同数になる必要がある
            const sameProcessItems = items.filter(item => item.parentId == targetItem.parentId && item.depth == targetItem.depth && item.processIndex == ProcessEnum.DefineFunction);
            const correspondingItems = items.filter(item => item.parentId == targetItem.parentId && item.depth == targetItem.depth && item.processIndex == ProcessEnum.Defined);
            if (sameProcessItems.length != correspondingItems.length) {
                result = { errors: [`${lineNum}行目:「新しい関数の定義」または「と定義する」に過不足があります`], hasError: true };
            }

            switch (processIndex) {
                case ProcessEnum.DefineFunction: {
                    //終了タグが同じ深度・同じ親IDである必要がある
                    const hasItem = items.some(item => item.parentId == targetItem.parentId && item.
                        depth == targetItem.depth && item.processIndex == ProcessEnum.Defined);
                    if (!hasItem) {
                        result = { errors: [`${lineNum}行目:対応する「と定義する」がないか，インデントに誤りがあります`], hasError: true };
                    }
                    break;
                }
                case ProcessEnum.Defined: {
                    //終了タグが同じ深度・同じ親IDである必要がある
                    const hasItem = items.some(item => item.parentId == targetItem.parentId && item.
                        depth == targetItem.depth && item.processIndex == ProcessEnum.DefineFunction);
                    if (!hasItem) {
                        result = { errors: [`${lineNum}行目:対応する「新しい関数の定義」がないか，インデントに誤りがあります`], hasError: true };
                    }
                    break;
                }
            }

            break;

        case ProcessEnum.Defined: {

            //対応するitemと同数になる必要がある
            const sameProcessItems = items.filter(item => item.parentId == targetItem.parentId && item.depth == targetItem.depth && item.processIndex == ProcessEnum.DefineFunction);
            const correspondingItems = items.filter(item => item.parentId == targetItem.parentId && item.depth == targetItem.depth && item.processIndex == ProcessEnum.Defined);
            if (sameProcessItems.length != correspondingItems.length) {
                result = { errors: [`「新しい関数の定義」または「と定義する」に過不足があります`], hasError: true };
            }

            //終了タグが同じ深度・同じ親IDである必要がある
            const hasItem = items.some(item => item.parentId == targetItem.parentId && item.
                depth == targetItem.depth && item.processIndex == ProcessEnum.Defined);
            if (!hasItem) {
                result = { errors: [`${lineNum}行目:対応する「と定義する」がないか，インデントに誤りがあります`], hasError: true };
            }


            break;
        }
        case ProcessEnum.ExecuteUserDefinedFunction:


            break;

        default:
            break;

    }

    return result;
}

type Err = {
    msg: string,
    color: string
}
const Color = {
    error: '#FF4500',
    warnning: '#FFFF00'
}

export const ConsoleBox: FC<CustomBoxProps> = ({ treeItems, children, sx, ...props }) => {

    const [shouldRunEffect, setShouldRunEffect] = useState(false);
    const [code, setCode] = useState('');
    const [runResults, setRunResults] = useState<string[] | null>(null);
    const [error, setError] = useState<Err | null>(null);
    const [tmpMsg, setTmpMsg] = useState<string | null>(null);

    interface CheckerProps extends BoxProps {
        children: React.ReactNode;
        flattenItems: TreeItems;
        lineIndex: number;
        sx?: SxProps<Theme>;
    }

    const flatten = flattenTree(treeItems);

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
                setError({ color: Color.warnning, msg: data.resultText });
            }

        } catch (err: any) {
            setError({ color: Color.error, msg: err.message || 'An unexpected error occurred' });
        } finally {
        }

    };

    useEffect(() => {
        console.log(flatten)
        const timer = setTimeout(() => {
            setTmpMsg('コード解析中・・・');
            setShouldRunEffect(true);
        }, 1000); // 1秒後に実行
        return () => clearTimeout(timer); // クリーンアップ
    }, [treeItems]);

    useEffect(() => {
        if (code) {
            fetchLintResults();
        }
    }, [code]);

    useEffect(() => {
        if (shouldRunEffect) {
            setError(null);
            const convertCode = async () => {
                setCode(await renderCode(treeItems));
            };
            setShouldRunEffect(false); // フラグをリセット

            let result: ErrObj = { errors: [], hasError: false };
            flatten.map((item: FlattenedItem, index) => {
                const { hasError, errors } = checkDNCLSyntax(flatten, item, index + 1);
                if (hasError) {
                    result.hasError = true;
                    result.errors.push(...errors);
                }
            })

            setTmpMsg(null);
            if (!(result.hasError)) {
                convertCode();
            } else {
                setError({ color: Color.warnning, msg: result.errors.join('\n') });
            }
        }
    }, [shouldRunEffect]);

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
            setRunResults((prevResults) => (prevResults ? [...prevResults, data.result] : [data.result]));
        } catch (err: any) {
            setError({ color: Color.error, msg: err.message || 'An unexpected error occurred' });
        }
    };

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
                {index > 0 && <Divider sx={{ borderColor: 'white' }} />}
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
        <Box className={`${styles.bgSlate800} ${styles.colorWhite}`} sx={{
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            ...sx
        }} {...props} >
            <Grid className={`${styles.bgSlate900}`} sx={{
                paddingX: 1, paddingY: 0.5, flexBasis: '0%', display: 'flex'
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
                {error && <Box sx={{ padding: 1, color: error.color }}>エラー {error.msg}</Box>}

                <Box className={`${styles.overflowAuto}`} style={{ height: 'calc(100% - 120px)' }}>
                    {runResults && renderResults(runResults)}
                </Box>

            </Box>
        </Box>
    );
};
