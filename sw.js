const CACHE_NAME = 'payroll-pro-v1';

// Archivos vitales para el funcionamiento offline
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0/css/all.min.css'
];

// 1. INSTALACIÓN: Precarga los archivos estáticos
self.addEventListener('install', (event) => {
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Guardando archivos para uso offline...');
      // Usamos Promise.all con fetch individual para evitar que un fallo en un CDN bloquee todo
      return Promise.all(
        ASSETS.map(url => {
          return fetch(url).then(response => {
            if (!response.ok) throw new Error('Error en red: ' + url);
            return cache.put(url, response);
          }).catch(error => console.warn('[Service Worker] Fallo al cachear (se intentará luego):', url, error));
        })
      );
    })
  );
});

// 2. ACTIVACIÓN: Limpia cachés de versiones anteriores
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(keyList.map((key) => {
        if (key !== CACHE_NAME) {
          console.log('[Service Worker] Borrando caché antigua:', key);
          return caches.delete(key);
        }
      }));
    })
  );
  self.clients.claim();
});

// 3. INTERCEPTACIÓN DE RED: Cache First, Network Fallback
self.addEventListener('fetch', (event) => {
  // Solo manejamos peticiones GET
  if (event.request.method !== 'GET') return;

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Si el archivo está en caché, devuélvelo inmediatamente
      if (cachedResponse) {
        return cachedResponse;
      }

      // Si no está en caché, búscalo en internet y guárdalo para la próxima vez
      return fetch(event.request).then((networkResponse) => {
        // Asegurarse de que la respuesta es válida antes de cachearla
        if (!networkResponse || networkResponse.status !== 200 || networkResponse.type !== 'basic') {
          // Si es un recurso externo (CDN) tipo 'opaque', lo cacheamos igual si es necesario
          if(networkResponse && networkResponse.type === 'opaque') {
             const responseToCache = networkResponse.clone();
             caches.open(CACHE_NAME).then((cache) => cache.put(event.request, responseToCache));
          }
          return networkResponse;
        }

        const responseToCache = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => {
          cache.put(event.request, responseToCache);
        });

        return networkResponse;
      }).catch(() => {
        // Fallback final: Si no hay internet y falla todo, intenta cargar el index.html
        if (event.request.mode === 'navigate') {
          return caches.match('./index.html');
        }
      });
    })
  );
});
