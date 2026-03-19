const CACHE_NAME = 'payroll-pro-v1';
const ASSETS_TO_CACHE = [
    'index.html',
    'style.css',
    'app.js',
    'ads/ads-engine.js',
    'manifest.json',
    'assets/under-construction.png'
];

// Instalación: Guarda los archivos en la caché del móvil
self.addEventListener('install', (event) => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then((cache) => cache.addAll(ASSETS_TO_CACHE))
    );
});

// Activación: Limpia cachés antiguas si actualizamos la versión
self.addEventListener('activate', (event) => {
    event.waitUntil(
        caches.keys().then((keys) => {
            return Promise.all(
                keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
            );
        })
    );
});

// Estrategia de carga: Intenta red, si falla usa caché (Offline Ready)
self.addEventListener('fetch', (event) => {
    event.respondWith(
        fetch(event.request).catch(() => {
            return caches.match(event.request);
        })
    );
});
