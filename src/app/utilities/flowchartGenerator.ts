import * as acorn from 'acorn';
import { ASTNode } from '../types';

export const parseCode = (code: string) => {
    return acorn.parse(code, { ecmaVersion: 2020 }) as ASTNode;
};

const bottomCenter: { x: number, y: number } = { x: 0.5, y: 1 };
const rightCenter: { x: number, y: number } = { x: 1, y: 0.5 };

export const generateFlowchartXML = (ast: ASTNode) => {
    let xml = `
<mxGraphModel>
  <root>
    <mxCell id="0" />
    <mxCell id="1" parent="0" />
  `;

    let nodeId = 2;
    let edgeId = 1000; // エッジ用のIDを別に管理

    //ノードの真下
    let exitXY: { x: number, y: number } = bottomCenter;
    let lastNodeId: number;

    const createNode = (value: string, style: string, x: number, y: number, width: number = 120, height: number = 60): string => {
        const node = `
    <mxCell id="${nodeId}" value="${value}" style="${style}" vertex="1" parent="1">
      <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />
    </mxCell>
    `;
        nodeId++;
        lastNodeId = nodeId;
        return node;
    };

    const createEdge = (source: number, target: number, style: string = ''): string => {

        let relay = '';
        switch (exitXY) {
            case rightCenter:
                relay = `<Array as="points">
                    <mxPoint x="460" y="290" />
                    </Array>
                `
                break;
        }

        const edge = `
    <mxCell id="${edgeId}" style="orthogonalEdgeStyle;${style}${exitXY ? `exitX=${exitXY.x};exitY=${exitXY.y};` : ''};rounded=0;curved=0;" edge="1" parent="1" source="${source}" target="${target}">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="300" y="200" as="sourcePoint" />
        ${relay}
      </mxGeometry>
    </mxCell>
    `;
        if (exitXY != bottomCenter) {
            //先行ノードの下部中央との結合を標準にする
            exitXY = bottomCenter;
        }
        edgeId++;
        return edge;
    };

    const addNode = (value: string, style: string, x: number, y: number, previousNodeId: number | null, width: number = 120, height: number = 60) => {
        const node = createNode(value, style, x, y, width, height);
        xml += node;
        if (previousNodeId !== null) {
            xml += createEdge(previousNodeId, nodeId - 1);
        }
        previousNodeId = nodeId - 1;
    };

    const getExpressionString = (expression: any): string => {
        if (expression && expression.left && expression.right) {
            const left = expression.left.name || "";
            const operator = expression.operator || "";
            const right = expression.right.value || "";
            return `${left} ${operator} ${right}`;
        }
        return "";
    };

    const processNode = (node: ASTNode, x: number, y: number, parentNodeId: number | null) => {
        switch (node.type) {
            case 'ExpressionStatement':
                if (node.expression) {
                    const expression = node.expression as any; // 型を明示的に指定
                    if (expression.type === 'AssignmentExpression') {
                        const expressionString = getExpressionString(expression);
                        addNode(expressionString, 'endArrow=none;html=1;rounded=0;entryX=0.5;entryY=0.5;entryDx=0;entryDy=15;entryPerimeter=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;', x, y, parentNodeId ? parentNodeId : nodeId - 1);
                    } else if (expression.type === 'CallExpression') {
                        const calleeObject = expression.callee.object.name;
                        const calleeProperty = expression.callee.property.name;
                        const args = expression.arguments.map((arg: any) => arg.value).join(', ');
                        addNode(`${calleeObject}.${calleeProperty}(${args})`, 'endArrow=none;html=1;rounded=0;entryX=0.5;entryY=0.5;entryDx=0;entryDy=15;entryPerimeter=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;', x, y, parentNodeId ? parentNodeId : nodeId - 1);
                    }
                }
                break;
            case 'IfStatement':
                const test = node.test as any;
                const testString = `${test.left.name} ${test.operator} ${test.right.value}`;
                addNode(testString, 'rhombus;whiteSpace=wrap;html=1;', x, y, parentNodeId ? parentNodeId : nodeId - 1);

                const ifNodeId = nodeId - 1;
                let nodeIds: number[] = [];

                // 真の分岐
                node.consequent.body.forEach((consequentNode: ASTNode, index: number) => {
                    processNode(consequentNode, x, y + 120 * (index + 1), index == 0 ? ifNodeId : nodeId - 1);
                    lastNodeId = nodeId - 1;
                });
                nodeIds.push(lastNodeId);

                // 偽の分岐
                if (node.alternate) {
                    exitXY = rightCenter;
                    node.alternate.body.forEach((alternateNode: ASTNode, index: number) => {
                        processNode(alternateNode, x + 160, y + 120 * (index + 1), index == 0 ? ifNodeId : nodeId - 1);
                        lastNodeId = nodeId - 1;
                    });
                    nodeIds.push(lastNodeId);
                }

                // 収束ノード
                addNode('', 'endArrow=none;html=1;rounded=0;entryX=0;entryY=0;entryDx=0;entryDy=0;exitX=0.5;exitY=0.5;exitDx=0;exitDy=-30;exitPerimeter=0;strokeColor=#FF3333;', x + 80, y + 240, null, 0, 0);
                const mergeNodeId = nodeId - 1;

                // 真と偽のノードから収束ノードへのエッジを追加
                nodeIds.map(id => {
                    xml += createEdge(id, mergeNodeId);
                })
                nodeIds = [];

                break;
            case 'WhileStatement':
                const whileTest = node.test as any;
                const whileTestString = `${whileTest.left.name} ${whileTest.operator} ${whileTest.right.value}`;
                addNode(whileTestString, 'ellipse;whiteSpace=wrap;html=1;', x, y, parentNodeId);

                const whileNodeId = nodeId - 1;

                node.body.body.forEach((bodyNode: ASTNode, index: number) => {
                    processNode(bodyNode, x, y + 120 * (index + 1), whileNodeId);
                });

                xml += createEdge(nodeId - 1, whileNodeId, 'exitX=0.5;exitY=1;exitDx=0;exitDy=0;entryX=0.5;entryY=0;entryDx=0;entryDy=0;'); // ループの戻りエッジ
                break;
            default:
                break;
        }
    };

    addNode('開始', 'html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start', 240, 30, null);

    if (Array.isArray(ast.body)) {
        ast.body.forEach((node: ASTNode, index: number) => {
            processNode(node, 240, 130 * (index + 1), null);
        });
    }

    addNode('終了', 'html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start', 240, 550, nodeId - 1);
    xml += `
  </root>
</mxGraphModel>
  `;

    return xml;
};