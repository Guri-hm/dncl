module.exports = {
    meta: {
        type: "problem",
        docs: {
            description:
                "Allow direct assignment but prevent use-before-declaration, with selective method usage",
            category: "Best Practices",
            recommended: false,
        },
        schema: [],
        messages: {
            useBeforeDeclaration: "'{{name}}' は定義される前に使用されています",
            constantReassignment: "定数「{{name}}」に再代入はできません",
            constAlreadyExists: "定数 '{{name}}' を定義しようとしていますが、すでに同名の変数が存在します",
            arrayIndexOOB: "配列 '{{name}}' のインデックスが範囲外です (インデックス: {{index}})",
        },
    },
    create(context) {
        console.log("Custom ESLint Rule Loaded: no-use-before-assign");
        const assignedVariables = new Map(); // 直接代入された変数を追跡
        const declaredConstants = new Set();
        const definedFunctions = new Set(); // 定義された関数を追跡
        const allowedGlobalsWithMethods = {
            console: new Set(["log"]),
            Array: new Set(["fill"]),
            Math: new Set(["floor", "random"]),
        };
        const reportedErrors = new Set();
        // 配列リテラルの長さを追跡（静的に判定できる場合のみ）
        const arrayLengths = new Map();
        return {
            VariableDeclarator(node) {
                if (node.id && node.id.type === "Identifier") {
                    assignedVariables.set(node.id.name, "other");
                    // 配列リテラルで初期化されている場合に長さを記録
                    if (node.init && node.init.type === "ArrayExpression") {
                        arrayLengths.set(node.id.name, (node.init.elements || []).length);
                    } else {
                        // リテラル以外で初期化されたら既知の配列情報をクリア
                        if (arrayLengths.has(node.id.name)) arrayLengths.delete(node.id.name);
                    }
                }
                // 関数式（変数に代入された関数）を追跡
                if (
                    node.init &&
                    (node.init.type === "FunctionExpression" ||
                        node.init.type === "ArrowFunctionExpression") &&
                    node.id &&
                    node.id.name
                ) {
                    definedFunctions.add(node.id.name);

                    // 関数引数を追跡
                    if (node.init.params) {
                        node.init.params.forEach((param) => {
                            if (param.type === "Identifier") {
                                assignedVariables.set(param.name, "other");
                            }
                        });
                    }
                }
            },
            VariableDeclaration(node) {
                node.declarations.forEach(declaration => {
                    if (declaration.id.type === 'Identifier') {
                        if (node.kind === 'const') {
                            if (assignedVariables.has(declaration.id.name)) {
                                context.report({
                                    node: declaration.id,
                                    messageId: "constAlreadyExists",
                                    data: { name: declaration.id.name }
                                });
                            }
                            // 定数の重複チェック
                            if (declaredConstants.has(declaration.id.name)) {
                                context.report({
                                    node: declaration.id,
                                    messageId: "constantReassignment",
                                    data: { name: declaration.id.name }
                                });
                            } else {
                                declaredConstants.add(declaration.id.name);
                            }
                        }
                        assignedVariables.set(declaration.id.name, "other");
                    }
                });
            },
            FunctionDeclaration(node) {
                // 関数宣言を追跡
                if (node.id && node.id.name) {
                    definedFunctions.add(node.id.name);
                }

                // 関数引数を追跡
                if (node.params) {
                    node.params.forEach((param) => {
                        if (param.type === "Identifier") {
                            assignedVariables.set(param.name, "other");
                        }
                    });
                }
            },
            AssignmentExpression(node) {
                // 直接代入を許可
                if (node.left.type === "Identifier") {
                    // 定数への代入をチェック
                    if (declaredConstants.has(node.left.name)) {
                        context.report({
                            node: node.left,
                            messageId: "constantReassignment",
                            data: { name: node.left.name }
                        });
                        return;
                    }

                    if (node.right.type === "ArrayExpression") {
                        assignedVariables.set(node.left.name, "array"); // 配列が代入された場合
                        arrayLengths.set(node.left.name, (node.right.elements || []).length);
                    } else {
                        assignedVariables.set(node.left.name, "other");
                        if (arrayLengths.has(node.left.name)) arrayLengths.delete(node.left.name);
                    }
                    context.markVariableAsUsed(node.left.name);
                }
                // if (node.left.type === "Identifier") {
                //     assignedVariables.add(node.left.name); // 追跡リストに追加
                //     context.markVariableAsUsed(node.left.name);
                // }
            },

            // MemberExpression を監視して定数インデックスによる範囲外アクセスを検出
            MemberExpression(node) {
                // computed === true で括弧付きアクセス（a[0]）を扱う
                if (node.computed && node.object && node.object.type === 'Identifier' && node.property) {
                    const objName = node.object.name;
                    // インデックスがリテラル数値の場合のみ静的判定
                    if (node.property.type === 'Literal' && typeof node.property.value === 'number') {
                        const idx = node.property.value;
                        if (arrayLengths.has(objName)) {
                            const len = arrayLengths.get(objName);
                            // 整数でない、負、もしくは範囲外なら報告
                            if (!Number.isInteger(idx) || idx < 0 || idx >= len) {
                                const key = `${objName}::${idx}::oob`;
                                if (!reportedErrors.has(key)) {
                                    context.report({
                                        node: node.property,
                                        messageId: "arrayIndexOOB",
                                        data: { name: objName, index: String(idx), length: String(len) }
                                    });
                                    reportedErrors.add(key);
                                }
                            }
                        }
                    }
                }
            },

            Identifier(node) {
                const parent = node.parent;

                // 変数宣言時の識別子は除外
                if (
                    parent &&
                    parent.type === "VariableDeclarator" &&
                    parent.id === node
                ) {
                    return;
                }

                // 左辺での使用（代入時）は除外
                if (
                    parent &&
                    parent.type === "AssignmentExpression" &&
                    parent.left === node
                ) {
                    return;
                }

                // 特定のグローバルオブジェクトのメソッドを許可
                if (
                    parent &&
                    parent.type === "MemberExpression" &&
                    parent.property.type === "Identifier" &&
                    allowedGlobalsWithMethods[parent.object.name]?.has(parent.property.name)
                ) {
                    return;
                }
                // プロパティアクセス (e.g., a.fill) の場合
                if (parent && parent.type === "MemberExpression") {
                    // 安全に object/property 名を取り出す
                    const objectIsIdentifier = parent.object && parent.object.type === 'Identifier';
                    const propertyIsIdentifier = parent.property && parent.property.type === 'Identifier';
                    const objectName = objectIsIdentifier ? parent.object.name : null;
                    const propertyName = propertyIsIdentifier ? parent.property.name : null;

                    // 'fill' のような許容メソッドは無視
                    if (propertyName === "fill") return;

                    // オブジェクトが識別子でない場合はここでの判定対象外
                    if (!objectName) return;

                    // まだその変数が「既知の型」として追跡されていない（後で代入される可能性がある）場合は
                    // 「配列ではない」エラーを出さずに use-before-declaration 側のエラーに任せる。
                    if (assignedVariables.has(objectName)) {
                        // 追跡中で配列なら問題なし
                        if (assignedVariables.get(objectName) === "array") return;

                        // 追跡中かつ配列でない -> エラーを報告
                        const errorKey = `${objectName}.${propertyName || '<prop>'}`;
                        if (!reportedErrors.has(errorKey)) {
                            context.report({
                                node,
                                message: "'{{name}}' は配列ではないため使えません",
                                data: { name: objectName }
                            });
                            reportedErrors.add(errorKey);
                        }
                    }
                }

                // 許可されたグローバル変数はスキップ
                if (Object.keys(allowedGlobalsWithMethods).includes(node.name)) {
                    return;
                }

                // 定義された関数の使用を許可
                if (definedFunctions.has(node.name)) {
                    return;
                }

                // 定義済みの変数（直接代入や関数引数）を許可
                if (assignedVariables.has(node.name)) {
                    return;
                }

                // 関数スコープ内で後に定義される関数宣言を許可
                const scope = context.getScope();
                const variable = scope.set.get(node.name);
                if (variable && variable.defs.some((def) => def.type === "FunctionName")) {
                    return;
                }

                // 未定義の変数かどうかをチェック
                context.report({
                    node,
                    messageId: "useBeforeDeclaration",
                    data: { name: node.name },
                });
            },
        };
    },
};
