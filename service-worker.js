// Bumped on every deploy to force re-cache. Old caches are deleted on activate.
const CACHE_NAME = 'busway-pro-v3';
const PRECACHE = ['/offline.html'];

const isNavigation = (request) =>
  request.mode === 'navigate' ||
  (request.method === 'GET' && (request.headers.get('accept') || '').includes('text/html'));

const isHashedAsset = (url) => /\/assets\/[^/]+\.[a-zA-Z0-9]{6,}\.(js|css|png|jpg|svg|woff2?)$/i.test(url.pathname);

self.addEventListener('install', (event) => {
  // New SW takes over the page on next load
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(PRECACHE).catch((err) => {
        console.warn('[SW] Precache failed', err);
      })
    )
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const request = event.request;
  let url;
  try { url = new URL(request.url); } catch { return; }

  // Skip cross-origin and non-GET — let browser handle them.
  if (url.origin !== self.location.origin || request.method !== 'GET') return;

  // Navigation / HTML: NETWORK-FIRST so deploys are picked up immediately.
  // Falls back to cached index.html / offline.html only when offline.
  if (isNavigation(request)) {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          return resp;
        })
        .catch(() =>
          caches.match(request).then((cached) => cached || caches.match('/offline.html'))
        )
    );
    return;
  }

  // Hashed assets (filenames include a content hash) are immutable —
  // cache-first is safe and fastest.
  if (isHashedAsset(url)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((resp) => {
          if (resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
          }
          return resp;
        });
      })
    );
    return;
  }

  // Everything else (manifest.json, favicon, /api/* paths, etc.):
  // network-first with cache fallback so we never serve stale data.
  event.respondWith(
    fetch(request)
      .then((resp) => {
        if (resp.ok) {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy)).catch(() => {});
        }
        return resp;
      })
      .catch(() => caches.match(request).then((cached) => cached || new Response('', { status: 503 })))
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'BusWay Pro', body: 'New Alert' };
  const options = {
    body: data.body,
    icon: '/logo192.png',
    badge: '/favicon.ico',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' },
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

// Allow the page to trigger an immediate update via postMessage.
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});
