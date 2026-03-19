const CACHE_NAME = 'busway-pro-v3';

// Static assets safe to cache (they have content-hash in filename, so never go stale)
const PRECACHE_ASSETS = [
  '/offline.html',
  '/icon.svg',
  '/manifest.json'
];

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(PRECACHE_ASSETS).catch((err) => {
        console.warn('[SW] Pre-cache failed:', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // ── 1. Non-GET: skip SW entirely ─────────────────────────────────────────
  if (request.method !== 'GET') return;

  // ── 2. Cross-origin (fonts, CDN, Supabase API): network only ─────────────
  if (url.origin !== self.location.origin) {
    event.respondWith(fetch(request).catch(() => new Response('', { status: 503 })));
    return;
  }

  // ── 3. HTML navigation (the app shell): NETWORK FIRST, never serve stale HTML ──
  // This prevents the white screen caused by cached HTML referencing old JS bundles.
  if (request.mode === 'navigate' || request.headers.get('accept')?.includes('text/html')) {
    event.respondWith(
      fetch(request)
        .then((res) => res)
        .catch(() => caches.match('/offline.html').then((r) => r || new Response('Offline', { status: 503 })))
    );
    return;
  }

  // ── 4. Hashed static assets (JS/CSS bundles, images): cache first ────────
  // Vite adds content hashes to filenames, so cached versions are always valid.
  if (url.pathname.startsWith('/assets/') || /\.(js|css|woff2?|ttf|png|svg|ico)$/.test(url.pathname)) {
    event.respondWith(
      caches.match(request).then((cached) => {
        if (cached) return cached;
        return fetch(request).then((res) => {
          if (res.ok) {
            caches.open(CACHE_NAME).then((cache) => {
              try { cache.put(request, res.clone()); } catch (_) { /* quota guard */ }
            });
          }
          return res;
        }).catch(() => caches.match('/offline.html').then((r) => r || new Response('', { status: 503 })));
      })
    );
    return;
  }

  // ── 5. Everything else: network only ─────────────────────────────────────
  event.respondWith(
    fetch(request).catch(() => caches.match('/offline.html').then((r) => r || new Response('', { status: 503 })))
  );
});

self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : { title: 'BusWay Pro', body: 'New Alert' };
  const options = {
    body: data.body,
    icon: '/icon.svg',
    badge: '/icon.svg',
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  };
  event.waitUntil(self.registration.showNotification(data.title, options));
});

self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data.url));
});

