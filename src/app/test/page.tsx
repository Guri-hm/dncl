'use client'
import { useEffect, useRef, useState } from 'react';

const Home: React.FC = () => {

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://viewer.diagrams.net/js/viewer-static.min.js';
    script.async = true;
    document.body.appendChild(script);
    return () => {
      document.body.removeChild(script);
    };
  }, []);

  function encodeXML(xml: string): string {
    return xml.replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/\n/g, '\\n')
      .replace(/\\/g, '\\');
  }

  const xml = `
<mxGraphModel dx="946" dy="627" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />
    <mxCell id="pGsATREPlpZTRk-aaYQ8-1" value="終了" style="html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start" vertex="1" parent="1">
      <mxGeometry x="370" y="460" width="80" height="30" as="geometry" />
    </mxCell>
    <mxCell id="pGsATREPlpZTRk-aaYQ8-2" value="処理A" style="html=1;dashed=0;whiteSpace=wrap;" vertex="1" parent="1">
      <mxGeometry x="360" y="300" width="100" height="50" as="geometry" />
    </mxCell>
    <mxCell id="pGsATREPlpZTRk-aaYQ8-3" value="開始" style="html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start" vertex="1" parent="1">
      <mxGeometry x="370" y="250" width="80" height="30" as="geometry" />
    </mxCell>
    <mxCell id="pGsATREPlpZTRk-aaYQ8-5" value="" style="endArrow=none;html=1;rounded=0;entryX=0.5;entryY=0.5;entryDx=0;entryDy=15;entryPerimeter=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;" edge="1" parent="1" source="pGsATREPlpZTRk-aaYQ8-2" target="pGsATREPlpZTRk-aaYQ8-3">
      <mxGeometry width="50" height="50" relative="1" as="geometry">
        <mxPoint x="390" y="350" as="sourcePoint" />
        <mxPoint x="440" y="300" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="pGsATREPlpZTRk-aaYQ8-6" value="" style="endArrow=none;html=1;rounded=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;exitX=0.5;exitY=0.5;exitDx=0;exitDy=-15;exitPerimeter=0;" edge="1" parent="1" source="pGsATREPlpZTRk-aaYQ8-1" target="pGsATREPlpZTRk-aaYQ8-7">
      <mxGeometry width="50" height="50" relative="1" as="geometry">
        <mxPoint x="390" y="350" as="sourcePoint" />
        <mxPoint x="440" y="300" as="targetPoint" />
      </mxGeometry>
    </mxCell>
    <mxCell id="pGsATREPlpZTRk-aaYQ8-7" value="処理B" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
      <mxGeometry x="350" y="370" width="120" height="60" as="geometry" />
    </mxCell>
    <mxCell id="pGsATREPlpZTRk-aaYQ8-8" value="" style="endArrow=none;html=1;rounded=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;" edge="1" parent="1" source="pGsATREPlpZTRk-aaYQ8-7" target="pGsATREPlpZTRk-aaYQ8-2">
      <mxGeometry width="50" height="50" relative="1" as="geometry">
        <mxPoint x="390" y="350" as="sourcePoint" />
        <mxPoint x="440" y="300" as="targetPoint" />
      </mxGeometry>
    </mxCell>
  </root>
</mxGraphModel>
`;

  const mxfile = `
  <mxfile host="app.diagrams.net" agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0" version="26.0.11">
      <diagram name="ページ1" id="-Ry5r97N3-jTHmX2WoBb">
${xml}
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

  return (
    <div>
      <h1>JavaScript Code to Flowchart</h1>
      <div className="mxgraph" style={{ maxWidth: '100%' }}
        data-mxgraph={dataMxgraph}>
      </div>
    </div>
  );
};

export default Home;
