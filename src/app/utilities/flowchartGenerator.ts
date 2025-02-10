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
    const createNode = (value: string, style: string, x: number, y: number) => {
        const node = `
    <mxCell id="${nodeId}" value="${value}" style="${style}" vertex="1" parent="1">
      <mxGeometry x="${x}" y="${y}" width="120" height="60" as="geometry" />
    </mxCell>
    `;
        nodeId++;
        return node;
    };

    const createEdge = (source: number, target: number) => {
        const edge = `
    <mxCell id="${nodeId}" edge="1" parent="1" source="${source}" target="${target}">
      <mxGeometry relative="1" as="geometry" />
    </mxCell>
    `;
        nodeId++;
        return edge;
    };

    let y = 30;
    let previousNodeId: number | null = null;

    const addNode = (value: string, style: string) => {
        const node = createNode(value, style, 240, y);
        xml += node;
        if (previousNodeId !== null) {
            xml += createEdge(previousNodeId, nodeId - 1);
        }
        previousNodeId = nodeId - 1;
        y += 100;
    };

    const getExpressionString = (expression: any) => {
        if (expression) {
            const callee = expression.callee;
            const args = expression.arguments;

            if (callee && args) {
                const objectName = callee.object?.name || "";
                const propertyName = callee.property?.name || "";
                const argumentsString = args.map((arg: any) => arg?.value || "").join(', ');

                return `${objectName}.${propertyName}(${argumentsString})`;
            }
        }
        return "";
    };

    addNode('開始', 'ellipse;whiteSpace=wrap;html=1;');
    if (Array.isArray(ast.body)) {
        ast.body.forEach((node: ASTNode) => {
            if (node.type === 'FunctionDeclaration') {
                addNode(`関数 ${node.id?.name}`, 'rounded=0;whiteSpace=wrap;html=1;');
                const functionBody = Array.isArray(node.body) ? node.body : (node.body as { body: ASTNode[] }).body;
                functionBody.forEach((statement: ASTNode) => {
                    switch (statement.type) {
                        case 'IfStatement':
                            addNode(`if (${statement.test?.left.name} ${statement.test?.operator} ${statement.test?.right.value})`, 'rhombus;whiteSpace=wrap;html=1;');
                            const consequentString = getExpressionString(statement.consequent?.body[0].expression);
                            addNode(`真の場合: ${consequentString}`, 'rounded=0;whiteSpace=wrap;html=1;');
                            if (statement.alternate) {
                                const alternateString = getExpressionString(statement.alternate.body[0].expression);
                                addNode(`偽の場合: ${alternateString}`, 'rounded=0;whiteSpace=wrap;html=1;');
                            }
                            break;
                        case 'ForStatement':
                            addNode(`for (${statement.init?.declarations[0].id.name} = ${statement.init?.declarations[0].init.value}; ${statement.test?.left.name} ${statement.test?.operator} ${statement.test?.right.value}; ${statement.update?.argument.name}++)`, 'rhombus;whiteSpace=wrap;html=1;');
                            const forBody = Array.isArray(statement.body) ? statement.body : (statement.body as { body: ASTNode[] }).body;
                            forBody.forEach((forBodyStatement: ASTNode) => {
                                const forBodyString = getExpressionString(forBodyStatement.expression);
                                addNode(`処理: ${forBodyString}`, 'rounded=0;whiteSpace=wrap;html=1;');
                            });
                            break;
                        case 'WhileStatement':
                            addNode(`while (${statement.test?.left.name} ${statement.test?.operator} ${statement.test?.right.value})`, 'rhombus;whiteSpace=wrap;html=1;');
                            const whileBody = Array.isArray(statement.body) ? statement.body : (statement.body as { body: ASTNode[] }).body;
                            whileBody.forEach((whileBodyStatement: ASTNode) => {
                                const whileBodyString = getExpressionString(whileBodyStatement.expression);
                                addNode(`処理: ${whileBodyString}`, 'rounded=0;whiteSpace=wrap;html=1;');
                            });
                            break;

                    }
                });
            }
        });
    }

    addNode('終了', 'ellipse;whiteSpace=wrap;html=1;');
    xml += `
  </root>
</mxGraphModel>
  `;

    return xml;
};