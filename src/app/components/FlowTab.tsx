import { useEffect, useRef, useState } from 'react';
import { parseCode, generateFlowchartXML } from '../utilities';
import { BoxProps } from '@mui/material';
import { TreeItems } from '../types';

interface CustomBoxProps extends BoxProps {
  children?: React.ReactNode;
  treeItems: TreeItems;
}

export const FlowTab: React.FC<CustomBoxProps> = ({ treeItems }) => {
  const iframeRef = useRef(null);

  const [xml, setXml] = useState('');

  useEffect(() => {
    generateFlowchart();
    const script = document.createElement('script');
    script.src = 'https://viewer.diagrams.net/js/viewer-static.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  },);

  const generateFlowchart = () => {
    const code = `
        if (x > 0) {
            while (y < 10) {
                y++;
            }
        }
    `;
    // const code = `
    //     a = 2
    //     if(a > 5){
    //       b = 1
    //     }else if(a > 0){
    //       b = 0
    //     }
    //       else{
    //       b = 2
    //       a = 2
    //     }
    // `;
    const ast = parseCode(code);
    console.log(ast)
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

    const handleMessage = (event) => {
      if (event.data === 'ready') {
        iframeRef.current.contentWindow.postMessage(flowchartXml, '*');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  };

  return (
    <div style={{ backgroundColor: 'white' }}>
      <div className="mxgraph" style={{ maxWidth: '100%' }}
        data-mxgraph={xml}>
      </div>
      <button onClick={generateFlowchart}>Generate Flowchart</button>
      {/* <div>
        <iframe
          id="embed-diagram"
          src='https://embed.diagrams.net/?spin=1&embed=1&ExitsaveAndExit=0&noSaveBtn=1&noExitBtn=1'
          width="80%"
          height="600px"
          ref={iframeRef}
          title="Draw.io Diagram"
        ></iframe>

      </div> */}
    </div>
  );
}
