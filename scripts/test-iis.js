const assert = require('node:assert/strict');
const net = require('node:net');
const { spawn } = require('node:child_process');
const path = require('node:path');

async function unusedPort() {
  const server = net.createServer();
  await new Promise((resolve, reject) => {
    server.once('error', reject);
    server.listen(0, '127.0.0.1', resolve);
  });
  const port = server.address().port;
  await new Promise((resolve, reject) => server.close(error => error ? reject(error) : resolve()));
  return port;
}

async function main() {
  const port = await unusedPort();
  const env = { ...process.env, BUILD_TARGET: 'iis' };
  delete env.ESLINT_MODE;
  const server = spawn(process.execPath, [
    path.join(__dirname, '..', 'node_modules', 'next', 'dist', 'bin', 'next'),
    'start', '-p', String(port),
  ], { cwd: path.join(__dirname, '..'), env, stdio: ['ignore', 'pipe', 'pipe'] });
  let output = '';
  server.stdout.on('data', data => { output += data; });
  server.stderr.on('data', data => { output += data; });

  const base = `http://127.0.0.1:${port}/next/dncl`;
  const origin = 'https://dncl.solopg.com';
  try {
    const deadline = Date.now() + 30000;
    let ready = false;
    while (Date.now() < deadline) {
      if (server.exitCode !== null) throw new Error(`Next.js exited:\n${output}`);
      try {
        await fetch(base);
        ready = true;
        break;
      } catch {
        await new Promise(resolve => setTimeout(resolve, 250));
      }
    }
    if (!ready) throw new Error(`Next.js did not start:\n${output}`);

    for (const route of ['', '/', '/edit', '/chlng', '/chlng/predict', '/apiary']) {
      const response = await fetch(`${base}${route}`);
      assert.equal(response.status, 404, route || '<base path>');
      assert.deepEqual(await response.json(), { error: 'Not Found' }, route);
    }

    for (const options of [{ method: 'POST' }, { headers: { RSC: '1' } }]) {
      const response = await fetch(`${base}/edit`, options);
      assert.equal(response.status, 404);
      assert.deepEqual(await response.json(), { error: 'Not Found' });
    }

    for (const route of ['/api/execute', '/api/lint']) {
      const response = await fetch(`${base}${route}`, {
        method: 'OPTIONS',
        headers: {
          Origin: origin,
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'content-type',
        },
      });
      assert.equal(response.status, 200, route);
      assert.equal(response.headers.get('access-control-allow-origin'), origin, route);
      assert.match(response.headers.get('access-control-allow-methods'), /POST/i);
      assert.match(response.headers.get('access-control-allow-headers'), /content-type/i);
      const get = await fetch(`${base}${route}`);
      assert.equal(get.status, 405, route);
    }

    async function post(route, body) {
      const response = await fetch(`${base}${route}`, {
        method: 'POST',
        headers: { Origin: origin, 'Content-Type': 'application/json' },
        body,
      });
      assert.equal(response.headers.get('access-control-allow-origin'), origin, route);
      return response;
    }

    let response = await post('/api/execute', JSON.stringify({ code: 'console.log("hello");' }));
    assert.equal(response.status, 200);
    assert.deepEqual(await response.json(), { result: 'hello' });

    response = await post('/api/execute', JSON.stringify({ code: 123 }));
    assert.equal(response.status, 400);

    response = await post('/api/lint', JSON.stringify({ code: 'sum = sum + 1;' }));
    assert.equal(response.status, 200);
    const lint = await response.json();
    assert.ok(lint.messages.some(message => message.includes('sum')));
    assert.ok(lint.lineNumbers.includes(1));

    response = await post('/api/lint', '{');
    assert.equal(response.status, 500);
    assert.ok((await response.json()).error);
    console.log('IIS routing, APIs, custom lint rule and CORS checks passed.');
  } finally {
    server.kill();
  }
}

main().catch(error => {
  console.error(error);
  process.exitCode = 1;
});
