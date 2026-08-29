const CACHE = 'pcb-site-v3';
const CORE = ['/', '/demo', '/privacy', '/terms', '/favicon.svg', '/assets/ceramic-beacons-mobile.webp', '/assets/ceramic-beacons.webp'];

self.addEventListener('install', (event) => {
  event.waitUntil((async () => {
    const cache = await caches.open(CACHE);
    await cache.addAll(CORE);
    const response = await fetch('/');
    const html = await response.text();
    const paths = [...html.matchAll(/(?:src|href)="(\/assets\/[^"]+\.(?:js|css))"/g)].map((match) => match[1]);
    await cache.addAll(paths);
    await self.skipWaiting();
  })());
});

self.addEventListener('activate', (event) => {
  event.waitUntil((async () => {
    const names = await caches.keys();
    await Promise.all(names.filter((name) => name !== CACHE).map((name) => caches.delete(name)));
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', (event) => {
  if (event.request.method !== 'GET' || new URL(event.request.url).origin !== location.origin) return;
  event.respondWith((async () => {
    try {
      const response = await fetch(event.request);
      if (response.ok) (await caches.open(CACHE)).put(event.request, response.clone());
      return response;
    } catch {
      return (await caches.match(event.request)) ?? (event.request.mode === 'navigate' ? await caches.match('/') : Response.error());
    }
  })());
});
