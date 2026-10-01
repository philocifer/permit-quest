// Cache name and the ?v=1 query on every asset URL in index.html must change together.
const CACHE_NAME = 'permit-quest-v1';

const ASSETS = [
    '/',
    '/index.html',
    '/style.css?v=1',
    '/manifest.json',
    '/icons/icon.svg',
    '/js/curriculum.js?v=1',
    '/js/questions/registry.js?v=1',
    '/js/questions/01-licenses.js?v=1',
    '/js/questions/02-vehicles.js?v=1',
    '/js/questions/03-drivers.js?v=1',
    '/js/questions/04-roads.js?v=1',
    '/js/questions/05-risks.js?v=1',
    '/js/adventureData.js?v=1',
    '/js/soundEffects.js?v=1',
    '/js/AdventureGame.js?v=1'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys()
            .then(names => Promise.all(
                names.filter(name => name !== CACHE_NAME).map(name => caches.delete(name))
            ))
            .then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            if (cached) return cached;
            return fetch(event.request).catch(() => {
                if (event.request.mode === 'navigate') return caches.match('/index.html');
            });
        })
    );
});
