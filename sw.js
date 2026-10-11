const CACHE_NAME = 'gorilimpiadas-v1';
const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/src/main.jsx',
  '/src/App.jsx',
  '/src/AvatarList.jsx',
  '/src/styles.css'
];

// 1. Evento Install: Precaching de recursos estáticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Pre-cacheando recursos de la jungla...');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

// 2. Evento Activate: Limpieza de cachés antiguas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log('[Service Worker] Eliminando caché obsoleta:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// 3. Evento Fetch: Estrategia Stale-While-Revalidate / Cache First con soporte Offline
self.addEventListener('fetch', (event) => {
  // Manejo especial para peticiones API: Network first con fallback a caché
  if (event.request.url.includes('jsonplaceholder.typicode.com')) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          const clonedResponse = response.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, clonedResponse);
          });
          return response;
        })
        .catch(() => {
          return caches.match(event.request).then((cachedResponse) => {
            if (cachedResponse) {
              return cachedResponse;
            }
            return new Response(JSON.stringify([
              { id: 991, name: "Gorila de Rescate (Offline)", username: "Kong_Rescue", email: "kong@jungle.local" },
              { id: 992, name: "Chimpancé Turbo (Offline)", username: "Turbo_Chimp", email: "chimp@jungle.local" }
            ]), {
              headers: { "Content-Type": "application/json" }
            });
          });
        })
    );
    return;
  }

  // Assets locales: Cache First, fallback a Red
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request)
        .then((networkResponse) => {
          if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
            return networkResponse;
          }
          const responseToCache = networkResponse.clone();
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });
          return networkResponse;
        })
        .catch(() => {
          // Si falla y es navegación HTML, retornar la app shell
          if (event.request.mode === 'navigate') {
            return caches.match('/index.html');
          }
        });
    })
  );
});
