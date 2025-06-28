// Version management and service worker utilities

// Get the current version from package.json
declare const __APP_VERSION__: string;
const APP_VERSION = __APP_VERSION__ || "1.0.0";

// Store the version in localStorage for comparison
const VERSION_KEY = "boltis_app_version";

// How often to check for updates (in milliseconds)
const UPDATE_CHECK_INTERVAL = 60 * 60 * 1000; // 1 hour

// Check for updates and handle service worker registration
export const register = () => {
  if (!("serviceWorker" in navigator)) {
    console.log("Service Worker is not supported by browser.");
    return;
  }

  if (process.env.NODE_ENV === "development") {
    console.log("Service Worker is disabled in development mode.");
    return;
  }

  const swUrl = `${window.location.origin}/service-worker.js`;

  // Register service worker
  window.addEventListener("load", () => {
    navigator.serviceWorker
      .register(swUrl)
      .then((registration) => {
        console.log(
          "Service Worker registered with scope:",
          registration.scope,
        );

        // Check for updates immediately
        registration
          .update()
          .catch((err) => console.log("Error checking for updates:", err));

        // Set up periodic update checks
        setInterval(() => {
          registration
            .update()
            .catch((err) => console.log("Periodic update check failed:", err));
        }, UPDATE_CHECK_INTERVAL);

        // Track updates
        registration.addEventListener("updatefound", () => {
          console.log("New service worker found. Installing...");
          const newWorker = registration.installing;

          if (!newWorker) return;

          newWorker.addEventListener("statechange", () => {
            // When the new service worker is installed
            if (newWorker.state === "installed") {
              console.log("New service worker installed.");

              // If there's a controller, this is an update
              if (navigator.serviceWorker.controller) {
                console.log("New content is available; please refresh.");
                // Notify user about the update
                showUpdateNotification(registration);
              } else {
                console.log("Content is now available offline!");
              }
            }
          });
        });
      })
      .catch((error) => {
        console.error("Error during service worker registration:", error);
      });
  });

  // Ensure the service worker becomes active immediately
  if (navigator.serviceWorker.controller) {
    navigator.serviceWorker.controller.postMessage({ type: "CLIENTS_CLAIM" });
  }
};

// Show update notification to user
const showUpdateNotification = (registration: ServiceWorkerRegistration) => {
  // You can replace this with a more sophisticated UI notification
  if (
    window.confirm("A new version is available! Would you like to update now?")
  ) {
    // Tell the service worker to skip waiting
    if (registration.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });
    }

    // Reload the page once the new service worker takes control
    const reloadPage = () => window.location.reload();
    navigator.serviceWorker.addEventListener("controllerchange", reloadPage, {
      once: true,
    });

    // If the controllerchange event doesn't fire, reload after a timeout
    setTimeout(reloadPage, 1000);
  }
};

// Check for updates
export const checkForUpdates = () => {
  if (!("serviceWorker" in navigator)) return;

  return navigator.serviceWorker.ready
    .then((registration) => registration.update())
    .then(() => {
      console.log("Update check complete");
      return true;
    })
    .catch((error) => {
      console.error("Error checking for updates:", error);
      return false;
    });
};

// Initialize version check and update flow
const initVersionCheck = () => {
  const currentVersion = localStorage.getItem(VERSION_KEY);

  // If this is a new version, clear caches and reload
  if (currentVersion !== APP_VERSION) {
    console.log(`New app version detected: ${APP_VERSION}`);

    // Clear all caches when version changes
    if ("caches" in window) {
      caches
        .keys()
        .then((cacheNames) => {
          return Promise.all(
            cacheNames.map((cacheName) => caches.delete(cacheName)),
          );
        })
        .then(() => {
          console.log("Cleared all caches for version update");
        })
        .catch((err) => {
          console.error("Error clearing caches:", err);
        });
    }

    // Update the stored version
    localStorage.setItem(VERSION_KEY, APP_VERSION);

    // Force reload to get the new version
    window.location.reload();
  }
};

// Initialize when imported
if (typeof window !== "undefined") {
  initVersionCheck();
}

export default {
  register,
  checkForUpdates,
};
