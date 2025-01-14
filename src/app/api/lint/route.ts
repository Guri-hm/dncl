import { NextRequest, NextResponse } from 'next/server';
import { ESLint } from 'eslint';
import stripAnsi from 'strip-ansi';

export async function POST(req: NextRequest) {
    const { code } = await req.json();
    const eslint = new ESLint();

    try {

        const results = await eslint.lintText(code);
        const formatter = await eslint.loadFormatter('stylish');
        //formatの第2引数にオブジェクトを入れないと警告が出るので，適当なものを作成して代用
        const lintResultData: ESLint.LintResultData = {
            // 現在の作業ディレクトリ 
            cwd: process.cwd(),
            rulesMeta: {}
        };
        const resultText = await formatter.format(results, lintResultData);

        //ESLint のフォーマッタが出力する結果に ANSI エスケープコード（色やスタイルをつけるための制御文字）が含まる
        //ANSI コードを適切に処理しないと文字化けのように見える
        const cleanResultText = stripAnsi(resultText);

        return NextResponse.json(
            { resultText: cleanResultText },
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
