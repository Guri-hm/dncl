import React, { Dispatch, SetStateAction, useCallback, useMemo } from 'react';
import { Box, BoxProps } from "@mui/material";
import { useEffect, useState, Fragment } from "react";
import { DnclValidationType, FlattenedItem, TreeItems } from "@/app/types";
import { BraketSymbolEnum, SimpleAssignmentOperator, ProcessEnum, UserDefinedFunc, OutputEnum, ConditionEnum, ComparisonOperator, LoopEnum, ArithmeticOperator } from "@/app/enum";
import { checkDNCLSyntax, cnvToDivision, containsJapanese, flattenTree, tryParseToJsFunction } from "@/app/utilities";
import Divider from '@mui/material/Divider';
import { cnvToJs } from "@/app/utilities/cnvToJs";

interface CustomBoxProps extends BoxProps {
    children?: React.ReactNode;
    treeItems: TreeItems;
    runResults: string[];
    setRunResults: Dispatch<SetStateAction<string[]>>;
    dnclValidation: DnclValidationType | null,
    setDnclValidation: (validation: DnclValidationType | null) => void;
}

const apiBaseUrl = (() => {
    // 強制的に本番APIを使用するフラグ
    const useProdApi = process.env.NEXT_PUBLIC_USE_PROD_API === 'true';

    if (useProdApi) {
        return 'https://solopg.com/next/dncl';
    }
    // 開発環境では相対パス
    if (process.env.NODE_ENV === 'development') {
        return process.env.NEXT_PUBLIC_BASE_PATH || '';
    }
    // 本番環境では絶対URL
    return process.env.NEXT_PUBLIC_API_BASE_URL || 'https://solopg.com/next/dncl';
})();

// グローバルキャッシュ
const codeConversionCache = new Map<string, string>();
const lintCache = new Map<string, { lineNumbers: number[], messages: string[] }>();
const executionCache = new Map<string, { result?: string, error?: string }>();

// cnvToJsをメモ化
const cnvToJsMemoized = (() => {
    const cache = new Map<string, string>();

    return async (statement: { lineTokens: string[], processIndex: number, isConstant?: boolean }): Promise<string> => {
        const cacheKey = JSON.stringify(statement);

        if (cache.has(cacheKey)) {
            return cache.get(cacheKey)!;
        }

        const result = await cnvToJs(statement, "hex");
        cache.set(cacheKey, result);
        return result;
    };
})();

const Color = {
    error: 'var(--error)',
    warnning: 'var(--warnning)',
    darkgray: 'var(--darkgray)',
    white: 'white'
}

