// Version management and service worker utilities

// Get the current version from package.json
declare const __APP_VERSION__: string;
const APP_VERSION = __APP_VERSION__ || "1.0.0";

// Store the version in localStorage for comparison
const VERSION_KEY = "boltis_app_version";

// Check for updates and handle service worker registration
export const register = () => {
  if ("serviceWorker" in navigator) {
    window.addEventListener("load", () => {
      const swUrl = `${process.env.PUBLIC_URL}/service-worker.js`;

      // Register the service worker
      navigator.serviceWorker
        .register(swUrl)
        .then((registration) => {
          registration.onupdatefound = () => {
            const installingWorker = registration.installing;
            if (installingWorker) {
              installingWorker.onstatechange = () => {
                if (installingWorker.state === "installed") {
                  if (navigator.serviceWorker.controller) {
                    // New content is available, show update prompt
                    const currentVersion = localStorage.getItem(VERSION_KEY);
                    if (currentVersion !== APP_VERSION) {
                      // New version detected, show update prompt
                      showUpdateNotification(registration);
                    }
                  } else {
                    // First time load, cache is populated
                    console.log("Content is cached for offline use.");
                  }
                }
              };
            }
          };
        })
        .catch((error) => {
          console.error("Error during service worker registration:", error);
        });
    });
  }
};

// Show update notification to user
const showUpdateNotification = (registration: ServiceWorkerRegistration) => {
  // You can customize this to show a nice UI notification
  if (confirm("A new version is available! Would you like to update now?")) {
    // Skip waiting and reload the page
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }
    window.location.reload();
  }
};

// Check for updates on navigation
export const checkForUpdates = () => {
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then((registration) => {
      registration
        .update()
        .then(() => {
          console.log("Service Worker updated");
        })
        .catch((error) => {
          console.error("Error updating service worker:", error);
        });
    });
  }
};

// Initialize version check
const initVersionCheck = () => {
  const currentVersion = localStorage.getItem(VERSION_KEY);
  if (currentVersion !== APP_VERSION) {
    // Clear all caches when version changes
    if ("caches" in window) {
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => caches.delete(cacheName)),
        );
      });
    }

    // Update the stored version
    localStorage.setItem(VERSION_KEY, APP_VERSION);

    // Force reload to get the new version
    window.location.reload();
  }
};

// Initialize when imported
initVersionCheck();

export default {
  register,
  checkForUpdates,
};
