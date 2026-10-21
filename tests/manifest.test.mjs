import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('PWA manifest has installable app basics', () => {
  const manifest = JSON.parse(readFileSync(new URL('../manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.display, 'standalone');
  assert.equal(typeof manifest.name, 'string');
  assert.ok(manifest.name.trim().length > 0);
  assert.equal(manifest.start_url, '/');
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length >= 2);
  assert.ok(manifest.icons.every((icon) => typeof icon.src === 'string' && icon.src.startsWith('/')));
});

test('PWA shell assets exist in the source tree', () => {
  assert.ok(existsSync(new URL('../index.html', import.meta.url)));
  assert.ok(existsSync(new URL('../sw.js', import.meta.url)));
  assert.ok(existsSync(new URL('../src/App.jsx', import.meta.url)));
});

test('NPM scripts expose a reproducible build', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.equal(typeof pkg.scripts?.build, 'string');
  assert.ok(pkg.scripts.build.includes('vite'));
});
