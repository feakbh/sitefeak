const CACHE_NAME = 'feakbh-v4';
const PRECACHE_URLS = [
  '/',
  '/index.html',
  '/css/style.css',
  '/js/main.js',
  '/pages/atividades.html',
  '/pages/cascata-de-luz.html',
  '/pages/downloads.html',
  '/pages/mural.html',
  '/pages/contato.html',
  '/images/logo-kardec.png',
  '/images/icon-192.png',
  '/images/icon-512.png',
  '/images/apple-touch-icon.png',
  '/manifest.json'
];

self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_URLS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      )
    ).then(() => self.clients.claim())
  );
});

// Network-first for HTML, cache-first for static assets
self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;

  const url = new URL(req.url);
  if (url.origin !== location.origin) return;

  const isHTML = req.mode === 'navigate' ||
    (req.headers.get('accept') || '').includes('text/html');

  if (isHTML) {
    event.respondWith(
      fetch(req)
        .then(resp => {
          const copy = resp.clone();
          caches.open(CACHE_NAME).then(c => c.put(req, copy));
          return resp;
        })
        .catch(() => caches.match(req).then(r => r || caches.match('/index.html')))
    );
  } else {
    event.respondWith(
      caches.match(req).then(cached => {
        if (cached) return cached;
        return fetch(req).then(resp => {
          if (resp.ok) {
            const copy = resp.clone();
            caches.open(CACHE_NAME).then(c => c.put(req, copy));
          }
          return resp;
        });
      })
    );
  }
});
