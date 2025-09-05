import { Box, BoxProps } from "@mui/material";
import React, { FC, Fragment, useMemo, useCallback, useState, useEffect } from 'react';
import { TreeItems } from "@/app/types";
import { cnvToDivision, tryParseToJsFunction } from "@/app/utilities";
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
    const [isConverting, setIsConverting] = useState(false);

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
    }, []);

    // useEffectで非同期処理を実行
    useEffect(() => {
        let isCanceled = false;

        const convertAsync = async () => {
            // キャッシュチェック
            if (jsConversionCache.has(treeItemsHash)) {
                const cached = jsConversionCache.get(treeItemsHash);
                if (!isCanceled) {
                    setNodes(cached);
                    setIsConverting(false);
                }
                return;
            }

            // 変換開始
            if (!isCanceled) {
                setIsConverting(true);
                setNodes("変換中...");
            }

            try {
                // 少し遅延を入れて変換中表示を確実に出す
                await new Promise(resolve => setTimeout(resolve, 100));

                if (!isCanceled) {
                    const result = await renderNodes(treeItems, 0);
                    jsConversionCache.set(treeItemsHash, result);
                    setNodes(result);
                    setIsConverting(false);
                }
            } catch (error) {
                if (!isCanceled) {
                    console.error('JS conversion error:', error);
                    setNodes("変換エラーが発生しました");
                    setIsConverting(false);
                }
            }
        };

        convertAsync();

        // クリーンアップ関数
        return () => {
            isCanceled = true;
        };
    }, [treeItemsHash, renderNodes, treeItems]);

    return (
        <Box className={styles.codeContainer} sx={{ ...sx }} {...props}>
            {isConverting ? (
                <Box display="flex" alignItems="center" justifyContent="center" p={2}>
                    JavaScriptコードに変換中...
                </Box>
            ) : (
                nodes
            )}
        </Box>
    );
}, (prevProps, nextProps) => {
    // カスタム比較関数
    return JSON.stringify(prevProps.treeItems) === JSON.stringify(nextProps.treeItems) &&
        JSON.stringify(prevProps.sx) === JSON.stringify(nextProps.sx);
});

JsTab.displayName = 'JsTab';