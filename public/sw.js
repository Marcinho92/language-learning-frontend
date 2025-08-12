const CACHE_NAME = 'language-learning-v1';
const STATIC_CACHE = 'static-v1';
const API_CACHE = 'api-v1';

// Lista plików do cache'owania
const STATIC_FILES = [
  '/',
  '/index.html',
  '/src/index.jsx',
  '/src/App.jsx',
  '/src/components/Navigation.jsx',
  '/src/components/WordList.jsx',
  '/src/components/AddWord.jsx',
  '/src/components/EditWord.jsx',
  '/src/components/WordLearning.jsx',
  '/src/components/Practice.jsx',
  '/src/components/GrammarPractice.jsx',
  '/src/utils/apiCache.js'
];

// Krytyczne pliki do natychmiastowego cache'owania
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
    Promise.all([
      // Natychmiastowe cache'owanie krytycznych plików
      caches.open(STATIC_CACHE).then((cache) => {
        return cache.addAll(CRITICAL_FILES);
      }),
      // Lazy cache'owanie pozostałych plików
      caches.open(STATIC_CACHE).then((cache) => {
        return Promise.all(
          STATIC_FILES.filter(file => !CRITICAL_FILES.includes(file))
            .map(file => cache.add(file).catch(() => console.log('Failed to cache:', file)))
        );
      }),
      caches.open(API_CACHE).then((cache) => {
        return cache.addAll([]);
      })
    ])
  );
});

// Aktywacja i czyszczenie starych cache'ów
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== STATIC_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
});

// Interceptowanie requestów
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache'owanie API calls
  if (url.pathname.startsWith('/api/')) {
    event.respondWith(handleApiRequest(request));
    return;
  }

  // Cache'owanie static files
  if (request.method === 'GET') {
    event.respondWith(handleStaticRequest(request));
    return;
  }
});

// Obsługa API requestów
async function handleApiRequest(request) {
  const cache = await caches.open(API_CACHE);
  
  try {
    // Najpierw spróbuj pobrać z network
    const networkResponse = await fetch(request);
    
    if (networkResponse.ok) {
      // Zapisz w cache
      const responseClone = networkResponse.clone();
      cache.put(request, responseClone);
    }
    
    return networkResponse;
  } catch (error) {
    // Jeśli network nie działa, spróbuj z cache
    const cachedResponse = await cache.match(request);
    if (cachedResponse) {
      return cachedResponse;
    }
    
    // Fallback response
    return new Response(
      JSON.stringify({ error: 'Network error and no cached data available' }), 
      { 
        status: 503, 
        headers: { 'Content-Type': 'application/json' } 
      }
    );
  }
}

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

// Funkcja do czyszczenia cache'ów
self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'CLEAR_CACHE') {
    event.waitUntil(
      Promise.all([
        caches.delete(STATIC_CACHE),
        caches.delete(API_CACHE)
      ])
    );
  }
});
