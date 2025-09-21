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
        value: string | number | boolean | object;
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

// 比較演算子を DNCL 表記にマッピングするヘルパー
const mapComparisonOperator = (op?: string): string => {
    if (!op) return '';
    // == / === を = に変換
    if (op === '==' || op === '===') return '=';
    // != / !== を ≠ に変換
    if (op === '!=' || op === '!==') return ComparisonOperatorDncl.NotEqualToOperator;
    return op;
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
    let lastPlacedY = 30;
    const drawX = 240;
    const nodeDefaultHeight = 30;
    const nodeDefaultWidth = 30;
    //ノードの真下
    let exitXY: { x: number, y: number } | null = null;
    let lastNodeId: number;
    let label: string = '';

    // 各ノードの位置を保存（id -> {x,y,width,height}）
    const nodePositions: Record<number, { x: number; y: number; width: number; height: number }> = {};

    const createNode = (value: string, style: string, x: number, y: number, width: number = nodeDefaultWidth, height: number = nodeDefaultHeight): string => {
        const node = `
    <mxCell id="${nodeId}" value="${escape(value)}" style="whiteSpace=wrap;${style}" vertex="1" parent="1">
      <mxGeometry x="${x}" y="${y}" width="${width}" height="${height}" as="geometry" />
    </mxCell>
    `;
        // 作成ノードの位置を保存（作成前の nodeId がこのノードの id）
        const createdId = nodeId;
        nodePositions[createdId] = { x, y, width, height };
        const bottomY = y + height;
        maxY = bottomY > maxY ? bottomY : maxY;
        lastPlacedY = y;
        nodeId++;
        lastNodeId = createdId;
        return node;
    };

    const createEdge = (source: number, target: number, style: string = 'endArrow=none;', wayPoints: string = ''): string => {
        const edgeStylePart = exitXY
            ? `exitX=${exitXY.x};exitY=${exitXY.y};edgeStyle=orthogonalEdgeStyle;`
            : `edgeStyle=orthogonalEdgeStyle;`;
        const fullStyle = `${style}${edgeStylePart}rounded=0;curved=0;`;

        const edge = `
    <mxCell id="${edgeId}" value="${label}" style="${fullStyle}" edge="1" parent="1" source="${source}" target="${target}">
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

    const addNode = (value: string, style: string, x: number, y: number, previousNodeId: number | null, width: number = nodeDefaultWidth, height: number = nodeDefaultHeight) => {
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
                        // 比較演算子を DNCL 表記に変換（== -> =, !=/!== -> ≠ 等）
                        const operatorBinary = mapComparisonOperator(expression.operator);
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

    type ProcessResult = { endId: number; endY: number; centerY?: number };

    const getNodeBottomY = (id: number): number => {
        const pos = nodePositions[id];
        if (!pos) return maxY;
        return pos.y + (pos.height || nodeDefaultHeight);
    };

    const resPlaceholder = (): number => nodeId - 1;

    const getBodyNodes = (body: unknown): ASTNode[] | undefined => {
        if (!body) return undefined;
        if (Array.isArray(body)) return body as ASTNode[];
        const maybe = body as { body?: unknown };
        if (maybe.body && Array.isArray(maybe.body)) return maybe.body as ASTNode[];
        return undefined;
    };

    const processNode = (node: ASTNode, x: number, y: number, parentNodeId: number | null): ProcessResult => {
        switch (node.type) {
            case 'ExpressionStatement': {
                if (node.expression) {
                    const expression = node.expression as Expression;
                    if (expression.type === 'AssignmentExpression') {
                        const expressionString = getExpressionString(expression);
                        addNode(expressionString, 'endArrow=none;html=1;rounded=0;entryX=0.5;entryY=0.5;entryDx=0;entryDy=15;entryPerimeter=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;', x, y, parentNodeId ? parentNodeId : nodeId - 1);
                        const id = nodeId - 1;
                        return { endId: id, endY: getNodeBottomY(id), centerY: (nodePositions[id].y + (nodePositions[id].height || nodeDefaultHeight) / 2) };
                    } else if (expression.type === 'CallExpression') {
                        const callee = expression.callee;
                        let calleeName = '';
                        const calleeKind = (callee as Identifier | MemberExpression).type;
                        if (calleeKind === 'Identifier') {
                            calleeName = (callee as Identifier).name;
                        } else if (calleeKind === 'MemberExpression') {
                            calleeName = (callee as MemberExpression).object.name;
                        }

                        const args = expression.arguments.map((arg: Argument) => {
                            if (arg.value !== undefined) {
                                return `"${arg.value}"`;
                            } else {
                                return arg.name;
                            }
                        }).join(', ');

                        // MemberExpression 判定は型ガードで明示的に行う
                        if (calleeKind === 'MemberExpression') {
                            const memberCallee = callee as MemberExpression;
                            if (memberCallee.object?.name === 'console' && memberCallee.property?.name === 'log') {
                                addNode(`${args}を表示する`, 'endArrow=none;html=1;rounded=0;entryX=0.5;entryY=0.5;entryDx=0;entryDy=15;entryPerimeter=0;exitX=0.5;exitY=0;exitDx=0;exitDy=0;', x, y, parentNodeId ? parentNodeId : nodeId - 1);
                                const id = nodeId - 1;
                                return { endId: id, endY: getNodeBottomY(id), centerY: nodePositions[id].y + (nodePositions[id].height || nodeDefaultHeight) / 2 };
                            }
                        }

                        addNode(`${calleeName}(${args})を実行する`, 'shape=process;whiteSpace=wrap;html=1;backgroundOutline=1;', x, y, parentNodeId ? parentNodeId : nodeId - 1);
                        const id = nodeId - 1;
                        return { endId: id, endY: getNodeBottomY(id), centerY: nodePositions[id].y + (nodePositions[id].height || nodeDefaultHeight) / 2 };

                    } else if (expression.type === 'UpdateExpression') {
                        const argument = expression.argument as Identifier;
                        const operator = expression.operator;
                        addNode(`${argument.name}${operator}`, 'endArrow=none;html=1;rounded=0;', x, y, parentNodeId ? parentNodeId : nodeId - 1);
                        const id = nodeId - 1;
                        return { endId: id, endY: getNodeBottomY(id), centerY: nodePositions[id].y + (nodePositions[id].height || nodeDefaultHeight) / 2 };
                    }
                }
                return { endId: nodeId - 1, endY: maxY };
            }
            case 'IfStatement': {
                const testNode = node.test as BinaryExpression | Test | Expression | undefined | null;

                let leftStr = '';
                let rightStr = '';
                let op = '';

                if (testNode && (testNode as BinaryExpression).type === 'BinaryExpression') {
                    leftStr = getExpressionString((testNode as BinaryExpression).left as InitExpression);
                    rightStr = getExpressionString((testNode as BinaryExpression).right as InitExpression);
                    op = mapComparisonOperator((testNode as BinaryExpression).operator);
                } else if (testNode && (testNode as Test).type === 'Test') {
                    leftStr = (testNode as Test).left.name;
                    rightStr = String((testNode as Test).right.value);
                    op = mapComparisonOperator((testNode as Test).operator);
                } else if (testNode) {
                    leftStr = getExpressionString(testNode as InitExpression);
                }

                const testString = `${leftStr} ${op} ${rightStr}`.trim();
                addNode(testString, 'rhombus;whiteSpace=wrap;html=1;', x, y, parentNodeId ? parentNodeId : nodeId - 1);

                const ifNodeId = nodeId - 1;
                // 合流用に id とその x 座標・垂直中心を保持する
                let nodeIds: { id: number; x: number; yCenter: number }[] = [];

                // ブランチ用の基準 Y（テストノードの下端）
                const branchBaseTop = y + (nodeDefaultHeight);

                // 真の分岐（逐次処理して最後の endId を取得）
                // 真の分岐（逐次処理して最後の endId を取得）
                if (node.consequent && node.consequent.body) {
                    label = 'はい';
                    // ブランチ内の lastPlacedY を親と独立させる（他のブランチへ影響させない）
                    const prevLastPlacedY = lastPlacedY;
                    lastPlacedY = branchBaseTop;

                    let lastRes: ProcessResult | null = null;
                    for (let index = 0; index < node.consequent.body.length; index++) {
                        const consequentNode = node.consequent.body[index];
                        // ブランチ内はテストノード直下からの相対配置を使う
                        const startY = branchBaseTop + 60 * (index + 1);
                        const res = processNode(consequentNode, x, startY, index === 0 ? ifNodeId : resPlaceholder());
                        lastRes = res;
                    }

                    // ブランチ処理後に global lastPlacedY を復元
                    lastPlacedY = prevLastPlacedY;

                    if (lastRes) {
                        lastNodeId = lastRes.endId;
                        const pos = nodePositions[lastNodeId];
                        const yCenter = pos ? pos.y + (pos.height || nodeDefaultHeight) / 2 : maxY + nodeDefaultHeight / 2;
                        nodeIds.push({ id: lastNodeId, x: x, yCenter });
                    }
                }

                if (node.alternate) {
                    exitXY = rightCenter;
                    label = 'いいえ';
                    // alternate も同様に branchBaseTop を基準に処理（lastPlacedY を一時的に置き換える）
                    const prevLastPlacedY2 = lastPlacedY;
                    lastPlacedY = branchBaseTop;
                    processAlternate(node.alternate as ASTNode, x + 160, branchBaseTop, ifNodeId, nodeIds);
                    lastPlacedY = prevLastPlacedY2;
                }

                const branchCenters = nodeIds.filter(it => (it.yCenter ?? 0) >= (y + nodeDefaultHeight / 2));
                const averageCenter = branchCenters.length > 0
                    ? Math.round(branchCenters.reduce((acc, it) => acc + (it.yCenter || 0), 0) / branchCenters.length)
                    : (maxY + 60);

                // 各分岐ノードの下端の最大値を求め、合流 center の下限をそこから半ノード高さ分下に設定する
                const sourceBottomMax = nodeIds.reduce((acc, it) => {
                    const p = nodePositions[it.id];
                    const bottom = p ? (p.y + (p.height || nodeDefaultHeight)) : acc;
                    return Math.max(acc, bottom);
                }, 0);
                const minMergeCenter = sourceBottomMax + Math.round(nodeDefaultHeight / 2);

                const calculatedMergeCenterY = Math.max(averageCenter, minMergeCenter, maxY + 20);

                // merge ノードは高さ 1 の透明ダミーにして中心位置を厳密に合わせる
                const mergeHeight = 1;
                const mergeTopY = calculatedMergeCenterY - Math.floor(mergeHeight / 2);
                addNode('', 'shape=ellipse;whiteSpace=wrap;html=1;strokeColor=none;fillColor=none;', x + 60, mergeTopY, null, 0, mergeHeight);
                const mergeNodeId = nodeId - 1;
                if (nodePositions[mergeNodeId]) {
                    nodePositions[mergeNodeId].y = mergeTopY;
                    nodePositions[mergeNodeId].height = mergeHeight;
                    nodePositions[mergeNodeId].width = 0;
                }

                const mergeX = x + 60;
                const mergeY = calculatedMergeCenterY;

                // if に alternate が無い場合でも「いいえ」経路を明示的に描画する（以前の挙動を再現）
                if (!node.alternate) {
                    const wayPoint = `
                        <Array as="points">
                            <mxPoint x="${x + 200}" y="${y + Math.round(nodeDefaultHeight / 2)}" />
                            <mxPoint x="${x + 200}" y="${mergeY}" />
                        </Array>
                    `;
                    label = 'いいえ';
                    xml += createEdge(ifNodeId, mergeNodeId, 'endArrow=block;', wayPoint);
                }

                nodeIds.forEach(item => {
                    const srcId = item.id;
                    const srcPos = nodePositions[srcId];
                    const nodeWidth = srcPos?.width ?? nodeDefaultWidth;
                    const nodeHeight = srcPos?.height ?? nodeDefaultHeight;
                    const srcCenterX = (srcPos?.x ?? item.x) + nodeWidth / 2;
                    // ソースの下端（bottom）から垂直に降ろす
                    const srcBottomY = (srcPos?.y ?? (mergeY - nodeHeight)) + nodeHeight;
                    const wayPoint = `
                        <Array as="points">
                            <mxPoint x="${srcCenterX}" y="${srcBottomY}" />
                            <mxPoint x="${srcCenterX}" y="${mergeY}" />
                            <mxPoint x="${mergeX}" y="${mergeY}" />
                        </Array>
                    `;
                    xml += createEdge(srcId, mergeNodeId, 'endArrow=none;', wayPoint);
                });
                nodeIds = [];

                return { endId: mergeNodeId, endY: getNodeBottomY(mergeNodeId), centerY: nodePositions[mergeNodeId].y + (nodePositions[mergeNodeId].height || nodeDefaultHeight) / 2 };
            }

            case 'WhileStatement': {
                const testNode = node.test as
                    | BinaryExpression
                    | Test
                    | Identifier
                    | Literal
                    | ParenthesizedExpression
                    | UnaryExpression
                    | undefined
                    | null;

                let whileTestString = '';
                if (!testNode) {
                    whileTestString = '条件の間';
                } else if (testNode.type === 'BinaryExpression') {
                    const left = getExpressionString((testNode as BinaryExpression).left as InitExpression);
                    const right = getExpressionString((testNode as BinaryExpression).right as InitExpression);
                    const op = mapComparisonOperator((testNode as BinaryExpression).operator);
                    whileTestString = `${left} ${op} ${right}`;
                } else if (testNode.type === 'Test') {
                    whileTestString = `${(testNode as Test).left.name} ${(testNode as Test).operator} ${String((testNode as Test).right.value)}`;
                } else if (testNode.type === 'Identifier') {
                    whileTestString = (testNode as Identifier).name;
                } else if (testNode.type === 'Literal') {
                    whileTestString = String((testNode as Literal).value);
                } else {
                    whileTestString = getExpressionString(testNode as InitExpression) || '条件の間';
                }

                addNode(`${whileTestString}の間`, 'strokeWidth=1;html=1;shape=loopLimit;whiteSpace=wrap;', x, y, parentNodeId ? parentNodeId : nodeId - 1);

                const beforeLoopMaxY = maxY;
                const arr = getBodyNodes(node.body);
                if (arr) {
                    for (let index = 0; index < arr.length; index++) {
                        const bodyNode = arr[index];
                        const res = processNode(bodyNode, x, y + 60 * (index + 1), null);
                    }
                }

                // ループ終端の top Y は、ループ内で生成された最大の bottom を基準にする
                // 最低でも「開始ノードの下 + ギャップ」を保証
                const loopEndTop = Math.max(
                    beforeLoopMaxY + 60,    // 何も深くならなかった場合に備えた最小位置
                    maxY + 20               // ループ内で生成された要素の下に配置（余白20）
                );

                addNode('', 'strokeWidth=1;html=1;shape=loopLimit;whiteSpace=wrap;flipH=0;flipV=1;', x, loopEndTop, nodeId - 1);
                return { endId: nodeId - 1, endY: getNodeBottomY(nodeId - 1), centerY: nodePositions[nodeId - 1].y + (nodePositions[nodeId - 1].height || nodeDefaultHeight) / 2 };
            }

            case 'ForStatement': {
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
                let variable = '';
                let fromNum = '';
                const initMatch = forInit.match(/^\s*([^\s←=]+)\s*(?:←|=)\s*(.+)$/);
                if (initMatch) {
                    variable = initMatch[1].trim();
                    fromNum = initMatch[2].trim();
                } else {
                    const parts = forInit.split(/[:=←]/).map(s => s.trim());
                    variable = parts[0] || '';
                    fromNum = parts[1] || '';
                }

                const forTest = node.test ? getExpressionString(node.test as InitExpression) : '';
                let compareOp = '';
                let toNum = '';
                const testMatch = forTest.match(/(.*?)(<=|<|>=|>)\s*(.+)/);
                if (testMatch) {
                    compareOp = testMatch[2].trim();
                    toNum = testMatch[3].trim();
                } else {
                    const parts = forTest.split(/<=|<|>=|>/).map(s => s.trim());
                    toNum = parts[1] || parts[0] || '';
                }

                const compareWord = compareOp === '<=' ? 'まで'
                    : compareOp === '<' ? '未満'
                        : compareOp === '>=' ? '以上'
                            : compareOp === '>' ? 'より大きい'
                                : 'まで';

                const forUpdate = node.update ? getExpressionString(node.update as InitExpression) : '';
                const result = parseExpression(forUpdate);
                const stepText = result.rightSide ? `${result.rightSide}ずつ` : '';
                const direction = result.operator === '+' ? '増やしながら' : result.operator === '-' ? '減らしながら' : 'しながら';

                addNode(
                    `${variable}を${fromNum}から${toNum}${compareWord}${stepText}${direction}`,
                    'strokeWidth=1;html=1;shape=loopLimit;whiteSpace=wrap;',
                    x, y, nodeId - 1
                );

                // ループ開始前の maxY を保持し、ボディ処理後に実際の maxY を参照して終端位置を決める
                const beforeLoopMaxY = maxY;
                const arrFor = getBodyNodes(node.body);
                if (arrFor) {
                    for (let index = 0; index < arrFor.length; index++) {
                        const bodyNode = arrFor[index];
                        processNode(bodyNode, x, y + 60 * (index + 1), null);
                    }
                }

                // ループ終端の top Y を、ループ内で生成された maxY（bottomベース）から決定する
                const loopEndTop = Math.max(
                    beforeLoopMaxY + 60, // 最低限の位置
                    maxY + 20            // ループ内の生成物の下に配置（余白20）
                );

                addNode('', 'strokeWidth=1;html=1;shape=loopLimit;whiteSpace=wrap;flipH=0;flipV=1;', x, loopEndTop, nodeId - 1);
                return { endId: nodeId - 1, endY: getNodeBottomY(nodeId - 1), centerY: nodePositions[nodeId - 1].y + (nodePositions[nodeId - 1].height || nodeDefaultHeight) / 2 };
            }

            case 'FunctionDeclaration':
            case 'FunctionExpression': {
                const mainFlowlastNodetId = nodeId - 1;
                const mainFlowMaxY = maxY;
                const functionName = (node as ExtendedASTNode).id?.name || (node as ExtendedASTNode).key?.name || null;
                if (functionName) {
                    addNode(`関数${functionName}`, 'html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start;', x + 400, y, null);

                    const arrFunc = getBodyNodes(node.body);
                    if (arrFunc) {
                        for (let index = 0; index < arrFunc.length; index++) {
                            const bodyNode = arrFunc[index];
                            processNode(bodyNode, x + 400, maxY + 60, null);
                        }
                    }

                    addNode(`終了`, 'html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start;', x + 400, maxY + 60, nodeId - 1);
                    addNode('', 'shape=ellipse;whiteSpace=wrap;html=1;', x + 60, y, mainFlowlastNodetId, 0, 0);
                    maxY = mainFlowMaxY;
                    return { endId: mainFlowlastNodetId, endY: maxY };
                }
                break;
            }

            default:
                break;
        }

        return { endId: nodeId - 1, endY: maxY };
    };

    const processAlternate = (node: ASTNode, x: number, y: number, parentNodeId: number, nodeIds: { id: number; x: number; yCenter?: number }[]): ProcessResult | null => {
        if (node.type === 'IfStatement') {
            const res = processNode(node, x, y + 60, parentNodeId);
            lastNodeId = res.endId;
            const pos = nodePositions[lastNodeId];
            const yCenter = pos ? pos.y + (pos.height || nodeDefaultHeight) / 2 : maxY + nodeDefaultHeight / 2;
            nodeIds.push({ id: lastNodeId, x, yCenter });
            return res;
        } else {
            const arrAlt = getBodyNodes(node.body);
            if (arrAlt) {
                let lastRes: ProcessResult | null = null;
                for (let index = 0; index < arrAlt.length; index++) {
                    const alternateNode = arrAlt[index];
                    const res = processNode(alternateNode, x, y + 60 * (index + 1), index === 0 ? parentNodeId : resPlaceholder());
                    lastNodeId = res.endId;
                    lastRes = res;
                }
                const pos = nodePositions[lastNodeId];
                const yCenter = pos ? pos.y + (pos.height || nodeDefaultHeight) / 2 : maxY + nodeDefaultHeight / 2;
                nodeIds.push({ id: lastNodeId, x, yCenter });
                return lastRes;
            }
        }
        return null;
    };

    addNode('開始', 'html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start', drawX, 30, null);

    if (Array.isArray(ast.body)) {
        for (const node of ast.body) {
            const startY = Math.max(30, lastPlacedY + 60);
            const res = processNode(node, drawX, startY, null);
            // maxY は底辺ベースで更新
            maxY = Math.max(maxY, res.endY);
        }
    }

    const endStartY = Math.max(lastPlacedY + 30, maxY + 20);
    addNode('終了', 'html=1;dashed=0;whiteSpace=wrap;shape=mxgraph.dfd.start', drawX, endStartY, nodeId - 1);
    xml += `
  </root>
</mxGraphModel>
  `;

    return xml;
};