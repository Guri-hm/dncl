import * as acorn from 'acorn';
import { ASTNode } from '../types';

export const parseCode = (code: string) => {
    return acorn.parse(code, { ecmaVersion: 2020 }) as ASTNode;
};

const bottomCenter: { x: number, y: number } = { x: 0.5, y: 1 };
const rightCenter: { x: number, y: number } = { x: 1, y: 0.5 };
const escape = (str: string): string => {
    return str.replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
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
    let maxY = 0; //ノード追加時にy座標を記録
    const drawX = 240;
    const nodeDefaultHeight = 30;
    //ノードの真下
    let exitXY: { x: number, y: number } | null = null;
    let lastNodeId: number;

    const createNode = (value: string, style: string, x: number, y: number, width: number = 120, height: number = nodeDefaultHeight): string => {
        const node = `
    <mxCell id="${nodeId}" value="${escape(value)}" style="${style}" vertex="1" parent="1">
      <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />
    </mxCell>
    `;
        maxY = y;
        nodeId++;
        lastNodeId = nodeId;
        return node;
    };

    const createEdge = (source: number, target: number, style: string = '', wayPoints: string = ''): string => {

        const edge = `
    <mxCell id="${edgeId}" style="${style}${exitXY ? `exitX=${exitXY.x};exitY=${exitXY.y};` : 'orthogonalEdgeStyle'};rounded=0;curved=0;" edge="1" parent="1" source="${source}" target="${target}">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="300" y="200" as="sourcePoint" />
        ${wayPoints}
      </mxGeometry>
    </mxCell>
    `;

        //先行ノードの下部中央との結合を標準にする
        exitXY = null;
        edgeId++;
        return edge;
    };

    const addNode = (value: string, style: string, x: number, y: number, previousNodeId: number | null, width: number = 120, height: number = nodeDefaultHeight) => {
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
                    } else if (expression.type === 'UpdateExpression') {
                        const argument = expression.argument.name;
                        const operator = expression.operator;
                        addNode(`${argument}${operator}`, 'endArrow=none;html=1;rounded=0;', x, y, parentNodeId ? parentNodeId : nodeId - 1);
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
                if (node.consequent && node.consequent.body) {
                    node.consequent.body.forEach((consequentNode: ASTNode, index: number) => {
                        console.log(`条件分岐y:${y + 30 * (index + 1)}`)
                        processNode(consequentNode, x, y + 30 * (index + 1), index == 0 ? ifNodeId : nodeId - 1);
                        lastNodeId = nodeId - 1;
                    });
                    nodeIds.push(lastNodeId);
                }

                // 偽の分岐（`else` または `else if`）
                if (node.alternate) {
                    exitXY = rightCenter;
                    processAlternate(node.alternate as ASTNode, x + 160, y, ifNodeId, nodeIds);
                }

                // ダミーノード(分岐を収束させる)
                addNode('', 'shape=ellipse;whiteSpace=wrap;html=1;', x + 60, y + 240, null, 0, 0);
                const mergeNodeId = nodeId - 1;

                // 真と偽のノードから収束ノードへのエッジを追加
                nodeIds.forEach(id => {
                    xml += createEdge(id, mergeNodeId, 'endArrow=none;');
                });
                nodeIds = [];

                //ifのみでも分岐の線を引く
                if (!node.alternate) {
                    const wayPoint = `
                            <Array as="points">
                            <mxPoint x="${x + 200}" y="${y + 15}" />
                            <mxPoint x="${x + 200}" y="${maxY}" />
                            </Array>
                    `
                    xml += createEdge(ifNodeId, mergeNodeId, 'endArrow=none;', wayPoint);
                }

                break;

            case 'WhileStatement':
                const whileTest = node.test as any;
                const whileTestString = `${whileTest.left.name} ${whileTest.operator} ${whileTest.right.value}`;

                // ループ開始端子
                console.log(`ループ開始y:${y + 30}`)
                addNode(`${whileTestString}の間`, 'strokeWidth=1;html=1;shape=mxgraph.flowchart.loop_limit;whiteSpace=wrap;', x, y + 30, nodeId - 1);

                let bodyLength: number = 0;

                if (node.body) {
                    if (Array.isArray(node.body)) {
                        node.body.forEach((bodyNode: ASTNode, index: number) => {
                            console.log(`ループ内要素${(index + 1)}の開始y:${y + 90 * (index + 1)}`)
                            processNode(bodyNode, x, y + 90 * (index + 1), null);
                        });
                        bodyLength = node.body.length;
                    } else if (Array.isArray(node.body.body)) {
                        node.body.body.forEach((bodyNode: ASTNode, index: number) => {
                            console.log(`ループ内要素${(index + 1)}の開始y:${y + 90 * (index + 1)}`)
                            processNode(bodyNode, x, y + 90 * (index + 1), null);
                        });
                        bodyLength = node.body.body.length;
                    }
                };

                // ループ終了端子
                console.log(`ループ開始y:${y + 60 + 90 * (bodyLength)}`)
                addNode('', 'strokeWidth=1;html=1;shape=mxgraph.flowchart.loop_limit;whiteSpace=wrap;flipH=0;flipV=1;', x, y + 60 + 90 * (bodyLength), nodeId - 1);

                break;
            default:
                break;
        }
    };

    const processAlternate = (node: ASTNode, x: number, y: number, parentNodeId: number, nodeIds: number[]) => {
        if (node.type === 'IfStatement') {
            processNode(node, x, y, parentNodeId);
            //呼び出し先のダミーノードのid
            //これが呼び出し元のダミーノードのidと結ばれることでメインの流れに処理が戻る
            lastNodeId = nodeId - 1;
            nodeIds.push(lastNodeId);
        } else if (node.body && Array.isArray(node.body)) {
            node.body.forEach((alternateNode: ASTNode, index: number) => {
                processNode(alternateNode, x, y + 120 * (index + 1), index == 0 ? parentNodeId : nodeId - 1);
                lastNodeId = nodeId - 1;
            });
            nodeIds.push(lastNodeId);
        }
    };

    addNode('開始', 'html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start', drawX, 30, null);

    if (Array.isArray(ast.body)) {
        ast.body.forEach((node: ASTNode, index: number) => {
            processNode(node, drawX, 90 * (index + 1), null);
        });
    }

    addNode('終了', 'html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start', drawX, maxY + 30, nodeId - 1);
    xml += `
  </root>
</mxGraphModel>
  `;

    return xml;
};