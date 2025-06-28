import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { register, checkForUpdates } from "./utils/serviceWorker";

// Initialize the app
const root = createRoot(document.getElementById("root")!);

// Register service worker in all environments
register();

// Check for updates when the app starts
if (import.meta.env.PROD) {
  // Check for updates immediately
  checkForUpdates();

  // Then check every 15 minutes
  setInterval(checkForUpdates, 15 * 60 * 1000);
}

// Add a custom event listener for service worker updates
const AppWithSWUpdateListener = () => {
  useEffect(() => {
    // Listen for the custom update event
    const handleUpdate = () => {
      if (
        window.confirm(
          "A new version is available! Would you like to update now?",
        )
      ) {
        window.location.reload();
      }
    };

    window.addEventListener("sw-update", handleUpdate);
    return () => window.removeEventListener("sw-update", handleUpdate);
  }, []);

  return (
    <StrictMode>
      <App />
    </StrictMode>
  );
};

root.render(<AppWithSWUpdateListener />);
