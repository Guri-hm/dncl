import { FC, useEffect, useState } from 'react';
import { parseCode, generateFlowchartXML, flattenTree } from '../utilities';
import { Box, BoxProps, Button } from '@mui/material';
import { TreeItems } from '../types';
import { cnvToJs } from './ConsoleTab';

interface CustomBoxProps extends BoxProps {
  children: React.ReactNode;
  treeItems: TreeItems;
}

export const FlowTab: FC<CustomBoxProps> = ({ treeItems, children, sx, ...props }) => {

  const [shouldRunEffect, setShouldRunEffect] = useState(false);
  const [nodes, setNodes] = useState<React.ReactNode>(children);

  useEffect(() => {
    setNodes("変換中");
    const timer = setTimeout(() => {
      setShouldRunEffect(true);
    }, 1000); // 1秒後に実行
    return () => clearTimeout(timer); // クリーンアップ
  }, [treeItems]);

  const renderCode = async (nodes: TreeItems): Promise<string> => {
    const flatten = flattenTree(nodes);

    const renderCodeArray = await Promise.all(flatten.map(async (node, index) => {

      const content = await cnvToJs({ lineTokens: node.lineTokens ?? [], processIndex: Number(node.processIndex) });
      return content
    }));
    return renderCodeArray.join('\n');
  }

  useEffect(() => {
    if (shouldRunEffect) {
      const convertCode = async () => {
        const jsCode = await renderCode(treeItems);
        fetchLintResults(jsCode);
      };
      setShouldRunEffect(false);
      convertCode();
    };
  }, [shouldRunEffect]);

  const fetchLintResults = async (code: string) => {

    if (!code || code == '') {
      setNodes("");

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
        generateFlowchart(code);
      } else {
        setNodes("プログラムに誤りがあります");
      }

    } catch (err: any) {
    } finally {

    }

  };

  const generateFlowchart = (code: string) => {

    const ast = parseCode(code);
    console.log(ast)

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
      "dark-mode": "auto",
      edit: "_blank",
      xml: mxfile
    });

    const handleCopyXML = () => {
      navigator.clipboard.writeText(flowchartXml);
      alert("クリップボードにコピーしました");
    }

    const flowChartNodes = <>
      <Box className="mxgraph" sx={{ maxWidth: '100%', backgroundColor: 'var(--stone-50)' }} data-mxgraph={dataMxgraph}></Box><Box sx={{ textAlign: 'center', paddingY: 1 }}>
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

    setNodes(flowChartNodes);

    const script = document.createElement('script');
    script.src = 'https://viewer.diagrams.net/js/viewer-static.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  };


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
  return (
    <>
      {nodes}
    </>
  );
}
