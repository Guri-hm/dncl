import { NextRequest, NextResponse } from 'next/server';
import { ESLint } from 'eslint';
import stripAnsi from 'strip-ansi';

// ベースパスを環境変数から取得
const basePath = process.env.NEXT_PUBLIC_BASE_PATH || '';
const eslintrcPath = `${basePath}/.eslintrc.js`;

export async function POST(req: NextRequest) {
    const { code } = await req.json();
    // const eslint = new ESLint();
    const eslint = new ESLint({ overrideConfigFile: '.eslintrc.js' }); // 設定ファイルを指定

    try {
        // let test = "a = [1, 2, 4, 5];\nconsole.log(a);\na.fill(a[2]);"
        // console.log(test);
        // 変数定義をコードの先頭に追加
        // const predefinedVariables = `var a, b;\n`;
        // const modifiedCode = predefinedVariables + code;
        const results = await eslint.lintText(code);
        // const formatter = await eslint.loadFormatter('./eslint/formatters/custom-formatter.js');
        // カスタムフォーマッターを直接実装
        const customFormatter = (results: ESLint.LintResult[]): { lineNumbers: number[], messages: string[] } => {
            const lineNumbers: number[] = [];
            const messages: string[] = [];

            results.forEach(result => {
                result.messages.forEach(message => {
                    const lineNumber = message.line; // 行番号を取得
                    lineNumbers.push(lineNumber);  // 行番号を追加
                    messages.push(message.message);  // エラーメッセージを追加
                });
            });

            return { lineNumbers, messages };
        };
        // const formatter = await eslint.loadFormatter('stylish');
        //formatの第2引数にオブジェクトを入れないと警告が出るので，適当なものを作成して代用
        // const lintResultData: ESLint.LintResultData = {
        //     // 現在の作業ディレクトリ 
        //     cwd: process.cwd(),
        //     rulesMeta: {}
        // };
        // フォーマッターを適用
        const { lineNumbers, messages } = customFormatter(results);
        // const resultText = await formatter.format(results, lintResultData);


        //ESLint のフォーマッタが出力する結果に ANSI エスケープコード（色やスタイルをつけるための制御文字）が含まる
        //ANSI コードを適切に処理しないと文字化けのように見える
        const cleanMessages = messages.map(message => stripAnsi(message));

        // 不要な部分を削除し、必要な情報のみを整形
        // const formattedResults = cleanResultText.split('\n')
        //     .filter(line => !line.startsWith('<text>') && !line.startsWith('✖'))
        //     .filter(line => line.trim().length > 0) // 空行を除去
        //     .map(line => {
        //         // 先頭の行番号とerror、@以降の部分を削除
        //         const cleanedLine = line.replace(/^\s*(\d+)+:\d+\s+error\s*/, '$1行目:')
        //             // @以降の部分（ファイルのパスなど）を削除
        //             .replace(/\s*@.*$/, '');
        //         return cleanedLine.trim();
        //     });

        return NextResponse.json(
            { lineNumbers, messages: cleanMessages },
            {
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
            }
        );
    } catch (error) {
        // 型アサーションで Error 型にキャスト
        const errorMessage = (error as Error).message;
        return NextResponse.json(
            { error: [errorMessage] },
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
            }
        );
    }
}
