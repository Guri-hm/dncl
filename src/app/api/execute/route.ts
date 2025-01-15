import { NextRequest, NextResponse } from 'next/server';
import vm from 'vm';

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
        return NextResponse.json({ error: (error as Error).message }, { status: 500 });
    }
}

export async function OPTIONS() {
    return NextResponse.json(null, {
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}
