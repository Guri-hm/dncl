import { useState } from 'react';
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

    const generateFlowchart = () => {
        const code = `
function exampleFunction(num) {
  if (num % 2 === 0) {
    console.log("偶数です");
  } else {
    console.log("奇数です");
  }
  for (let i = 0; i < num; i++) {
    console.log(i);
  }
  while (num > 0) {
    num--;
  }
  switch (num) {
    case 1:
      console.log("One");
      break;
    case 2:
      console.log("Two");
      break;
    default:
      console.log("Other");
      break;
  }
}
`;
        const ast = parseCode(code);
        // const flowchartXml = generateFlowchartXML(ast);


        const flowchartXml = `
    <mxGraphModel>
      <root>
        <mxCell id="0" />
        <mxCell id="1" parent="0" />
      
        <mxCell id="2" value="開始" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="240" y="30" width="120" height="60" as="geometry" />
        </mxCell>
        
        <mxCell id="3" value="関数 exampleFunction" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="240" y="130" width="120" height="60" as="geometry" />
        </mxCell>
        
        <mxCell id="4" edge="1" parent="1" source="2" target="3">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        
        <mxCell id="5" value="if (num % 2 === 0)" style="rhombus;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="240" y="230" width="120" height="60" as="geometry" />
        </mxCell>
        
        <mxCell id="6" edge="1" parent="1" source="3" target="5">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        
        <mxCell id="7" value="真の場合: console.log(偶数です)" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="240" y="330" width="120" height="60" as="geometry" />
        </mxCell>
        
        <mxCell id="8" edge="1" parent="1" source="5" target="7">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        
        <mxCell id="9" value="偽の場合: console.log(奇数です)" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="240" y="430" width="120" height="60" as="geometry" />
        </mxCell>
        
        <mxCell id="10" edge="1" parent="1" source="5" target="9">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        
        <mxCell id="11" value="for (i = 0; i < num; i++)" style="rhombus;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="240" y="530" width="120" height="60" as="geometry" />
        </mxCell>
        
        <mxCell id="12" edge="1" parent="1" source="9" target="11">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        
        <mxCell id="13" value="処理: console.log(i)" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="240" y="630" width="120" height="60" as="geometry" />
        </mxCell>
        
        <mxCell id="14" edge="1" parent="1" source="11" target="13">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        
        <mxCell id="15" value="while (num > 0)" style="rhombus;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="240" y="730" width="120" height="60" as="geometry" />
        </mxCell>
        
        <mxCell id="16" edge="1" parent="1" source="13" target="15">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        
        <mxCell id="17" value="処理: num--" style="rounded=0;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="240" y="830" width="120" height="60" as="geometry" />
        </mxCell>
        
        <mxCell id="18" edge="1" parent="1" source="15" target="17">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
        
        <mxCell id="19" value="終了" style="ellipse;whiteSpace=wrap;html=1;" vertex="1" parent="1">
          <mxGeometry x="240" y="930" width="120" height="60" as="geometry" />
        </mxCell>
        
        <mxCell id="20" edge="1" parent="1" source="17" target="19">
          <mxGeometry relative="1" as="geometry" />
        </mxCell>
      </root>
    </mxGraphModel>
    `
        console.log(flowchartXml)
        setXml(flowchartXml);
    };

    return (
        <div>
            <h1>JavaScript Code to Flowchart</h1>
            <textarea
                value={codeString}
                onChange={(e) => setCodeString(e.target.value)}
                placeholder="Enter your JavaScript code here"
                style={{ width: '100%', height: '200px' }}
            />
            <button onClick={generateFlowchart}>Generate Flowchart</button>
            {xml && (
                <div>
                    <h2>Generated Flowchart</h2>
                    <iframe
                        src={`https://embed.diagrams.net/?data=${encodeURIComponent(xml)}&edit=1&layers=1&nav=1`}
                        style={{ width: '100%', height: '600px', border: 'none' }}
                    ></iframe>
                </div>
            )}
        </div>
    );
}
