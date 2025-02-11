import * as acorn from 'acorn';
import { ASTNode } from '../types';

export const parseCode = (code: string) => {
    return acorn.parse(code, { ecmaVersion: 2020 }) as ASTNode;
};

export const generateFlowchartXML = (ast: ASTNode) => {
    let xml = `
<mxGraphModel>
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />
  `;

    let nodeId = 2;
    let edgeId = 1000; // エッジ用のIDを別に管理

    let previousNodeId: number | null = null;

    const createNode = (value: string, style: string, x: number, y: number) => {
        const node = `
    <mxCell id="${nodeId}" value="${value}" style="${style}" vertex="1" parent="1">
      <mxGeometry x="${x}" y="${y}" width="120" height="60" as="geometry" />
    </mxCell>
    `;
        nodeId++;
        return node;
    };

    const createEdge = (source: number, target: number): string => {
        const edge = `
    <mxCell id="${edgeId}" style="exitX=0.5;exitY=1;exitDx=0;exitDy=0;" edge="1" parent="1" source="${source}" target="${target}">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="300" y="200" as="sourcePoint" />
      </mxGeometry>
    </mxCell>
    `;
        edgeId++;
        return edge;
    };

    const addNode = (value: string, style: string) => {
        const node = createNode(value, style, 240, 100 * (nodeId - 2) + 30);
        xml += node;
        if (previousNodeId !== null) {
            xml += createEdge(previousNodeId, nodeId - 1);
        }
        previousNodeId = nodeId - 1;
    };

    const getExpressionString = (expression: any) => {
        if (expression && expression.left && expression.right) {
            const left = expression.left.name || "";
            const operator = expression.operator || "";
            const right = expression.right.value || "";
            return `${left} ${operator} ${right}`;
        }
        return "";
    };

    addNode('開始', 'html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start');

    if (Array.isArray(ast.body)) {
        ast.body.forEach((node: ASTNode) => {
            if (node.type === 'ExpressionStatement' && node.expression) {
                const expression = node.expression as any; // 型を明示的に指定
                if (expression.type === 'AssignmentExpression') {
                    const expressionString = getExpressionString(expression);
                    addNode(expressionString, 'endArrow=none;html=1;rounded=0;entryX=0.5;entryY=0.5;entryDx=0;entryDy=15;entryPerimeter=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;');
                }
                else if (expression.type === 'CallExpression') {
                    const calleeObject = expression.callee.object.name;
                    const calleeProperty = expression.callee.property.name;
                    const args = expression.arguments.map((arg: any) => arg.value).join(', ');
                    addNode(`${calleeObject}.${calleeProperty}(${args})`, 'endArrow=none;html=1;rounded=0;entryX=0.5;entryY=0.5;entryDx=0;entryDy=15;entryPerimeter=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;');
                }
            }
        });
    }

    addNode('終了', 'html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start');
    xml += `
  </root>
</mxGraphModel>
  `;

    return xml;
};