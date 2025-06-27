const CACHE_NAME = "boltis-v4";
const ASSETS = [
  "/",
  "/index.html",
  "/manifest.json",
  "/site.webmanifest",

  // Icons
  "/favicon.ico",
  "/favicon-16x16.png",
  "/favicon-32x32.png",
  "/apple-touch-icon.png",
  "/android-chrome-192x192.png",
  "/android-chrome-512x512.png",
  "/icon-192.png",
  "/icon-512.png",
  "/logo.png",

  // Screenshots
  "/screenshot-narrow.webp",
  "/screenshot-wide.webp",

  // Other assets (these will be cached as they're requested)
  "/*.js",
  "/*.css",
  "/*.json",
  "/*.png",
  "/*.svg",
  "/*.jpg",
  "/*.jpeg",
  "/*.webp",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches
      .open(CACHE_NAME)
      .then((cache) => {
        console.log("Caching app shell");
        return cache.addAll(ASSETS);
      })
      .catch((error) => {
        console.error("Cache addAll error:", error);
      })
  );
});

self.addEventListener("fetch", (event) => {
  // Skip non-GET requests and chrome-extension URLs
  if (
    event.request.method !== "GET" ||
    event.request.url.startsWith("chrome-extension://") ||
    !event.request.url.startsWith("http")
  ) {
    return;
  }

  // Handle navigation requests
  if (event.request.mode === "navigate") {
    event.respondWith(
      caches
        .match("/index.html")
        .then((response) => response || fetchAndCache(event.request))
    );
    return;
  }

  // For all other requests, try cache first, then network
  event.respondWith(
    caches
      .match(event.request)
      .then((response) => response || fetchAndCache(event.request))
  );
});

async function fetchAndCache(request) {
  try {
    const response = await fetch(request);

    // Only cache successful responses and non-opaque responses
    if (response.status === 200 && response.type !== "opaque") {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch (error) {
    console.error("Fetch failed:", error);
    // If offline and the request is for an image, return a fallback
    if (request.headers.get("Accept").includes("image")) {
      return caches.match("/logo.png");
    }
    throw error;
  }
}

// Clean up old caches
self.addEventListener("activate", (event) => {
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
