const CACHE_NAME = 'language-learning-v2';
const STATIC_CACHE = 'static-v2';

// Lista krytycznych plików do cache'owania
const CRITICAL_FILES = [
  '/',
  '/index.html',
  '/src/index.jsx',
  '/src/App.jsx',
  '/src/components/Navigation.jsx'
];

// Instalacja Service Worker
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(CRITICAL_FILES);
    })
  );
});

// Aktywacja i czyszczenie starych cache'ów
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptowanie requestów - tylko dla static files
self.addEventListener('fetch', (event) => {
  const { request } = event;
  
  // Cache'owanie tylko static files
  if (request.method === 'GET' && !request.url.includes('/api/')) {
    event.respondWith(handleStaticRequest(request));
  }
});

// Obsługa static files
async function handleStaticRequest(request) {
  const cache = await caches.open(STATIC_CACHE);
  
  // Sprawdź cache
  const cachedResponse = await cache.match(request);
  if (cachedResponse) {
    return cachedResponse;
  }
  
  // Jeśli nie ma w cache, pobierz z network
  try {
    const networkResponse = await fetch(request);
    if (networkResponse.ok) {
      cache.put(request, networkResponse.clone());
    }
    return networkResponse;
  } catch (error) {
    // Fallback dla offline
    if (request.destination === 'document') {
      return cache.match('/');
    }
    return new Response('Offline content not available', { status: 503 });
  }
}
