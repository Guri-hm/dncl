import { NextRequest, NextResponse } from 'next/server';
import vm from 'vm';

const allowedOrigin = 'https://dncl.solopg.com';

// OPTIONSリクエストの処理を追加
export async function OPTIONS(request: NextRequest) {

    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': allowedOrigin,
            'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
    });
}

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (typeof code !== 'string') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        let output = '';
        // カスタム console.log を設定 
        const customConsole = {
            log: (...args: unknown[]) => {
                output += args.join(' ') + '\n';
            },
        };

        const context = { console: customConsole };

        vm.createContext(context); // サンドボックスを作成
        vm.runInContext(code, context, { timeout: 1000 }); // コードを実行

        return NextResponse.json({ result: output.trim() }, { status: 200 });
    } catch (error) {
        const errorMessage = (error as Error).message;
        const lineNumberMatch = (error as Error).stack?.split('\n')[0].match(/:(\d+)$/);
        let responseMessage = errorMessage;

        if (errorMessage.includes('Script execution timed out')) {
            responseMessage = '無限ループが生じています';
        } else if (error instanceof SyntaxError) {
            responseMessage = '構文エラーが発生しました';
        } else if (error instanceof ReferenceError) {
            responseMessage = '参照エラーが発生しました';
        }
        if (lineNumberMatch) {
            return NextResponse.json({ error: responseMessage, line: lineNumberMatch[1] }, { status: 500 });
        } else {
            return NextResponse.json({ error: responseMessage }, { status: 500 });

        }
    }
}
