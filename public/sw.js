const CACHE_NAME = 'green-moon-v2';
const STATIC_ASSETS = [
    '/',
    '/index.html',
    '/favicon.ico',
    '/favicon-16x16.png',
    '/favicon-32x32.png',
    '/favicon-48x48.png',
    '/icon-72x72.png',
    '/icon-96x96.png',
    '/icon-128x128.png',
    '/icon-144x144.png',
    '/icon-152x152.png',
    '/icon-167x167.png',
    '/apple-touch-icon.png',
    '/icon-192x192.png',
    '/icon-384x384.png',
    '/icon-512x512.png',
    '/manifest.webmanifest',
    '/splash.mp4',
];

// Install Event: Precaching static assets
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.addAll(STATIC_ASSETS);
        })
    );
    self.skipWaiting();
});

// Activate Event: Cleanup old caches
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keyList) => {
            return Promise.all(
                keyList.map((key) => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        })
    );
    self.clients.claim();
});

// Fetch Event: Stale-While-Revalidate Strategy for most things
self.addEventListener('fetch', (event) => {
    // Ignorer les requêtes vers Supabase ou les APIs externes pour éviter les conflits RLS de cache
    if (event.request.url.includes('supabase') || event.request.url.includes('openrouter')) {
        return;
    }

    event.respondWith(
        caches.open(CACHE_NAME).then((cache) => {
            return cache.match(event.request).then((cachedResponse) => {
                const fetchPromise = fetch(event.request).then((networkResponse) => {
                    // Si on a une réponse réseau valide (et c'est une requête GET), on la met en cache
                    if (event.request.method === 'GET' && networkResponse && networkResponse.status === 200) {
                        cache.put(event.request, networkResponse.clone());
                    }
                    return networkResponse;
                }).catch(() => {
                    // Si le réseau échoue (offline), on espère avoir le cache
                    return cachedResponse || cache.match('/index.html');
                });

                return cachedResponse || fetchPromise;
            });
        })
    );
});
