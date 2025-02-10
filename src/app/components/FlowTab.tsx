import { useEffect, useState } from 'react';
import { parseCode, generateFlowchartXML } from '../utilities';
import { BoxProps } from '@mui/material';
import { TreeItems } from '../types';

interface CustomBoxProps extends BoxProps {
  children?: React.ReactNode;
  treeItems: TreeItems;
}

export const FlowTab: React.FC<CustomBoxProps> = ({ treeItems }) => {
  const [codeString, setCodeString] = useState('');
  const [xml, setXml] = useState('');

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://viewer.diagrams.net/js/viewer-static.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, [xml]);

  const generateFlowchart = () => {
    const code = `
    a = 2
`;
    const ast = parseCode(code);
    const flowchartXml = generateFlowchartXML(ast);

    console.log(flowchartXml)

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
  };

  return (
    <div style={{ backgroundColor: 'white' }}>
      <div className="mxgraph" style={{ maxWidth: '100%' }}
        data-mxgraph={xml}>
      </div>
      <button onClick={generateFlowchart}>Generate Flowchart</button>
    </div>
  );
}
