const { RuleTester } = require("eslint");
const rule = require("../lib/rules/no-use-before-assign");

const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 2020, sourceType: "module" },
});

ruleTester.run("no-use-before-assign", rule, {
    valid: [
        // 配列を定義して範囲内アクセス
        "Ten = [30, 8]; console.log(Ten[1]);",
        // 変数を先に定義してから利用
        "let x = 1; console.log(x);",
        // 関数宣言は許可
        "function f(){} f();",
    ],
    invalid: [
        {
            // use-before-declaration が検出されるケース
            code: "console.log(Ten); Ten = [1,2];",
            errors: [{ messageId: "useBeforeDeclaration" }],
        },
        {
            // 配列の範囲外アクセス（静的判定：index が定数かつ配列リテラル）
            code: "Ten = [30,8]; console.log(Ten[4]);",
            errors: [{ messageId: "arrayIndexOOB" }],
        },
        {
            // 宣言前にメンバーアクセス -> use-before-declaration が出るべきケース
            code: "console.log(Ten[0]); Ten = [1];",
            errors: [{ messageId: "useBeforeDeclaration" }],
        },
    ],
});