import { FC, useCallback, useEffect, useMemo, useState } from 'react';
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
  const [nodes, setNodes] = useState<React.ReactNode>("変換中");
  const theme = useTheme();
  const isDark = theme.palette.mode === 'dark';
  const darkModeValue = isDark ? "dark" : "light";

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

  const handleDownloadSVG = useCallback(() => {
    const svgElement = document.querySelector('.mxgraph svg');
    if (!svgElement) {
      alert('SVGファイルが見つかりません');
      return;
    }
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
  }, []);

  // フローチャートノードを返す関数に修正
  const generateFlowchart = useCallback((code: string): React.ReactNode => {
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

    return (
      <>
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
      </>
    );
  }, [isDark, darkModeValue, handleDownloadSVG]);

  const fetchLintResults = useCallback(async (code: string) => {
    if (!code || code === '') {
      setNodes("");
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
        // フローチャートノードを生成してセット＆キャッシュ
        const flowChartNodes = generateFlowchart(code);
        setNodes(flowChartNodes);
        flowConversionCache.set(treeItemsHash, flowChartNodes);

        // スクリプト追加
        const script = document.createElement('script');
        script.src = 'https://viewer.diagrams.net/js/viewer-static.min.js';
        script.async = true;
        document.body.appendChild(script);

        // クリーンアップ
        setTimeout(() => {
          if (document.body.contains(script)) {
            document.body.removeChild(script);
          }
        }, 1000);
      } else {
        setNodes("プログラムに誤りがあります");
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        console.error(err.message);
      } else {
        console.error('Unexpected error', err);
      }
    }
  }, [generateFlowchart, treeItemsHash]);

  useEffect(() => {
    let isCanceled = false;

    const convertAsync = async () => {
      if (flowConversionCache.has(treeItemsHash)) {
        const cached = flowConversionCache.get(treeItemsHash);
        if (!isCanceled) {
          setNodes(cached);
        }
        return;
      }

      if (!isCanceled) {
        setNodes("変換中");
      }

      await new Promise(resolve => setTimeout(resolve, 100));

      if (!isCanceled) {
        const jsCode = await renderCode(treeItems);
        const flowChartNodes = generateFlowchart(jsCode);
        setNodes(flowChartNodes);
        flowConversionCache.set(treeItemsHash, flowChartNodes);
      }
    };

    convertAsync();

    return () => {
      isCanceled = true;
    };
  }, [treeItemsHash, renderCode, fetchLintResults, treeItems]);

  // mxGraphスクリプトの追加・削除をnodesがフローチャートノードの時だけ行う
  useEffect(() => {
    // mxgraphクラスが存在する場合のみスクリプト追加
    if (typeof window !== "undefined" && document.querySelector('.mxgraph')) {
      const script = document.createElement('script');
      script.src = 'https://viewer.diagrams.net/js/viewer-static.min.js';
      script.async = true;
      document.body.appendChild(script);

      return () => {
        if (document.body.contains(script)) {
          document.body.removeChild(script);
        }
      };
    }
  }, [nodes]);

  return (
    <>
      {nodes}
    </>
  );
}, (prevProps, nextProps) => {
  return JSON.stringify(prevProps.treeItems) === JSON.stringify(nextProps.treeItems) &&
    JSON.stringify(prevProps.sx) === JSON.stringify(nextProps.sx);
});