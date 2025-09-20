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
            return NextResponse.json(
                {
                    error: 'Invalid input'
                },
                {
                    status: 400,
                    headers: {
                        'Access-Control-Allow-Origin': allowedOrigin,
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                });
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

        return NextResponse.json(
            { result: output.trim() },
            {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': allowedOrigin,
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
            }
        );
    } catch (error) {
        const err = error as Error;
        const errorMessage = err.message || 'エラーが発生しました';
        const lineNumberMatch = err.stack?.split('\n')[0].match(/:(\d+)$/);
        let responseMessage = errorMessage;

        if (errorMessage.includes('Script execution timed out')) {
            responseMessage = '無限ループが生じています';
        } else if (error instanceof SyntaxError) {
            responseMessage = '構文エラーが発生しました';
        } else if (error instanceof ReferenceError) {
            responseMessage = '参照エラーが発生しました';
        }

        // サンドボックス実行由来と判断できるか（上記判定を基に判定）
        const isSandboxError = (
            errorMessage.includes('Script execution timed out') ||
            err instanceof SyntaxError ||
            err instanceof ReferenceError ||
            /Unexpected token|Unexpected end of input|is not defined|Cannot read properties of/.test(errorMessage)
        );

        if (isSandboxError) {
            type SandboxErrorBody = {
                sandboxError: true;
                error: string;
                line?: number;
            };
            const body: SandboxErrorBody = {
                sandboxError: true,
                error: responseMessage
            };
            if (lineNumberMatch) body.line = Number(lineNumberMatch[1]);

            return NextResponse.json(body, {
                status: 200,
                headers: {
                    'Access-Control-Allow-Origin': allowedOrigin,
                    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                },
            });
        }

        // 本当のサーバ内部エラーは従来通り 500 を返す
        if (lineNumberMatch) {
            return NextResponse.json(
                { error: responseMessage, line: lineNumberMatch[1] },
                {
                    status: 500,
                    headers: {
                        'Access-Control-Allow-Origin': allowedOrigin,
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                }
            );
        } else {
            return NextResponse.json(
                { error: responseMessage },
                {
                    status: 500,
                    headers: {
                        'Access-Control-Allow-Origin': allowedOrigin,
                        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
                        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
                    },
                }
            );

        }
    }
}
