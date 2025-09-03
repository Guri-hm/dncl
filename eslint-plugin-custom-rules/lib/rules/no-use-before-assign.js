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
        },
    },
    create(context) {
        const assignedVariables = new Map(); // 直接代入された変数を追跡
        const declaredConstants = new Set();
        const definedFunctions = new Set(); // 定義された関数を追跡
        const allowedGlobalsWithMethods = {
            console: new Set(["log"]),
            Array: new Set(["fill"]),
        };
        const reportedErrors = new Set();

        return {
            VariableDeclarator(node) {
                if (node.id && node.id.type === "Identifier") {
                    assignedVariables.set(node.id.name, "other");
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
                    } else {
                        assignedVariables.set(node.left.name, "other");
                    }
                    context.markVariableAsUsed(node.left.name);
                }
                // if (node.left.type === "Identifier") {
                //     assignedVariables.add(node.left.name); // 追跡リストに追加
                //     context.markVariableAsUsed(node.left.name);
                // }
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
                    const objectName = parent.object.name;
                    const propertyName = parent.property.name;

                    if (propertyName === "fill") {
                        return; // 'fill' メソッドについてのエラーメッセージが重複しないようにする
                    }

                    // 代入された変数が配列であればメソッド呼び出しを許可
                    if (assignedVariables.has(objectName) && assignedVariables.get(objectName) === "array") {
                        return; // 配列ならメソッド呼び出しを許可
                    }

                    // 配列以外の型であれば、エラーを報告
                    const errorKey = `${objectName}.${propertyName}`;
                    if (!reportedErrors.has(errorKey)) {
                        context.report({
                            node,
                            message: "'{{name}}' は配列ではないため使えません",
                            data: { name: objectName }
                        });
                        reportedErrors.add(errorKey); // エラーメッセージを報告済みとして記録
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
