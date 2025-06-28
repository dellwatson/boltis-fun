import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { register } from "./utils/serviceWorker";

// Initialize the app
const root = createRoot(document.getElementById("root")!);

// Register service worker in production only
if (import.meta.env.PROD) {
  register();
}

root.render(
  <StrictMode>
    <App />
  </StrictMode>,
);
