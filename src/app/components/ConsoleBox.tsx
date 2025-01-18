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
    const sameParentItems = items.filter(item => item.parentId == targetItem.parentId);
    const targetIndex = sameParentItems.findIndex(item => item.id == targetItem.id);
    const nextItem = targetIndex == sameParentItems.length ? null : sameParentItems[targetIndex + 1];
    const prevItem = targetIndex > 0 ? sameParentItems[targetIndex - 1] : null;
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
            break;

        case ProcessEnum.If: {
            //接続する要素が同じ深度・同じ親IDで次の要素
            const hasItem = nextItem?.processIndex == ProcessEnum.ElseIf || nextItem?.processIndex == ProcessEnum.Else || nextItem?.processIndex == ProcessEnum.EndIf;
            if (!hasItem || !nextItem) {
                result = { errors: [`${lineNum}行目:後続処理に「を実行し，そうでなければ」「を実行し，そうでなくもし<条件>ならば」「実行する」のいずれかを配置してください`], hasError: true };
            }
            break;
        }

        case ProcessEnum.ElseIf: {
            //開始要素が同じ深度・同じ親IDで前の要素
            let hasItem = prevItem?.processIndex == ProcessEnum.If || nextItem?.processIndex == ProcessEnum.ElseIf;;
            if (!hasItem || !prevItem) {
                result = { errors: [`${lineNum}行目:先行処理に「もし<条件>ならば」「を実行し，そうでなくもし<条件>ならば」のいずれかを配置してください`], hasError: true };
            }
            //接続する要素が同じ深度・同じ親IDで次の要素
            hasItem = nextItem?.processIndex == ProcessEnum.ElseIf || nextItem?.processIndex == ProcessEnum.Else || nextItem?.processIndex == ProcessEnum.EndIf;
            if (!hasItem || !nextItem) {
                result = { errors: [`${lineNum}行目:後続処理に「を実行し，そうでなければ」「を実行し，そうでなくもし<条件>ならば」「実行する」のいずれかを配置してください`], hasError: true };
            }
            break;
        }

        case ProcessEnum.Else: {
            //開始要素が同じ深度・同じ親IDで前の要素
            let hasItem = prevItem?.processIndex == ProcessEnum.If || nextItem?.processIndex == ProcessEnum.ElseIf;
            if (!hasItem || !prevItem) {
                result = { errors: [`${lineNum}行目:先行処理に「もし<条件>ならば」「を実行し，そうでなくもし<条件>ならば」のいずれかを配置してください`], hasError: true };
            }
            //接続する要素が同じ深度・同じ親IDで次の要素
            hasItem = nextItem?.processIndex == ProcessEnum.EndIf;
            if (!hasItem || !nextItem) {
                result = { errors: [`${lineNum}行目:後続処理に「実行する」がないか，配置に誤りがあります`], hasError: true };
            }
            break;
        }

        case ProcessEnum.EndIf: {
            //開始要素が同じ深度・同じ親IDで前の要素
            let hasItem = prevItem?.processIndex == ProcessEnum.If || nextItem?.processIndex == ProcessEnum.ElseIf || nextItem?.processIndex == ProcessEnum.Else;
            if (!hasItem || !prevItem) {
                result = { errors: [`${lineNum}行目:先行処理に「もし<条件>ならば」「を実行し，そうでなくもし<条件>ならば」「を実行し，そうでなければ」のいずれかを配置してください`], hasError: true };
            }
            break;
        }

        case ProcessEnum.While: {
            //終了要素が同じ深度・同じ親IDで次の要素
            const hasItem = nextItem?.processIndex == ProcessEnum.EndWhile;
            if (!hasItem || !nextItem) {
                result = { errors: [`${lineNum}行目:後続処理に「を繰り返す(前判定)」がないか，配置に誤りがあります`], hasError: true };
            }
            break;
        }

        case ProcessEnum.EndWhile: {
            //開始要素が同じ深度・同じ親IDで前の要素
            const hasItem = prevItem?.processIndex == ProcessEnum.While;
            if (!hasItem || !prevItem) {
                result = { errors: [`${lineNum}行目:先行処理に「<条件>の間」がないか，配置に誤りがあります`], hasError: true };
            }
            break;
        }

        case ProcessEnum.DoWhile:
            //終了要素が同じ深度・同じ親IDで次の要素
            const hasItem = nextItem?.processIndex == ProcessEnum.EndDoWhile;
            if (!hasItem || !nextItem) {
                result = { errors: [`${lineNum}行目:後続処理に「を,<条件>になるまで実行する」がないか，配置に誤りがあります`], hasError: true };
            }
            break;

        case ProcessEnum.EndDoWhile: {
            //開始要素が同じ深度・同じ親IDで前の要素
            const hasItem = prevItem?.processIndex == ProcessEnum.DoWhile;
            if (!hasItem || !prevItem) {
                result = { errors: [`${lineNum}行目:先行処理に「繰り返し，」がないか，配置に誤りがあります`], hasError: true };
            }
            break;
        }

        case ProcessEnum.ForIncrement:
        case ProcessEnum.ForDecrement: {
            //終了要素が同じ深度・同じ親IDで次の要素
            const hasItem = nextItem?.processIndex == ProcessEnum.EndFor;
            if (!hasItem || !nextItem) {
                result = { errors: [`${lineNum}行目:後続処理に「を繰り返す(順次繰り返し)」がないか，配置に誤りがあります`], hasError: true };
            }
            break;
        }
        case ProcessEnum.EndFor: {
            //開始要素が同じ深度・同じ親IDで前の要素
            const hasItem = prevItem?.processIndex == ProcessEnum.ForIncrement || prevItem?.processIndex == ProcessEnum.ForDecrement;
            if (!hasItem || !prevItem) {
                result = { errors: [`${lineNum}行目:先行処理に「順次繰り返しの開始」がないか，配置に誤りがあります`], hasError: true };
            }
            break;
        }

        case ProcessEnum.DefineFunction: {
            //終了要素が同じ深度・同じ親IDで次の要素
            const hasItem = nextItem?.processIndex == ProcessEnum.Defined;
            if (!hasItem || !nextItem) {
                result = { errors: [`${lineNum}行目:後続処理に「と定義する」がないか，配置に誤りがあります`], hasError: true };
            }
            break;
        }
        case ProcessEnum.Defined: {
            //開始要素が同じ深度・同じ親IDで前の要素
            const hasItem = prevItem?.processIndex == ProcessEnum.DefineFunction;
            if (!hasItem || !prevItem) {
                result = { errors: [`${lineNum}行目:先行処理に「関数の定義の開始」がないか，配置に誤りがあります`], hasError: true };
            }
            break;
        }

        case ProcessEnum.ExecuteUserDefinedFunction:

            //定義済みでなければならない
            //引数の括弧を除去して関数名のみ取得
            const token = targetItem.lineTokens && targetItem.lineTokens[0];
            if (!token) {
                result = { errors: [`${lineNum}行目:行を削除し，追加しなおしてください`], hasError: true };
                break;
            }
            const funcName = token.replace(/^([^()]+).*/, '$1');
            if (funcName == '') {
                result = { errors: [`${lineNum}行目:行を削除し，追加しなおしてください`], hasError: true };
                break;
            }

            const hasFuncItems = items.some(item => item.processIndex == ProcessEnum.DefineFunction && item.lineTokens ? item.lineTokens[0].replace(/^([^()]+).*/, '$1') : '' == funcName);

            if (!hasFuncItems) {
                result = { errors: [`${lineNum}行目:実行する関数を定義してください`], hasError: true };
                break;
            }
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
    error: 'var(--error)',
    warnning: 'var(--warnning)',
    darkgray: 'var(--darkgray)',
    white: 'white'
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

    const convertNewLinesToBreaks = (text: string) => {
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
        <Grid container direction="column" spacing={0} className={`${styles.bgSlate800} ${styles.colorWhite} ${styles.h100}`} sx={{
            ...sx
        }}>
            <Grid size="auto" className={`${styles.bgSlate900} ${styles.w100}`} sx={{
                paddingX: 1, paddingY: 0.5, flexBasis: '0%'
            }} container direction="row" justifyContent="space-between" alignItems="center">
                <Grid>
                    <Box>
                        コンソール
                    </Box>
                </Grid>
                <Grid>
                    <Box>
                        <Button variant="contained" startIcon={<ClearAllIcon sx={{ fontSize: '10px' }} />} sx={{ paddingLeft: '6px', paddingRight: '4px', paddingTop: '2px', paddingBottom: '2px', fontSize: '10px', backgroundColor: Color.darkgray, color: Color.white }}
                            onClick={() => {
                                resetRunResults();
                            }}>
                            リセット
                        </Button>
                    </Box>
                </Grid>
            </Grid>
            <Grid size="grow" container direction="column">
                <div style={{ height: '100%', overflow: 'auto' }}>

                    {/* {tmpMsg && <Grid className={`${styles.w100}`} size="auto" sx={{ padding: 1 }}> {tmpMsg}</Grid>}
                    {(error) && <Grid className={`${styles.w100}`} size="auto" sx={{ padding: 1, color: error.color }}>エラー
                        <Box>
                            {convertNewLinesToBreaks(error.msg)}
                        </Box>
                    </Grid>
                    } */}
                    <div className={`${styles.w100}`} style={{ backgroundColor: 'red', flexBasis: '0%' }}>エラー
                        <Box>
                            いいいいいいいいいいいいいいいいいいいいいいいいいい
                        </Box>
                    </div>
                    <div className={`${styles.w100}`} style={{ backgroundColor: 'yellow', flexGrow: 1 }}>ああああいいいいうううう
                        <Box>
                            えええええええ
                        </Box>
                    </div>
                    <div className={`${styles.w100}`} style={{ backgroundColor: 'aqua', flexBasis: '0%' }}>エラー
                        <Box>
                            おおおおおおおおおおおおおおおおおおおおおおおおおおおううううううううううううううううううううううううううううううううううううううううううううううううううう
                        </Box>
                    </div>
                </div>
                {/* {runResults && renderResults(runResults)} */}
            </Grid>
        </Grid>
    );
};
