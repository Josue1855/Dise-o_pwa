import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync, existsSync } from 'node:fs';

test('published PWA manifest has installable metadata', () => {
  const manifest = JSON.parse(readFileSync(new URL('../public/manifest.json', import.meta.url), 'utf8'));
  assert.equal(manifest.display, 'standalone');
  assert.ok(typeof manifest.name === 'string' && manifest.name.trim());
  assert.ok(['/', '/lab.html'].includes(manifest.start_url));
  assert.ok(Array.isArray(manifest.icons) && manifest.icons.length > 0);
  assert.ok(manifest.icons.every(icon => typeof icon.src === 'string' && icon.src.startsWith('/')));
});

test('React shell, laboratory and generated service-worker tool exist', () => {
  for (const source of ['../index.html', '../lab.html', '../src/App.jsx', '../src/LabApp.jsx', '../tools/build-worker.mjs']) {
    assert.ok(existsSync(new URL(source, import.meta.url)), source);
  }
});

test('Vite build and tests are reproducible from package scripts', () => {
  const pkg = JSON.parse(readFileSync(new URL('../package.json', import.meta.url), 'utf8'));
  assert.ok(pkg.scripts?.build?.includes('vite'));
  assert.ok(pkg.scripts?.test?.includes('node'));
});
