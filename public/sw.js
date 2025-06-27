const CACHE_NAME = 'boltis-v5';
const ASSETS = [
  '/',
  '/index.html',
  '/manifest.json',
  '/site.webmanifest',
  '/vite.svg',
  '/favicon.ico',
  '/favicon-16x16.png',
  '/favicon-32x32.png',
  '/apple-touch-icon.png',
  '/android-chrome-192x192.png',
  '/android-chrome-512x512.png',
  '/icon-192.png',
  '/icon-512.png',
  '/logo.png',
  '/screenshot-narrow.webp',
  '/screenshot-wide.webp'
];

// Install event - cache the app shell
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then((cache) => {
        console.log('[Service Worker] Caching app shell');
        return cache.addAll(ASSETS);
      })
      .catch((error) => {
        console.error('[Service Worker] Cache addAll error:', error);
      })
  );
});

// Fetch event
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);
  
  // Skip non-GET and non-http(s) requests
  if (request.method !== 'GET' || !url.protocol.startsWith('http')) {
    return;
  }

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.match('/index.html')
        .then(response => response || fetchAndCache(request))
    );
    return;
  }

  // For assets, try cache first, then network
  event.respondWith(
    caches.match(request)
      .then(response => response || fetchAndCache(request))
      .catch(() => {
        // If both cache and network fail, return a fallback
        if (request.url.endsWith('.json')) {
          return new Response(JSON.stringify({ error: 'Not found' }), {
            status: 404,
            headers: { 'Content-Type': 'application/json' }
          });
        }
        return new Response('Not found', { status: 404 });
      })
  );
});

// Fetch and cache helper
async function fetchAndCache(request) {
  try {
    const response = await fetch(request);
    
    // Only cache successful responses and non-opaque responses
    if (response.status === 200 && response.type !== 'opaque') {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error('[Service Worker] Fetch failed:', error);
    // If offline and the request is for an image, return a fallback
    if (request.headers.get('Accept').includes('image')) {
      return caches.match('/logo.png');
    }
    throw error;
  }
}

// Clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name !== CACHE_NAME)
          .map((name) => caches.delete(name))
      );
    })
  );
});

// Claim clients to ensure immediate control
self.addEventListener('activate', (event) => {
  event.waitUntil(self.clients.claim());
});
