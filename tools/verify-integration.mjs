// Browser -> production PWA -> actual Spring Boot -> SQLite, using disposable data.
import assert from 'node:assert/strict';
import { spawn } from 'node:child_process';
import { once } from 'node:events';
import { mkdir, mkdtemp, readFile, writeFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

assert(process.env.GORILLA_TEST_PLAYWRIGHT, 'Set GORILLA_TEST_PLAYWRIGHT to playwright-core/index.mjs');
assert(process.env.GORILLA_BACKEND_JAR, 'Set GORILLA_BACKEND_JAR to the packaged Spring Boot backend');
const { chromium } = await import(pathToFileURL(process.env.GORILLA_TEST_PLAYWRIGHT));
const directory = await mkdtemp(path.join(tmpdir(), 'gorilla-frontend-integration-'));
const output = path.resolve('docs/evidence/controller-integration-2026-11-05');
await mkdir(output, { recursive: true });
const backend = spawn(process.env.JAVA_HOME ? path.join(process.env.JAVA_HOME, 'bin/java.exe') : 'java', [
  '-jar', process.env.GORILLA_BACKEND_JAR, '--server.address=127.0.0.1', '--server.port=0',
  '--gorilla.storage.directory=' + directory,
], { stdio: ['ignore', 'pipe', 'pipe'] });
let ui, browser;
const errors = [];
const report = { scope: 'Production PWA + real Spring Boot/SQLite, desktop Chromium', passed: false,
  notVerified: ['Physical phone', 'Unity gameplay', 'Real sensors/WebRTC', 'LAN/HTTPS'] };
async function stop(child) {
  if (child && child.exitCode === null) { const ended = once(child, 'exit'); child.kill(); await ended; }
}
try {
  const backendPort = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('Backend startup timed out')), 60000);
    backend.once('error', error => { clearTimeout(timer); reject(error); });
    backend.stdout.on('data', bytes => {
      const match = bytes.toString().match(/Tomcat started on port (\d+)/);
      if (match) { clearTimeout(timer); resolve(match[1]); }
    });
  });
  ui = spawn(process.execPath, ['tools/serve-pwa.mjs'], {
    env: { ...process.env, LAB_PORT: '0', PLAYERS_PORT: backendPort }, stdio: ['ignore', 'pipe', 'pipe'],
  });
  const origin = await new Promise((resolve, reject) => {
    const timer = setTimeout(() => reject(Error('PWA startup timed out')), 10000);
    ui.once('error', error => { clearTimeout(timer); reject(error); });
    ui.stdout.on('data', bytes => {
      const match = bytes.toString().match(/http:\/\/127\.0\.0\.1:\d+/);
      if (match) { clearTimeout(timer); resolve(match[0]); }
    });
  });
  browser = await chromium.launch({ executablePath: process.env.GORILLA_TEST_CHROME, headless: true });
  const context = await browser.newContext({ viewport: { width: 390, height: 844 }, serviceWorkers: 'allow' });
  const page = await context.newPage();
  page.on('pageerror', error => errors.push(error.message));
  await page.goto(origin + '/', { waitUntil: 'networkidle' });
  await page.locator('.connection-panel').waitFor();
  assert.match(await page.title(), /Control/);
  assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
  await page.screenshot({ path: path.join(output, 'controller-entry.png'), fullPage: true });
  await page.evaluate(async () => {
    await navigator.serviceWorker.ready;
    if (!navigator.serviceWorker.controller) await new Promise(resolve => navigator.serviceWorker.addEventListener('controllerchange', resolve, { once: true }));
  });
  await page.goto(origin + '/lab.html', { waitUntil: 'networkidle' });
  await page.getByRole('status').filter({ hasText: 'Consulta confirmada: HTTP 200' }).waitFor();
  await page.locator('#display-name').fill('Jugador Integracion PWA');
  await page.getByRole('button', { name: 'Registrar jugador' }).click();
  await page.getByRole('status').filter({ hasText: 'Registro confirmado: HTTP 201' }).waitFor();
  await page.getByRole('button', { name: 'Actualizar listado' }).click();
  await page.locator('ul.players li').filter({ hasText: 'Jugador Integracion PWA' }).waitFor();
  const players = await (await fetch(origin + '/api/players')).json();
  assert.equal(players.items.filter(player => player.displayName === 'Jugador Integracion PWA').length, 1);
  const sqliteHeader = await readFile(path.join(directory, 'players.sqlite'));
  assert.equal(sqliteHeader.subarray(0, 16).toString(), 'SQLite format 3\0');
  await page.screenshot({ path: path.join(output, 'lab-persisted-player.png'), fullPage: true });
  await context.setOffline(true);
  await page.reload({ waitUntil: 'networkidle' });
  await page.locator('ul.players li').filter({ hasText: 'Jugador Integracion PWA' }).waitFor();
  await page.screenshot({ path: path.join(output, 'lab-offline.png'), fullPage: true });
  await page.goto(origin + '/index.html', { waitUntil: 'networkidle' });
  await page.locator('.connection-panel').waitFor();
  report.offlineShells = ['lab.html with IndexedDB snapshot', 'index.html controller'];
  await context.setOffline(false);
  await page.route('https://jsonplaceholder.typicode.com/**', route => route.fulfill({ json: [] }));
  await page.goto(origin + '/demo.html', { waitUntil: 'networkidle' });
  await page.getByRole('note').filter({ hasText: 'Demo histórica' }).waitFor();
  assert.deepEqual(errors, []);
  report.realPlayerRows = 1;
  report.sqliteHeaderVerified = true;
  report.pageErrors = errors;
  report.passed = true;
  console.log('PASS production controller, real player POST/GET/SQLite, offline reloads, legacy demo, no page errors');
} finally {
  if (browser) await browser.close();
  await stop(ui);
  await stop(backend);
  await writeFile(path.join(output, 'browser-integration.json'), JSON.stringify(report, null, 2) + '\n');
  assert(path.resolve(directory).startsWith(path.resolve(tmpdir()) + path.sep));
  assert(path.basename(directory).startsWith('gorilla-frontend-integration-'));
  await rm(directory, { recursive: true, force: true });
}
