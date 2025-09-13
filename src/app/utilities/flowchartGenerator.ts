import * as acorn from 'acorn';
import { ASTNode } from '../types';
import { ComparisonOperatorDncl, SimpleAssignmentOperator } from '../enum';

export const parseCode = (code: string) => {
    return acorn.parse(code, { ecmaVersion: 2020 }) as ASTNode;
};
interface ExtendedASTNode extends ASTNode {
    key?: { name?: string };
}
interface Identifier {
    type: 'Identifier';
    name: string;
}

interface MemberExpression {
    type: 'MemberExpression';
    object: Identifier;
    property: Identifier;
}

interface Argument {
    value?: string | number | boolean | object;
    name?: string;
}

interface CallExpression {
    type: 'CallExpression';
    callee: Identifier | MemberExpression;
    arguments: Argument[];
}

interface AssignmentExpression {
    type: 'AssignmentExpression';
    left: Expression;
    operator: string;
    right: Expression;
}

interface UpdateExpression {
    type: 'UpdateExpression';
    argument: Expression;
    operator: string;
}

interface BinaryExpression {
    type: 'BinaryExpression';
    left: Expression;
    operator: string;
    right: Expression;
}

interface Identifier {
    type: 'Identifier';
    name: string;
}

interface Literal {
    type: 'Literal';
    value: string | number | boolean | object;
}

interface ArrayExpression {
    type: 'ArrayExpression';
    elements: Expression[];
}

interface UnaryExpression {
    type: 'UnaryExpression';
    operator: string;
    // 引数は他の Expression を許容（再帰的に表現）
    argument: Expression | Literal | Identifier | BinaryExpression | CallExpression | ArrayExpression | UpdateExpression;
    prefix?: boolean;
}

interface ParenthesizedExpression {
    type: 'ParenthesizedExpression';
    expression: Expression;
}

interface VariableDeclarator {
    id: {
        name: string;
    };
    init: {
        value: string;
    };
}

interface VariableDeclaration {
    type: string;
    declarations: VariableDeclarator[];
}

type Expression = AssignmentExpression | UpdateExpression | BinaryExpression | UnaryExpression | Identifier | Literal | CallExpression | ArrayExpression |
    ParenthesizedExpression;
type InitExpression = VariableDeclaration | Expression

