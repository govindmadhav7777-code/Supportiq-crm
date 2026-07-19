import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Proxying /api requests to the FastAPI backend during development
// means the frontend can call fetch("/api/v1/...") without hardcoding
// http://localhost:8000 everywhere, and without CORS headaches — Vite
// forwards the request server-side.
export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    proxy: {
      "/api": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
      "/health": {
        target: "http://127.0.0.1:8000",
        changeOrigin: true,
      },
    },
  },
});
