// Open Publisher Service Worker (v5.5.2)
const CACHE_NAME = 'open-publisher-v5-5-2';

self.addEventListener('install', (event) => {
    // Activate worker immediately once installed
    self.skipWaiting();
});

self.addEventListener('activate', (event) => {
    // Clean up old caches if present
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k))
            );
        }).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', (event) => {
    // Standard network-first fetch handler required for PWA installation criteria
    if (event.request.method !== 'GET') return;
    const url = new URL(event.request.url);
    if (!url.protocol.startsWith('http')) return;

    event.respondWith(
        fetch(event.request, { cache: 'no-cache' })
            .then((networkResponse) => {
                return networkResponse;
            })
            .catch(() => {
                return caches.match(event.request);
            })
    );
});