interface Test {
    type: 'Test';
    left: {
        name: string;
    };
    operator: string;
    right: {
        value: string | number | boolean | object; // 汎用的な型を指定
    };
}

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
    let mainFlowlastNodetId = 0;
    const drawX = 240;
    const nodeDefaultHeight = 30;
    //ノードの真下
    let exitXY: { x: number, y: number } | null = null;
    let lastNodeId: number;
    let label: string = '';

    const createNode = (value: string, style: string, x: number, y: number, width: number = 120, height: number = nodeDefaultHeight): string => {
        const node = `
    <mxCell id="${nodeId}" value="${escape(value)}" style="whiteSpace=wrap;${style}" vertex="1" parent="1">
      <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />
    </mxCell>
    `;
        maxY = y > maxY ? y : maxY;
        nodeId++;
        lastNodeId = nodeId;
        return node;
    };

    const createEdge = (source: number, target: number, style: string = 'endArrow=none;', wayPoints: string = ''): string => {

        const edge = `
    <mxCell id="${edgeId}" value="${label}" style="${style}${exitXY ? `exitX=${exitXY.x};exitY=${exitXY.y};` : 'orthogonalEdgeStyle'};rounded=0;curved=0;" edge="1" parent="1" source="${source}" target="${target}">
      <mxGeometry relative="1" as="geometry">
        <mxPoint x="300" y="200" as="sourcePoint" />
        ${wayPoints}
      </mxGeometry>
    </mxCell>
    `;

        //先行ノードの下部中央との結合を標準にする
        exitXY = null;
        edgeId++;
        label = '';
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

    const getExpressionString = (expression: InitExpression): string => {
        if ('declarations' in expression) {
            // VariableDeclaration の場合の処理
            const declaration = expression.declarations[0];
            // ここも = を ← に
            return `${declaration.id.name} ${SimpleAssignmentOperator.Dncl} ${declaration.init.value}`;
        } else {
            // その他の Expression の場合の処理
            if (expression) {
                switch (expression.type) {
                    case 'AssignmentExpression':
                        const left = getExpressionString(expression.left as InitExpression);
                        // 右辺が乱数式か判定
                        const rightExpr = expression.right as Expression;
                        const randomPattern = parseRandomExpression(rightExpr);
                        if (randomPattern) {
                            return `${left} ${SimpleAssignmentOperator.Dncl} 乱数(${randomPattern.min}, ${randomPattern.max})`;
                        }
                        // 代入演算子を ← に変換
                        const operator = expression.operator === '=' ? '←' : expression.operator || "";
                        let right = getExpressionString(expression.right as InitExpression);

                        // 右辺が「!==」を含む場合は「≠」に変換
                        if (right.includes('!==')) {
                            right = right.replace('!==', ComparisonOperatorDncl.NotEqualToOperator);
                        }

                        return `${left} ${operator} ${right}`;
                    case 'UpdateExpression':
                        const argument = getExpressionString(expression.argument as InitExpression);
                        const updateOperator = expression.operator || "";
                        return `${argument}${updateOperator}`;
                    case 'UnaryExpression':
                        // 型ガードで operator, argument に安全にアクセス
                        if ('operator' in expression && 'argument' in expression) {
                            const arg = getExpressionString(expression.argument as InitExpression);
                            const op = expression.operator || '';
                            return `(${op}${arg})`;
                        }
                        return "";
                    case 'BinaryExpression':
                        const leftBinary = getExpressionString(expression.left as InitExpression);
                        // 「!==」を「≠」に変換
                        const operatorBinary = expression.operator === '!==' ? ComparisonOperatorDncl.NotEqualToOperator : expression.operator || "";
                        const rightBinary = getExpressionString(expression.right as InitExpression);
                        return `${leftBinary} ${operatorBinary} ${rightBinary}`;
                    case 'ArrayExpression':
                        const elements = expression.elements.map((el: InitExpression) => getExpressionString(el)).join(", ");
                        return `[${elements}]`;
                    case 'Identifier':
                        return expression.name;
                    case 'Literal':
                        if (typeof expression.value === 'string') {
                            return expression.value;
                        } else if (typeof expression.value === 'number') {
                            return expression.value.toString();
                        } else if (typeof expression.value === 'boolean') {
                            return expression.value ? 'true' : 'false';
                        } else {
                            return JSON.stringify(expression.value);
                        }
                    default:
                        return "";
                }
            }
            return "";
        }
    };
    // 式から数値リテラルを取り出す（Unary/Parenthesized/Literal を許容）
    const getNumericValue = (expr: Expression | InitExpression | null | undefined): number | null => {
        if (!expr) return null;
        if (expr.type === 'Literal') {
            const value = (expr as Literal).value;
            return typeof value === 'number' ? value : null;
        }
        if (expr.type === 'UnaryExpression') {
            // 型ガードで安全にアクセス
            const unary = expr as UnaryExpression;
            if (unary.operator === '-' || unary.operator === '+') {
                const v = getNumericValue(unary.argument as Expression);
                return v !== null ? (unary.operator === '-' ? -v : v) : null;
            }
        }
        if (expr.type === 'ParenthesizedExpression') {
            const parenthesized = expr as ParenthesizedExpression;
            return getNumericValue(parenthesized.expression);
        }
        return null;
    };
    /**
 * 乱数式（Math.floor(Math.random() * (max - min + 1)) + min のような形）を解析して {min,max} を返す。
 * 負の数や括弧・Unary を許容するよう堅牢化。
 */
    function parseRandomExpression(expr: Expression): { min: number, max: number } | null {
        if (expr.type !== 'BinaryExpression' || expr.operator !== '+') return null;

        const left = (expr as BinaryExpression).left;
        const right = (expr as BinaryExpression).right;

        const min = getNumericValue(right);
        if (min === null) return null;

        // left が CallExpression で Math.floor(...) か確認
        if (left.type !== 'CallExpression') return null;
        const call = left as CallExpression;
        if (!(call.callee && call.callee.type === 'MemberExpression')) return null;
        const member = call.callee as MemberExpression;
        if (!(member.object && member.object.name === 'Math' && member.property && member.property.name === 'floor')) return null;
        if (!Array.isArray(call.arguments) || call.arguments.length !== 1) return null;

        let arg = call.arguments[0] as Expression;
        if (arg.type === 'ParenthesizedExpression') {
            arg = (arg as ParenthesizedExpression).expression;
        }

        // arg が BinaryExpression で '*' か確認
        if (!(arg.type === 'BinaryExpression' && arg.operator === '*')) return null;
        const leftArg = (arg as BinaryExpression).left;
        const rightArg = (arg as BinaryExpression).right;

        // leftArg が Math.random() の呼び出しか
        if (!(leftArg && leftArg.type === 'CallExpression')) return null;
        const leftCall = leftArg as CallExpression;
        if (!(leftCall.callee && leftCall.callee.type === 'MemberExpression')) return null;
        const leftMember = leftCall.callee as MemberExpression;
        if (!(leftMember.object && leftMember.object.name === 'Math' && leftMember.property && leftMember.property.name === 'random')) return null;

        // rightArg は (max - min + 1) の形
        let rangeExpr = rightArg;
        if (rangeExpr.type === 'ParenthesizedExpression') {
            rangeExpr = (rangeExpr as ParenthesizedExpression).expression;
        }

        if (rangeExpr.type === 'BinaryExpression' && rangeExpr.operator === '+') {
            const addLeft = (rangeExpr as BinaryExpression).left;
            const addRight = (rangeExpr as BinaryExpression).right;
            const plusOne = getNumericValue(addRight);
            if (plusOne !== 1) return null;

            if (addLeft.type === 'BinaryExpression' && addLeft.operator === '-') {
                const maxVal = getNumericValue((addLeft as BinaryExpression).left);
                const minValInRange = getNumericValue((addLeft as BinaryExpression).right);
                if (maxVal === null || minValInRange === null) return null;
                return { min: min, max: maxVal };
            }
        }

        return null;
    }

    const processNode = (node: ASTNode, x: number, y: number, parentNodeId: number | null) => {
        switch (node.type) {
            case 'ExpressionStatement':
                if (node.expression) {
                    const expression = node.expression as Expression;
                    if (expression.type === 'AssignmentExpression') {
                        const expressionString = getExpressionString(expression);
                        addNode(expressionString, 'endArrow=none;html=1;rounded=0;entryX=0.5;entryY=0.5;entryDx=0;entryDy=15;entryPerimeter=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;', x, y, parentNodeId ? parentNodeId : nodeId - 1);
                    } else if (expression.type === 'CallExpression') {
                        //関数の実行やconsole.logは「CallExpression」
                        const callee = expression.callee;
                        let calleeName = '';

                        if (callee.type === 'Identifier') {
                            calleeName = callee.name;
                        } else if (callee.type === 'MemberExpression') {
                            calleeName = callee.object.name;
                        }

                        const args = expression.arguments.map((arg: Argument) => {
                            if (arg.value !== undefined) {
                                return `"${arg.value}"`;
                            } else {
                                return arg.name;
                            }
                        }).join(', ');

                        if (callee.type === 'MemberExpression' && callee.object.name === 'console' && callee.property.name === 'log') {
                            addNode(`${args}を表示する`, 'endArrow=none;html=1;rounded=0;entryX=0.5;entryY=0.5;entryDx=0;entryDy=15;entryPerimeter=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;', x, y, parentNodeId ? parentNodeId : nodeId - 1);
                        } else {
                            // 定義済み関数の呼び出しの場合の処理
                            addNode(`${calleeName}(${args})を実行する`, 'shape=process;whiteSpace=wrap;html=1;backgroundOutline=1;', x, y, parentNodeId ? parentNodeId : nodeId - 1);
                        }
                    } else if (expression.type === 'UpdateExpression') {
                        const argument = expression.argument as Identifier;
                        const operator = expression.operator;
                        addNode(`${argument.name}${operator}`, 'endArrow=none;html=1;rounded=0;', x, y, parentNodeId ? parentNodeId : nodeId - 1);
                    }
                }
                break;
            case 'IfStatement': {
                // testNodeの型ガード
                const testNode = node.test as BinaryExpression | Test | Expression;

                let leftStr = '';
                let rightStr = '';
                let op = '';

                // BinaryExpressionまたはTest型の場合のみプロパティにアクセス
                if (testNode.type === 'BinaryExpression') {
                    leftStr = getExpressionString((testNode as BinaryExpression).left as InitExpression);
                    rightStr = getExpressionString((testNode as BinaryExpression).right as InitExpression);
                    op = (testNode as BinaryExpression).operator === '!==' ? ComparisonOperatorDncl.NotEqualToOperator : (testNode as BinaryExpression).operator;
                } else if (testNode.type === 'Test') {
                    leftStr = (testNode as Test).left.name;
                    rightStr = String((testNode as Test).right.value);
                    op = (testNode as Test).operator === '!==' ? ComparisonOperatorDncl.NotEqualToOperator : (testNode as Test).operator;
                } else {
                    leftStr = getExpressionString(testNode as InitExpression);
                }

                const testString = `${leftStr} ${op} ${rightStr}`.trim();
                addNode(testString, 'rhombus;whiteSpace=wrap;html=1;', x, y, parentNodeId ? parentNodeId : nodeId - 1);
                // ...以降の処理...
                break;
            }

            case 'WhileStatement':
                const whileTest = node.test as Test;
                const whileTestString = `${whileTest.left.name} ${whileTest.operator} ${whileTest.right.value}`;

                // ループ開始端子
                // console.log(`ループ開始y:${y + 30}`)
                addNode(`${whileTestString}の間`, 'strokeWidth=1;html=1;shape=mxgraph.flowchart.loop_limit;whiteSpace=wrap;', x, y + 30, nodeId - 1);

                let bodyLength: number = 0;

                if (node.body) {
                    if (Array.isArray(node.body)) {
                        node.body.forEach((bodyNode: ASTNode, index: number) => {
                            // console.log(`ループ内要素${(index + 1)}の開始y:${y + 30 + 60 * (index + 1)}`)
                            processNode(bodyNode, x, y + 30 + 60 * (index + 1), null);
                        });
                        bodyLength = node.body.length;
                    } else if (Array.isArray(node.body.body)) {
                        node.body.body.forEach((bodyNode: ASTNode, index: number) => {
                            // console.log(`ループ内要素${(index + 1)}の開始y:${y + 30 + 60 * (index + 1)}`)
                            processNode(bodyNode, x, y + 30 + 60 * (index + 1), null);
                        });
                        bodyLength = node.body.body.length;
                    }
                };

                // ループ終了端子
                // console.log(`ループ終了y:${y + 90 + 60 * (bodyLength)}`)
                addNode('', 'strokeWidth=1;html=1;shape=mxgraph.flowchart.loop_limit;whiteSpace=wrap;flipH=0;flipV=1;', x, y + 90 + 60 * (bodyLength), nodeId - 1);

                break;
            case 'ForStatement':

                const parseExpression = (expression: string): { operator: string, rightSide: string } => {
                    const match = expression.match(/([+-])\s*(.*)/);
                    if (match) {
                        const operator = match[1];
                        const rightSide = match[2].trim();
                        return { operator, rightSide };
                    }
                    return { operator: '', rightSide: '' };
                };

                const forInit = node.init ? getExpressionString(node.init as InitExpression) : '';
                const [variable, fromNum] = forInit.split('=').map(str => str.trim());
                const forTest = node.test ? getExpressionString(node.test as InitExpression) : '';
                const [, toNum] = forTest.split('<=').map(str => str.trim());
                const forUpdate = node.update ? getExpressionString(node.update as InitExpression) : '';
                const result = parseExpression(forUpdate);
                // ループ開始端子
                addNode(`${variable}を${fromNum}から${toNum}まで${result.rightSide}ずつ${result.operator == '+' ? '増やしながら' : '減らしながら'}`, 'strokeWidth=1;html=1;shape=mxgraph.flowchart.loop_limit;whiteSpace=wrap;', x, y, nodeId - 1);

                let forBodyLength: number = 0;

                if (node.body) {
                    if (Array.isArray(node.body)) {
                        node.body.forEach((bodyNode: ASTNode, index: number) => {
                            processNode(bodyNode, x, y + 60 * (index + 1), null);
                        });
                        forBodyLength = node.body.length;
                    } else if (Array.isArray(node.body.body)) {
                        node.body.body.forEach((bodyNode: ASTNode, index: number) => {
                            processNode(bodyNode, x, y + 60 * (index + 1), null);
                        });
                        forBodyLength = node.body.body.length;
                    }
                };

                // ループ終了端子
                addNode('', 'strokeWidth=1;html=1;shape=mxgraph.flowchart.loop_limit;whiteSpace=wrap;flipH=0;flipV=1;', x, y + 60 + 60 * (forBodyLength), nodeId - 1);

                break;

            case 'FunctionDeclaration':
            case 'FunctionExpression':

                mainFlowlastNodetId = nodeId - 1;
                const mainFlowMaxY = maxY;
                const functionName = (node as ExtendedASTNode).id?.name || (node as ExtendedASTNode).key?.name || null;
                if (functionName) {
                    // 定義済み関数の場合はノードを作成しない
                    addNode(`関数${functionName}`, 'html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start;', x + 400, y, null);

                    // let bodyLength: number = 0;

                    // 関数のボディを再帰的に処理
                    if (node.body) {
                        if (Array.isArray(node.body)) {
                            node.body.forEach((bodyNode: ASTNode, index: number) => {
                                // console.log(`関数の子要素${(index + 1)}y:${maxY + 60}`)
                                processNode(bodyNode, x + 400, maxY + 60, null);
                            });
                            // bodyLength = node.body.length;
                        } else if (Array.isArray(node.body.body)) {
                            node.body.body.forEach((bodyNode: ASTNode, index: number) => {
                                // console.log(`関数の子要素${(index + 1)}y:${maxY + 60}`)
                                processNode(bodyNode, x + 400, maxY + 60, null);
                            });
                            // bodyLength = node.body.body.length;
                        }
                    }

                    // 関数の終了ノードを追加
                    addNode(`終了`, 'html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start;', x + 400, maxY + 60, nodeId - 1);

                    // ダミーノード(関数は主フローと切り離すため，このダミーノードで主フローのエッジ連結に軌道修正)
                    addNode('', 'shape=ellipse;whiteSpace=wrap;html=1;', x + 60, y, mainFlowlastNodetId, 0, 0);
                    // 主フローの最深Yに戻す
                    maxY = mainFlowMaxY;
                    return;

                }
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
            processNode(node, drawX, 30 + 60 * (index + 1), null);
        });
    }

    addNode('終了', 'html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start', drawX, maxY + 60, nodeId - 1);
    xml += `
  </root>
</mxGraphModel>
  `;

    return xml;
};