import { FC, useCallback, useEffect, useMemo, useState, useRef } from 'react';
import { parseCode, generateFlowchartXML, flattenTree } from '@/app/utilities';
import { Box, BoxProps, Button } from '@mui/material';
import { TreeItem, TreeItems } from '@/app/types';
import { cnvToJs } from '@/app/utilities/cnvToJs';
import { useTheme } from '@mui/material/styles';
import React from 'react';

const flowConversionCache = new Map<string, React.ReactNode>();

interface CustomBoxProps extends BoxProps {
  children: React.ReactNode;
  treeItems: TreeItems;
}
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';

export const FlowTab: FC<CustomBoxProps> = React.memo(({ treeItems, children, sx, ...props }) => {
  const [nodes, setNodes] = useState<React.ReactNode>(children);
  const isMountedRef = useRef<boolean>(false);
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const darkModeValue = isDark ? "dark" : "light";

  // マウント状態を追跡
  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // treeItemsのハッシュを作成（変更検出用）
  const treeItemsHash = useMemo(() => {
    return JSON.stringify(treeItems);
  }, [treeItems]);

  const renderCode = useCallback(async (nodes: TreeItems): Promise<string> => {
    const flatten = flattenTree(nodes);
    const renderCodeArray = await Promise.all(
      flatten.map(async (node: TreeItem, index: number) => {
        const content = await cnvToJs({ lineTokens: node.lineTokens ?? [], processIndex: Number(node.processIndex) });
        return content;
      })
    );
    return renderCodeArray.join('\n');
  }, []);

  const generateFlowchart = useCallback((code: string) => {
    const ast = parseCode(code);
    const flowchartXml = generateFlowchartXML(ast);
    const mxfile = `
    <mxfile host="app.diagrams.net" agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0" version="26.0.11">
          <diagram name="ページ1" id="-Ry5r97N3-jTHmX2WoBb">
          ${flowchartXml}
          </diagram>
          </mxfile>
          `;

    const dataMxgraph = JSON.stringify({
      highlight: "#0000ff",
      lightbox: false,
      nav: true,
      "dark-mode": darkModeValue,
      edit: "_blank",
      xml: mxfile
    });

    const handleCopyXML = () => {
      navigator.clipboard.writeText(flowchartXml);
      alert("クリップボードにコピーしました");
    };

    const flowChartNodes = <>
      <Box className="mxgraph" sx={{ maxWidth: '100%', backgroundColor: isDark ? 'transparent' : 'var(--stone-50)' }} data-mxgraph={dataMxgraph}></Box>
      <Box sx={{ textAlign: 'center', paddingY: 1 }}>
        <Button
          sx={{ backgroundColor: 'var(--stone-50)', margin: '0.5rem', color: 'var(--foreground)', textTransform: "none" }}
          onClick={handleCopyXML}
          variant="contained"
        >
          mxGraphModelのコピー
        </Button>
        <Button
          sx={{ backgroundColor: 'var(--stone-50)', margin: '0.5rem', color: 'var(--foreground)', textTransform: "none" }}
          onClick={handleDownloadSVG}
          variant="contained"
        >
          SVGをダウンロード
        </Button>
      </Box>
    </>;

    if (isMountedRef.current) {
      setNodes(flowChartNodes);
    }

    const script = document.createElement('script');
    script.src = 'https://viewer.diagrams.net/js/viewer-static.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [isDark, darkModeValue]);

  const handleDownloadSVG = () => {
    // mxgraphクラスの要素を取得
    const svgElement = document.querySelector('.mxgraph svg');
    if (!svgElement) {
      alert('SVGファイルが見つかりません');
      return;
    }

    // SVGの内容を取得してBlobを作成
    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svgElement);

    const svgBlob = new Blob([svgString], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);

    const a = document.createElement('a');
    a.href = url;
    a.download = 'flowchart.svg';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }

  const fetchLintResults = useCallback(async (code: string) => {
    if (!code || code === '') {
      if (isMountedRef.current) setNodes("");
      return;
    }

    try {
      const response = await fetch(`${basePath}/api/lint`, {
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

      if (data.messages.length === 0) {
        generateFlowchart(code);
      } else {
        if (isMountedRef.current) setNodes("プログラムに誤りがあります");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('Unexpected error', err);
      }
    } finally {
    }
  }, [generateFlowchart]);

  // コード変換処理をuseEffectに移動
  useEffect(() => {
    const convertAsync = async () => {
      if (!isMountedRef.current) return;

      if (flowConversionCache.has(treeItemsHash)) {
        const cached = flowConversionCache.get(treeItemsHash);
        if (isMountedRef.current) setNodes(cached);
        return;
      }

      if (isMountedRef.current) setNodes("変換中");

      // 少し遅延を入れて変換中表示を確実に出す
      await new Promise(resolve => setTimeout(resolve, 100));

      if (isMountedRef.current) {
        const jsCode = await renderCode(treeItems);
        await fetchLintResults(jsCode);
      }
    };

    convertAsync();
  }, [treeItemsHash, renderCode, fetchLintResults, treeItems]);

  return (
    <>
      {nodes}
    </>
  );
}, (prevProps, nextProps) => {
  // カスタム比較関数
  return JSON.stringify(prevProps.treeItems) === JSON.stringify(nextProps.treeItems) &&
    JSON.stringify(prevProps.sx) === JSON.stringify(nextProps.sx);
});
FlowTab.displayName = 'FlowTab';