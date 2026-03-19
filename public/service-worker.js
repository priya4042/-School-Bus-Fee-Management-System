const CACHE_NAME = 'busway-pro-v2';
const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
  '/offline.html'
];

// Only cache same-origin assets. Skip cross-origin (fonts, CDNs).
function isSameOrigin(request) {
  try {
    const url = new URL(request.url);
    return url.origin === self.location.origin;
  } catch (e) {
    return false;
  }
}

self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE).catch((err) => {
        console.warn('[SW] Some assets failed to cache during install', err);
      });
    })
  );
});

self.addEventListener('activate', (event) => {
  // Remove old caches
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  // Prefer cache for same-origin navigations and resources, but handle failures.
  if (!isSameOrigin(event.request)) {
    // For cross-origin requests (fonts, cdn), just attempt network fetch and fail safely.
    event.respondWith(
      fetch(event.request).catch(() => caches.match('/offline.html') || new Response('', { status: 503 }))
    );
    return;
  }

  event.respondWith(
    caches.match(event.request).then((response) => {
      if (response) return response;
      return fetch(event.request).then((networkResp) => {
        // Put a copy in cache for future navigations if it's a GET
        if (event.request.method === 'GET') {
          caches.open(CACHE_NAME).then((cache) => {
            try { cache.put(event.request, networkResp.clone()); } catch (e) { /* ignore */ }
          });
        }
        return networkResp;
      }).catch((err) => {
        console.error('[SW] Fetch failed for', event.request.url, err);
        return caches.match('/offline.html') || new Response('', { status: 503 });
      });
    })
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
