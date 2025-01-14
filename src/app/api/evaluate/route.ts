import { NextRequest, NextResponse } from 'next/server';
import ivm from 'isolated-vm';

export async function POST(req: NextRequest) {
    try {
        const { code } = await req.json();

        if (typeof code !== 'string') {
            return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
        }

        let isolate = new ivm.Isolate({ memoryLimit: 128 });
        let context = await isolate.createContext();
        let jail = context.global;
        await jail.set('global', jail.derefInto());
        const script = await isolate.compileScript(code);
        const result = await script.run(context);

        return NextResponse.json({ result }, { status: 200 });
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
