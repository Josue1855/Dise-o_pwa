import test from 'node:test';
import assert from 'node:assert/strict';
import http from 'node:http';
import { spawn } from 'node:child_process';
import { once } from 'node:events';

test('laboratory root redirects to its own entry instead of conflicting with the controller worker', async t => {
  const child = spawn(process.execPath, ['tools/serve-lab.mjs'], {
    env: { ...process.env, LAB_PORT: '0', PWA_ENTRY: '' }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(() => child.kill());
  const origin = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('Lab server did not start')), 8000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.stdout.on('data', bytes => {
      const match = bytes.toString().match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) { clearTimeout(timer); resolve(match[0]); }
    });
  });
  const response = await fetch(origin + '/', { redirect: 'manual' });
  assert.equal(response.status, 302);
  assert.equal(response.headers.get('location'), '/lab.html');
  assert.equal(response.headers.get('cache-control'), 'no-store');
});

test('HTTP proxy routes players and game requests to their separate servers', async t => {
  async function upstream(service) {
    const server = http.createServer(async (req, res) => {
      let body = '';
      for await (const chunk of req) body += chunk;
      res.writeHead(200, { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' });
      res.end(JSON.stringify({ service, path: req.url, method: req.method, body }));
    });
    server.listen(0, '127.0.0.1');
    await once(server, 'listening');
    t.after(() => new Promise(resolve => server.close(resolve)));
    return server.address().port;
  }
  const playersPort = await upstream('players');
  const controlPort = await upstream('control');
  const child = spawn(process.execPath, ['tools/serve-pwa.mjs'], {
    env: { ...process.env, LAB_PORT: '0', PLAYERS_PORT: String(playersPort), CONTROL_PORT: String(controlPort) },
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  t.after(() => child.kill());
  const origin = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('PWA proxy did not start')), 8000);
    child.once('error', error => { clearTimeout(timer); reject(error); });
    child.stdout.on('data', bytes => {
      const match = bytes.toString().match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) { clearTimeout(timer); resolve(match[0]); }
    });
  });
  for (const [path, service, method] of [
    ['/api/players?limit=10&offset=20', 'players', 'GET'],
    ['/api/players', 'players', 'POST'],
    ['/api/health', 'control', 'GET'],
    ['/mobile/name', 'control', 'POST'],
    ['/mobile/reconnect', 'control', 'POST'],
    ['/prepare', 'control', 'GET'],
  ]) {
    const body = method === 'POST' ? '{"fixture":true}' : undefined;
    const response = await fetch(origin + path, { method, body });
    assert.equal(response.status, 200);
    assert.equal(response.headers.get('cache-control'), 'no-store');
    assert.deepEqual(await response.json(), { service, path, method, body: body || '' });
  }
});
