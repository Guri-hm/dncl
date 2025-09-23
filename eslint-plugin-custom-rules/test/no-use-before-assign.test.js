const { RuleTester } = require("eslint");
const rule = require("../lib/rules/no-use-before-assign");

const ruleTester = new RuleTester({
    parserOptions: { ecmaVersion: 2020, sourceType: "module" },
});

ruleTester.run("no-use-before-assign", rule, {
    valid: [
        // 既存...
        "Ten = [30, 8]; console.log(Ten[1]);",
        "let x = 1; console.log(x);",
        "function f(){} f();",

        // 追加: 先に代入してから使うケースは有効
        "sum = 2; sum = sum + 1;",
        "const a = 2;",
        // 追加: 配列アクセスで index が変数の場合は静的判定しない（エラー出さない）
        "Ten = [1]; const i = 0; console.log(Ten[i]);",
        // 追加: 関数宣言はホイスティングされて問題なし
        "foo(); function foo() { return 1; }",
    ],
    invalid: [
        // 既存...
        {
            code: "console.log(Ten); Ten = [1,2];",
            errors: [{ messageId: "useBeforeDeclaration" }],
        },
        {
            code: "Ten = [30,8]; console.log(Ten[4]);",
            errors: [{ messageId: "arrayIndexOOB" }],
        },
        {
            code: "console.log(Ten[0]); Ten = [1];",
            errors: [{ messageId: "useBeforeDeclaration" }],
        },
        {
            code: "sum = sum + 1;",
            errors: [{ messageId: "useBeforeDeclaration" }],
        },

        // 追加: let の TDZ（宣言より前の使用でエラー期待）
        {
            code: "console.log(b); let b = 1;",
            errors: [{ messageId: "useBeforeDeclaration" }],
        },
        // 追加: var ホイスティングをエラー扱いにしたい場合のテスト（意図によって期待を変える）
        // もし var を許容するならこのテストを invalid から valid に移してください
        {
            code: "console.log(a); var a = 1;",
            errors: [{ messageId: "useBeforeDeclaration" }],
        },
    ],
});