'use client'
import { useEffect, useRef, useState } from 'react';
import DrawioEmbed from './DrawioEmbed';

const Home: React.FC = () => {
  const iframeRef = useRef(null);

  useEffect(() => {
    const xml = `
      <mxfile host="app.diagrams.net">
        <diagram name="Page-1">
          <mxGraphModel>
            <root>
              <mxCell id="0" />
              <mxCell id="1" parent="0" />
              <mxCell id="2" value="開始" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="1">
                <mxGeometry x="240" y="30" width="80" height="40" as="geometry" />
              </mxCell>
              <mxCell id="3" value="処理" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
                <mxGeometry x="240" y="130" width="80" height="40" as="geometry" />
              </mxCell>
              <mxCell id="4" value="終了" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="1">
                <mxGeometry x="240" y="230" width="80" height="40" as="geometry" />
              </mxCell>
              <mxCell id="5" edge="1" parent="1" source="2" target="3">
                <mxGeometry relative="1" as="geometry" />
              </mxCell>
              <mxCell id="6" edge="1" parent="1" source="3" target="4">
                <mxGeometry relative="1" as="geometry" />
              </mxCell>
            </root>
          </mxGraphModel>
        </diagram>
      </mxfile>
    `;

    const handleMessage = (event) => {
      if (event.data === 'ready') {
        iframeRef.current.contentWindow.postMessage(xml, '*');
      }
    };

    window.addEventListener('message', handleMessage);

    return () => {
      window.removeEventListener('message', handleMessage);
    };
  }, []);

  return (
    <div>
      <h1>JavaScript Code to Flowchart</h1>
      <div>
        <iframe
          id="embed-diagram"
          src='https://embed.diagrams.net/?spin=1&embed=1&ExitsaveAndExit=0&noSaveBtn=1&noExitBtn=1'
          width="80%"
          height="600px"
          ref={iframeRef}
          title="Draw.io Diagram"
        ></iframe>

      </div>
    </div>
  );
};

export default Home;
