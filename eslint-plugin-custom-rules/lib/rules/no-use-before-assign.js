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
        },
    },
    create(context) {
        const assignedVariables = new Set(); // 直接代入された変数を追跡
        const definedFunctions = new Set(); // 定義された関数を追跡
        const allowedGlobalsWithMethods = {
            console: new Set(["log"]),
            Array: new Set(["fill"]),
        };

        return {
            FunctionDeclaration(node) {
                // 関数宣言を追跡
                if (node.id && node.id.name) {
                    definedFunctions.add(node.id.name);
                }

                // 関数引数を追跡
                if (node.params) {
                    node.params.forEach((param) => {
                        if (param.type === "Identifier") {
                            assignedVariables.add(param.name);
                        }
                    });
                }
            },
            VariableDeclarator(node) {
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
                                assignedVariables.add(param.name);
                            }
                        });
                    }
                }
            },
            AssignmentExpression(node) {
                // 直接代入を許可
                if (node.left.type === "Identifier") {
                    assignedVariables.add(node.left.name); // 追跡リストに追加
                    context.markVariableAsUsed(node.left.name);
                }
            },
            Identifier(node) {
                const parent = node.parent;

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
                // assignedVariables に含まれている場合、配列であればメソッド呼び出しを許可
                if (
                    parent &&
                    parent.type === "MemberExpression" &&
                    parent.property.type === "Identifier" &&
                    parent.object.type === "Identifier"
                ) {
                    // 変数が assignedVariables に含まれている場合
                    console.log(parent.object.name)
                    console.log(parent.property.name)
                    if (assignedVariables.has(parent.object.name)) {
                        // 配列かどうかチェックする方法が不明なので，メソッドが配列で許可するメソッドかで判定することにした
                        if (allowedGlobalsWithMethods.Array.has(parent.property.name)) {
                            return;
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
