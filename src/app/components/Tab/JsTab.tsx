import { Box, BoxProps } from "@mui/material";
import React, { FC, Fragment, useMemo, useCallback, useState, useEffect } from 'react';
import { TreeItems } from "@/app/types";
import { BraketSymbolEnum, SimpleAssignmentOperator, ProcessEnum, UserDefinedFunc, OutputEnum, ConditionEnum, ComparisonOperator, LoopEnum, ArithmeticOperator } from "@/app/enum";
import { cnvToDivision, cnvToRomaji, containsJapanese, tryParseToJsFunction } from "@/app/utilities";
import { ScopeBox } from "@/app/components/Tab";
import styles from './tab.module.css';
import { TreeItem } from "@/app/types";
import { cnvToJs } from "@/app/utilities/cnvToJs";

const jsConversionCache = new Map<string, React.ReactNode>();

interface CustomBoxProps extends BoxProps {
    children: React.ReactNode;
    treeItems: TreeItems;
}

const cnvToken = (token: string): string => {
    token = cnvToDivision(token);
    const { convertedStr } = tryParseToJsFunction(token);
    return convertedStr;
}

// JsTabコンポーネントをReact.memoでラップ
export const JsTab: FC<CustomBoxProps> = React.memo(({ treeItems, children, sx, ...props }) => {
    const [nodes, setNodes] = useState<React.ReactNode>(children);

    // treeItemsのハッシュを作成（変更検出用）
    const treeItemsHash = useMemo(() => {
        return JSON.stringify(treeItems);
    }, [treeItems]);

    // renderNodes関数を最適化
    const renderNodes = useCallback(async (nodes: TreeItems, depth: number): Promise<React.ReactNode> => {
        const promises = nodes.map(async (node: TreeItem, index: number) => {
            // キャッシュキーを作成
            const nodeKey = `${node.id}-${JSON.stringify(node.lineTokens)}-${node.processIndex}-${node.isConstant}`;

            let convertedJs;
            if (jsConversionCache.has(nodeKey)) {
                convertedJs = jsConversionCache.get(nodeKey);
            } else {
                convertedJs = await cnvToJs({
                    lineTokens: node.lineTokens ?? [],
                    processIndex: Number(node.processIndex),
                    isConstant: node.isConstant
                }, "romaji");
                jsConversionCache.set(nodeKey, convertedJs);
            }

            return (
                <Fragment key={node.id}>
                    <Box className={(index === 0 && depth !== 0) ? styles.noCounter : ''}>
                        {convertedJs}
                    </Box>
                    {node.children.length > 0 && (
                        <ScopeBox nested={true} depth={depth + 1}>
                            {await renderNodes(node.children, depth + 1)}
                        </ScopeBox>
                    )}
                </Fragment>
            );
        });

        return Promise.all(promises);
    }, []); // 依存配列を空に

    // コード変換処理を最適化
    const convertedCode = useMemo(() => {
        let isCanceled = false;

        const convertAsync = async () => {
            if (jsConversionCache.has(treeItemsHash)) {
                const cached = jsConversionCache.get(treeItemsHash);
                if (!isCanceled) setNodes(cached);
                return;
            }

            if (!isCanceled) setNodes("変換中");

            // 少し遅延を入れて変換中表示を確実に出す
            await new Promise(resolve => setTimeout(resolve, 100));

            if (!isCanceled) {
                const result = await renderNodes(treeItems, 0);
                jsConversionCache.set(treeItemsHash, result);
                setNodes(result);
            }
        };

        convertAsync();

        return () => {
            isCanceled = true;
        };
    }, [treeItemsHash, renderNodes]);

    return (
        <Box className={styles.codeContainer} sx={{ ...sx }} {...props}>
            {nodes}
        </Box>
    );
}, (prevProps, nextProps) => {
    // カスタム比較関数
    return JSON.stringify(prevProps.treeItems) === JSON.stringify(nextProps.treeItems) &&
        JSON.stringify(prevProps.sx) === JSON.stringify(nextProps.sx);
});