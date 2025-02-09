import { useEffect, useRef } from 'react';

const DrawioEmbed: React.FC = () => {
  const divRef = useRef<HTMLDivElement>(null);

  const encodeXmlForMxGraph = (xml: string): string => {
    return xml
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/\n/g, '\n');
  };
  const encodeXmlForMxGraph2 = (xml: string): string => {
    return xml
      .replace(/"/g, '&quot;')
  };

  const originalXml = `
  <mxfile host="embed.diagrams.net" agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/132.0.0.0 Safari/537.36 Edg/132.0.0.0" version="26.0.11">
    <diagram name="ページ1" id="CdUxs8Y0e-rizKnnYlnu">
      <mxGraphModel dx="1410" dy="461" grid="1" gridSize="10" guides="1" tooltips="1" connect="1" arrows="1" fold="1" page="1" pageScale="1" pageWidth="827" pageHeight="1169" math="0" shadow="0">
        <root>
          <mxCell id="0" />
          <mxCell id="1" parent="0" />
          <mxCell id="0l7UC5MaGmf_nwxULVZd-1" value="終了" style="html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start" parent="1" vertex="1">
            <mxGeometry x="370" y="450" width="80" height="30" as="geometry" />
          </mxCell>
          <mxCell id="0l7UC5MaGmf_nwxULVZd-2" value="開始" style="html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start" parent="1" vertex="1">
            <mxGeometry x="370" y="290" width="80" height="30" as="geometry" />
          </mxCell>
          <mxCell id="0l7UC5MaGmf_nwxULVZd-4" value="処理A" style="rounded=0;whiteSpace=wrap;html=1;" parent="1" vertex="1">
            <mxGeometry x="365" y="360" width="90" height="40" as="geometry" />
          </mxCell>
          <mxCell id="0l7UC5MaGmf_nwxULVZd-5" value="" style="endArrow=none;html=1;rounded=0;entryX=0.5;entryY=0.5;entryDx=0;entryDy=15;entryPerimeter=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;" parent="1" source="0l7UC5MaGmf_nwxULVZd-4" target="0l7UC5MaGmf_nwxULVZd-2" edge="1">
            <mxGeometry width="50" height="50" relative="1" as="geometry">
              <mxPoint x="390" y="410" as="sourcePoint" />
              <mxPoint x="440" y="360" as="targetPoint" />
            </mxGeometry>
          </mxCell>
          <mxCell id="0l7UC5MaGmf_nwxULVZd-7" value="" style="endArrow=none;html=1;rounded=0;exitX=0.5;exitY=0.5;exitDx=0;exitDy=-15;exitPerimeter=0;entryX=0.5;entryY=1;entryDx=0;entryDy=0;" parent="1" source="0l7UC5MaGmf_nwxULVZd-1" target="0l7UC5MaGmf_nwxULVZd-4" edge="1">
            <mxGeometry width="50" height="50" relative="1" as="geometry">
              <mxPoint x="360" y="440" as="sourcePoint" />
              <mxPoint x="410" y="390" as="targetPoint" />
            </mxGeometry>
          </mxCell>
        </root>
      </mxGraphModel>
    </diagram>
  </mxfile>
  `;

  const encodedXml = encodeXmlForMxGraph(originalXml);

  const dataMxGraph = {
    highlight: '#0000ff',
    lightbox: false,
    nav: true,
    resize: true,
    'dark-mode': 'auto',
    toolbar: 'zoom',
    edit: '_blank',
    xml: encodedXml
  };

  const dataMxGraphString = JSON.stringify(dataMxGraph);
  console.log(encodeXmlForMxGraph2(dataMxGraphString));
  console.log("---------------");

  return (
    <div>
      <h1>JavaScript Code to Flowchart</h1>
      <div
        className="mxgraph"
        style={{ maxWidth: '100%', border: '1px solid transparent' }}
        ref={divRef}
      ></div>
    </div>
  );
};

export default DrawioEmbed;
