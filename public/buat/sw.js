const CACHE = 'bgy-buat-prompt-v1';
const ASSETS = [
  './',
  './index.html',
  '../guru-cibisd2.png',
  'https://bantuguruyuk.web.id/icon.png',
];

self.addEventListener('install', (e) => {
  e.waitUntil(
    caches.open(CACHE).then((c) => c.addAll(ASSETS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

self.addEventListener('fetch', (e) => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  if (url.origin !== location.origin && !url.hostname.includes('supabase')) {
    return;
  }
  e.respondWith(
    caches.match(e.request).then((hit) => {
      const fetchPromise = fetch(e.request)
        .then((res) => {
          if (res && res.ok && url.origin === location.origin) {
            const copy = res.clone();
            caches.open(CACHE).then((c) => c.put(e.request, copy)).catch(() => {});
          }
          return res;
        })
        .catch(() => hit);
      return hit || fetchPromise;
    })
  );
});
