'use strict';
const CACHE = 'jungle-controller-executable-v1';
const SHELL = ['./', './index.html', './profile.js', './manifest.webmanifest', './icon-192.png', './icon-512.png',
  './Fonts/LilitaOne.ttf', './Fonts/NunitoSans.ttf', './Art/leaves.png']
  .map(path => new URL(path, self.registration.scope).pathname);
self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE).then(cache => cache.addAll(SHELL)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', event => {
  event.waitUntil(caches.keys().then(keys => Promise.all(
    keys.filter(key => key.startsWith('jungle-controller-executable-') && key !== CACHE).map(key => caches.delete(key))
  )).then(() => self.clients.claim()));
});
self.addEventListener('fetch', event => {
  const url = new URL(event.request.url);
  if (event.request.method !== 'GET' || url.origin !== self.location.origin || !SHELL.includes(url.pathname)) return;
  // API traffic and room URLs are never stored as offline session data.
  const cacheKey = url.pathname;
  event.respondWith(fetch(event.request).then(response => {
    if (response.ok) {
      const copy = response.clone();
      event.waitUntil(caches.open(CACHE).then(cache => cache.put(cacheKey, copy)));
    }
    return response;
  }).catch(async () => {
    const cached = await caches.match(cacheKey);
    return cached || Response.error();
  }));
});
