import { StrictMode, useEffect } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { register, checkForUpdates } from "./utils/serviceWorker";

// Initialize the app
const root = createRoot(document.getElementById("root")!);

// Only register service worker in production
if (import.meta.env.PROD) {
  register();
  
  // Check for updates immediately
  checkForUpdates();

  // Then check every 15 minutes
  setInterval(checkForUpdates, 15 * 60 * 1000);
} else {
  // In development, unregister any existing service workers
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.getRegistrations().then(registrations => {
      registrations.forEach(registration => registration.unregister());
    });
  }
}

// Add a custom event listener for service worker updates
const AppWithSWUpdateListener = () => {
  useEffect(() => {
    // Listen for the custom update event and reload automatically
    const handleUpdate = () => {
      console.log('New version detected, reloading...');
      window.location.reload();
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