export const ConsoleTab: React.FC<CustomBoxProps> = React.memo(({
    treeItems,
    runResults,
    setRunResults,
    setDnclValidation,
    dnclValidation
}) => {
    const [shouldRunEffect, setShouldRunEffect] = useState(false);
    const [tmpMsg, setTmpMsg] = useState<string>('ここに出力結果が表示されます');

    // treeItemsのハッシュ化で差分検出
    const treeItemsHash = useMemo(() => {
        return JSON.stringify(treeItems);
    }, [treeItems]);

    // 実行処理の最適化（キャッシュ付き）
    const execute = useCallback(async (code: string) => {
        setDnclValidation(null);

        // 実行結果のキャッシュチェック
        if (executionCache.has(code)) {
            const cached = executionCache.get(code)!;
            if (cached.result) {
                setRunResults((prevResults: string[]) => (
                    prevResults ? [...prevResults, cached.result!] : [cached.result!]
                ));
            } else if (cached.error) {
                const result: DnclValidationType = {
                    color: Color.error,
                    errors: [cached.error],
                    hasError: true,
                    lineNum: []
                };
                setDnclValidation(result);
            }
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/execute`, {
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

            // 成功結果をキャッシュ
            executionCache.set(code, { result: data.result });

            if (data.result != '') {
                setRunResults((prevResults: string[]) => (
                    prevResults ? [...prevResults, data.result] : [data.result]
                ));
            }
        } catch (err: unknown) {
            const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';

            // エラー結果をキャッシュ
            executionCache.set(code, { error: errorMessage });

            const result: DnclValidationType = {
                color: Color.error,
                errors: [errorMessage],
                hasError: true,
                lineNum: []
            };
            setDnclValidation(result);
        }
    }, [setDnclValidation, setRunResults]);

    // Lint処理の最適化（キャッシュ付き）
    const fetchLintResults = useCallback(async (code: string) => {
        if (!code || code === '') {
            setTmpMsg('');
            return;
        }

        // Lintキャッシュチェック
        if (lintCache.has(code)) {
            const cached = lintCache.get(code)!;

            if (cached.messages.length === 0) {
                setTmpMsg('プログラム実行中…');
                await execute(code);
                setTmpMsg('');
            } else {
                const formattedMessages = cached.lineNumbers.map((lineNumber: number, index: number) => {
                    return `${lineNumber}行目：${cached.messages[index]}`;
                });
                const result: DnclValidationType = {
                    color: Color.warnning,
                    errors: formattedMessages,
                    hasError: true,
                    lineNum: cached.lineNumbers
                };
                setDnclValidation(result);
                setTmpMsg('');
            }
            return;
        }

        try {
            const response = await fetch(`${apiBaseUrl}/api/lint`, {
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

            // Lint結果をキャッシュ
            lintCache.set(code, { lineNumbers: data.lineNumbers, messages: data.messages });

            if (data.messages.length === 0) {
                setTmpMsg('プログラム実行中…');
                await execute(code);
                setTmpMsg('');
            } else {
                const formattedMessages = data.lineNumbers.map((lineNumber: number, index: number) => {
                    return `${lineNumber}行目：${data.messages[index]}`;
                });
                const result: DnclValidationType = {
                    color: Color.warnning,
                    errors: formattedMessages,
                    hasError: true,
                    lineNum: data.lineNumbers
                };
                setDnclValidation(result);
                setTmpMsg('');
            }
        } catch (err: unknown) {
            const result: DnclValidationType = {
                color: Color.error,
                errors: [err instanceof Error ? err.message : 'An unexpected error occurred'],
                hasError: true,
                lineNum: []
            };
            setDnclValidation(result);
            setTmpMsg('');
        }
    }, [execute, setDnclValidation]);

    // コード変換処理の最適化（キャッシュ付き）
    const renderCode = useCallback(async (nodes: TreeItems): Promise<string> => {
        // コード変換キャッシュチェック
        if (codeConversionCache.has(treeItemsHash)) {
            return codeConversionCache.get(treeItemsHash)!;
        }

        const flatten = flattenTree(nodes);

        const renderCodeArray = await Promise.all(flatten.map(async (node, index) => {
            return await cnvToJsMemoized({
                lineTokens: node.lineTokens ?? [],
                processIndex: Number(node.processIndex),
                isConstant: node.isConstant
            });
        }));

        const result = renderCodeArray.join('\n');

        // 結果をキャッシュ
        codeConversionCache.set(treeItemsHash, result);

        return result;
    }, [treeItemsHash]);

    // DNCL構文チェックの最適化
    const validateDNCLSyntax = useMemo(() => {
        const result: DnclValidationType = { errors: [], hasError: false, lineNum: [] };
        const flatten = flattenTree(treeItems);

        flatten.forEach((item: FlattenedItem, index) => {
            const { hasError, errors } = checkDNCLSyntax(flatten, item, index + 1);
            if (hasError) {
                result.hasError = true;
                result.errors.push(...errors);
                result.lineNum.push(index + 1);
            }
        });

        return result;
    }, [treeItems]);

    useEffect(() => {
        setTmpMsg("DNCL解析中…");
        setDnclValidation(null);

        // タイマーを短縮（2秒→500ms）
        const timer = setTimeout(() => {
            setShouldRunEffect(true);
        }, 500);

        return () => clearTimeout(timer);
    }, [treeItemsHash, setDnclValidation]);

    useEffect(() => {
        if (shouldRunEffect) {
            setShouldRunEffect(false);

            setDnclValidation(validateDNCLSyntax);

            if (validateDNCLSyntax.hasError) {
                setTmpMsg('');
                return;
            }

            const convertCode = async () => {
                const code = await renderCode(treeItems);
                await fetchLintResults(code); // <- awaitを追加
                setTmpMsg('');
            };

            convertCode();
        }
    }, [shouldRunEffect, fetchLintResults, renderCode, setDnclValidation, validateDNCLSyntax, treeItems]);

    // レンダリング関数の最適化
    const convertNewLinesToBreaks = useCallback((text: string | null) => {
        if (!text) return null;

        return text.split('\n').map((line, index) => (
            <Fragment key={index}>
                {line}
                <br />
            </Fragment>
        ));
    }, []);

    const renderResults = useCallback((results: string[]): React.ReactNode => {
        return results.map((result, index) => (
            <Fragment key={index}>
                {index > 0 && <Divider sx={{ borderColor: 'var(--slate-500)' }} />}
                <Box sx={{ paddingY: 0.2, paddingX: 1 }}>
                    {convertNewLinesToBreaks(result)}
                </Box>
            </Fragment>
        ));
    }, [convertNewLinesToBreaks]);

    return (
        <Box>
            {tmpMsg && <Box sx={{ padding: 1 }}> {tmpMsg}</Box>}
            {(dnclValidation?.hasError) && (
                <Box sx={{ padding: 1, color: dnclValidation?.color || Color.warnning }}>
                    エラーを解決してください
                    <Box>
                        {dnclValidation?.errors ? convertNewLinesToBreaks(dnclValidation?.errors.join('\n')) : ''}
                    </Box>
                </Box>
            )}
            <Box>
                {runResults && renderResults(runResults)}
            </Box>
        </Box>
    );
}, (prevProps, nextProps) => {
    // メモ化の比較関数
    return (
        JSON.stringify(prevProps.treeItems) === JSON.stringify(nextProps.treeItems) &&
        JSON.stringify(prevProps.runResults) === JSON.stringify(nextProps.runResults) &&
        prevProps.dnclValidation === nextProps.dnclValidation
    );
});

ConsoleTab.displayName = 'ConsoleTab';