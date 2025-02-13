import { FC, useEffect, useRef, useState } from 'react';
import { parseCode, generateFlowchartXML, flattenTree } from '../utilities';
import { BoxProps } from '@mui/material';
import { TreeItems } from '../types';
import { cnvToJs } from './ConsoleTab';

interface CustomBoxProps extends BoxProps {
  children: React.ReactNode;
  treeItems: TreeItems;
}

export const FlowTab: FC<CustomBoxProps> = ({ treeItems, children, sx, ...props }) => {
  const iframeRef = useRef(null);

  const [xml, setXml] = useState('');
  const [shouldRunEffect, setShouldRunEffect] = useState(false);
  const [nodes, setNodes] = useState<React.ReactNode>(children);
  const [code, setCode] = useState<string>('');

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
        setCode(jsCode)
      };
      setShouldRunEffect(false); // フラグをリセット
      convertCode();
    };
  }, [shouldRunEffect]);

  useEffect(() => {
    if (code == '') return;
    console.log(code)
    generateFlowchart();
    const script = document.createElement('script');
    script.src = 'https://viewer.diagrams.net/js/viewer-static.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [code]);

  const generateFlowchart = () => {

    const ast = parseCode(code);
    console.log(ast)

    const flowchartXml = generateFlowchartXML(ast);
    console.log(flowchartXml);
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

    setXml(dataMxgraph);

    const flowChartNodes = <div className="mxgraph" style={{ maxWidth: '100%', backgroundColor: 'white' }} data-mxgraph={dataMxgraph}></div>

    setNodes(flowChartNodes);
  };

  return (
    <>
      {nodes}
      <button onClick={generateFlowchart}>Generate Flowchart</button>
    </>
  );
}
