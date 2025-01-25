import { NextRequest, NextResponse } from 'next/server';
import { ESLint } from 'eslint';
import stripAnsi from 'strip-ansi';

export async function POST(req: NextRequest) {
    const { code } = await req.json();
    const eslint = new ESLint();

    try {
        console.log(code);
        // 変数定義をコードの先頭に追加
        // const predefinedVariables = `var a, b;\n`;
        // const modifiedCode = predefinedVariables + code;
        const results = await eslint.lintText(code);
        // const formatter = await eslint.loadFormatter('./eslint/formatters/custom-formatter.js');
        // カスタムフォーマッターを直接実装
        const customFormatter = (results: ESLint.LintResult[]): string => {
            return results
                .map((result) => {
                    return result.messages
                        .map((message) => message.message) // メッセージのみを取得
                        .join('\n');
                })
                .join('\n');
        };
        // const formatter = await eslint.loadFormatter('stylish');
        //formatの第2引数にオブジェクトを入れないと警告が出るので，適当なものを作成して代用
        // const lintResultData: ESLint.LintResultData = {
        //     // 現在の作業ディレクトリ 
        //     cwd: process.cwd(),
        //     rulesMeta: {}
        // };
        // フォーマッターを適用
        const resultText = customFormatter(results);
        // const resultText = await formatter.format(results, lintResultData);


        //ESLint のフォーマッタが出力する結果に ANSI エスケープコード（色やスタイルをつけるための制御文字）が含まる
        //ANSI コードを適切に処理しないと文字化けのように見える
        const cleanResultText = stripAnsi(resultText);

        console.log(cleanResultText)

        // 不要な部分を削除し、必要な情報のみを整形
        const formattedResults = cleanResultText.split('\n')
            .filter(line => !line.startsWith('<text>') && !line.startsWith('✖'))
            .filter(line => line.trim().length > 0) // 空行を除去
            .map(line => {
                // 先頭の行番号とerror、@以降の部分を削除
                const cleanedLine = line.replace(/^\s*(\d+)+:\d+\s+error\s*/, '$1行目:')
                    // @以降の部分（ファイルのパスなど）を削除
                    .replace(/\s*@.*$/, '');
                return cleanedLine.trim();
            });

        return NextResponse.json(
            { resultText: formattedResults.join('\n') },
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
            { error: errorMessage },
            {
                status: 500,
                headers: {
                    'Content-Type': 'application/json; charset=utf-8',
                },
            }
        );
    }
}
