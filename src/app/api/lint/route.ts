import { NextRequest, NextResponse } from 'next/server';
import { ESLint } from 'eslint';

export async function GET(req: NextRequest) {
    const eslint = new ESLint();

    const code = `
    function helloWorld() {
        console.log("Hello, World!");
    }
        helloWorl();
    `;

    try {

        const results = await eslint.lintText(code);
        const formatter = await eslint.loadFormatter('stylish');
        console.log(results)
        const resultText = formatter.format(results, {});

        return NextResponse.json({ resultText });
    } catch (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
    }
}
