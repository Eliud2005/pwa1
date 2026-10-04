// ============================================
// Service Worker - Coffee PWA
// ============================================

const CACHE_NAME = 'coffee-pwa-v1';

const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './offline.html',
  './manifest.json',
  './css/style.css',
  './js/app.js',
  // Iconos PWA
  './img/icons/icon-72x72.png',
  './img/icons/icon-96x96.png',
  './img/icons/icon-128x128.png',
  './img/icons/icon-144x144.png',
  './img/icons/icon-152x152.png',
  './img/icons/icon-192x192.png',
  './img/icons/icon-384x384.png',
  './img/icons/icon-512x512.png',
  // Imágenes de cafés
  './img/coffee1.jpg',
  './img/coffee2.jpg',
  './img/coffee3.jpg',
  './img/coffee4.jpg',
  './img/coffee5.jpg',
  './img/coffee6.jpg',
  './img/coffee7.jpg',
  './img/coffee8.jpg',
  './img/coffee9.jpg',
  './img/coffee10.jpg'
];

// ============================================
// INSTALL: precachear recursos
// ============================================
self.addEventListener('install', (event) => {
  console.log('[SW] Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[SW] Cacheando assets');
        return cache.addAll(ASSETS_TO_CACHE);
      })
      .then(() => self.skipWaiting())
  );
});

// ============================================
// ACTIVATE: limpiar cachés antiguas
// ============================================
self.addEventListener('activate', (event) => {
  console.log('[SW] Activando...');
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => {
            console.log('[SW] Eliminando caché antigua:', name);
            return caches.delete(name);
          })
      );
    }).then(() => self.clients.claim())
  );
});

// ============================================
// FETCH: Cache First con revalidación en background
// ============================================
self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET') return;
  if (!event.request.url.startsWith(self.location.origin)) return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        // Actualiza en segundo plano (stale-while-revalidate)
        event.waitUntil(
          fetch(event.request)
            .then((networkResponse) => {
              if (networkResponse && networkResponse.status === 200) {
                caches.open(CACHE_NAME).then((cache) => {
                  cache.put(event.request, networkResponse.clone());
                });
              }
            })
            .catch(() => {})
        );
        return cachedResponse;
      }

      return fetch(event.request)
        .then((networkResponse) => {
          if (
            networkResponse &&
            networkResponse.status === 200 &&
            networkResponse.type === 'basic'
          ) {
            const responseToCache = networkResponse.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return networkResponse;
        })
        .catch(() => {
          // Fallback a offline.html si es navegación
          if (event.request.mode === 'navigate') {
            return caches.match('./offline.html');
          }
        });
    })
  );
});

// ============================================
// MESSAGE: skipWaiting desde la app
// ============================================
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});