import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { readFileSync } from "fs";

// Read package.json to get version
const packageJson = JSON.parse(readFileSync("./package.json", "utf-8"));

// https://vitejs.dev/config/
export default defineConfig({
  define: {
    // Make the version available in the app
    __APP_VERSION__: JSON.stringify(packageJson.version),
  },
  plugins: [react()],
  base: "/",
  build: {
    outDir: "dist",
    assetsDir: "assets",
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ["react", "react-dom", "react-router-dom"],
        },
      },
    },
  },
  server: {
    open: true,
    port: 3000,
    // Force full page reload on changes
    hmr: {
      overlay: false,
    },
    watch: {
      // Force polling for file changes
      usePolling: true,
      interval: 100,
    },
  },
  publicDir: "public",
  optimizeDeps: {
    include: ["react", "react-dom", "react-router-dom"],
  },
});
