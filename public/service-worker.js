// Version of the service worker - update this to force update
const CACHE_VERSION = "v2.0.0";
const CACHE_NAME = `boltis-cache-${CACHE_VERSION}`;

// List of URLs to cache during install
const PRECACHE_URLS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/favicon.ico",
  "/logo192.png",
  "/logo512.png",
  // Add other core assets you want to cache
];

// Install event - precache static assets
self.addEventListener("install", (event) => {
  console.log("[Service Worker] Install");
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("[Service Worker] Caching app shell");
        return cache.addAll(PRECACHE_URLS);
      })
      .then(() => self.skipWaiting()),
  );
});

// Activate event - clean up old caches
self.addEventListener("activate", (event) => {
  console.log("[Service Worker] Activate");
  event.waitUntil(
    caches
      .keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              console.log("[Service Worker] Deleting old cache:", cacheName);
              return caches.delete(cacheName);
            }
          }),
        );
      })
      .then(() => {
        // Take control of all pages under this service worker's scope immediately
        return self.clients.claim();
      }),
  );
});

// Fetch event - Network first, then cache
self.addEventListener("fetch", (event) => {
  // Skip non-GET requests
  if (event.request.method !== "GET") return;

  // Skip cross-origin requests
  if (!event.request.url.startsWith(self.location.origin)) return;

  // Skip Chrome extensions
  if (event.request.url.indexOf("chrome-extension://") === 0) return;

  // Skip non-http(s) requests
  if (!/^https?:\/\//i.test(event.request.url)) return;

  // For API calls, use network first, then cache
  if (event.request.url.includes("/api/")) {
    event.respondWith(
      fetch(event.request)
        .then((response) => {
          // If we got a valid response, clone it and store it in the cache
          if (response.status === 200) {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME).then((cache) => {
              cache.put(event.request, responseToCache);
            });
          }
          return response;
        })
        .catch(() => {
          // If network fails, try to get from cache
          return caches.match(event.request);
        }),
    );
    return;
  }

  // For static assets, use cache first, then network
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      // Return cached response if found
      if (cachedResponse) {
        // Check if the cached response is stale
        const lastModified = new Date(
          cachedResponse.headers.get("last-modified") || 0,
        );
        const cacheAge =
          (Date.now() - lastModified.getTime()) / (1000 * 60 * 60 * 24); // in days

        // If cache is fresh (less than 1 day old), use it
        if (cacheAge < 1) {
          return cachedResponse;
        }
      }

      // Otherwise, fetch from network
      return fetch(event.request)
        .then((response) => {
          // Check if we received a valid response
          if (
            !response ||
            response.status !== 200 ||
            response.type !== "basic"
          ) {
            return response;
          }

          // Clone the response
          const responseToCache = response.clone();

          // Cache the response for future use
          caches.open(CACHE_NAME).then((cache) => {
            cache.put(event.request, responseToCache);
          });

          return response;
        })
        .catch(() => {
          // If both network and cache fail, return a fallback response
          return (
            cachedResponse ||
            new Response("You're offline and no cached content is available.")
          );
        });
    }),
  );
});

// Listen for messages from the client
self.addEventListener("message", (event) => {
  if (event.data && event.data.type === "SKIP_WAITING") {
    console.log("[Service Worker] Skip waiting");
    self.skipWaiting();
  }

  if (event.data && event.data.type === "CLIENTS_CLAIM") {
    console.log("[Service Worker] Claiming clients");
    self.clients.claim();
  }
});

// Periodically check for updates
self.addEventListener("periodicsync", (event) => {
  if (event.tag === "check-for-updates") {
    console.log("[Service Worker] Checking for updates");
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== CACHE_NAME) {
              return caches.delete(cacheName);
            }
          }),
        );
      }),
    );
  }
});
