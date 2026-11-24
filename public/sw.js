const CACHE_NAME = 'blueleaf-static-v2';
const APP_SHELL = ['/', '/index.html', '/favicon.svg', '/manifest.json'];

self.addEventListener('install', event => {
  event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(APP_SHELL)));
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys => Promise.all(
      keys.filter(key => key.startsWith('blueleaf-') && key !== CACHE_NAME).map(key => caches.delete(key)),
    )),
  );
  self.clients.claim();
});

self.addEventListener('fetch', event => {
  const request = event.request;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const sameOrigin = url.origin === self.location.origin;

  // The same-origin Gutenberg proxy must always reach the network. Full book text
  // is cached intentionally in IndexedDB by the application, not as opaque responses.
  if (sameOrigin && url.pathname.startsWith('/api/')) return;

  // Navigation is network-first so visitors receive the latest app shell after deploys.
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put('/index.html', copy)));
          }
          return response;
        })
        .catch(async () => (await caches.match('/index.html')) || (await caches.match('/'))),
    );
    return;
  }

  const isCatalogueApi = /gutendex\.com|openlibrary\.org/.test(url.hostname);
  if (isCatalogueApi) {
    event.respondWith(
      fetch(request)
        .then(response => {
          if (response.ok) {
            const copy = response.clone();
            event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || Response.error()),
    );
    return;
  }

  const isStaticAsset = sameOrigin && (
    url.pathname.startsWith('/assets/') ||
    /\.(?:css|js|svg|png|jpe?g|webp|woff2?)$/i.test(url.pathname)
  );
  if (!isStaticAsset) return;

  event.respondWith(
    caches.match(request).then(cached => {
      const networkRequest = fetch(request).then(response => {
        if (response.ok) {
          const copy = response.clone();
          event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.put(request, copy)));
        }
        return response;
      });
      return cached || networkRequest;
    }).catch(() => caches.match(request)),
  );
});
