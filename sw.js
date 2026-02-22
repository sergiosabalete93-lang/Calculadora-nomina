// sw.js - Service Worker PWA Robusto (Versión Corregida)

const CACHE_NAME = 'payroll-pro-v3';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './app.js'
];

// 1. INSTALACIÓN: Guarda los archivos en el móvil
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Archivos en caché correctamente');
        return cache.addAll(urlsToCache);
      })
  );
  self.skipWaiting(); // Fuerza a que el SW se instale inmediatamente
});

// 2. ACTIVACIÓN: Borra las cachés viejas si actualizas la App
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Borrando caché antigua:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim(); // Toma el control de las ventanas abiertas
});

// 3. FETCH: Sirve la app sin conexión a internet
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Devuelve la versión de la caché o la pide a la red si no la tiene
        return response || fetch(event.request);
      }).catch(() => {
        console.log('Modo Offline: No se pudo cargar', event.request.url);
      })
  );
});
