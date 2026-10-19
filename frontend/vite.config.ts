import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    setupFiles: "./src/test/setup.ts",
    clearMocks: true,
  },
  server: {
    host: true, // Allows external access (equivalent to 0.0.0.0)
    port: 5173, // Fixes Vite to a specific port
    strictPort: true, // Exits if the port is already in use
    watch: {
      usePolling: true, // Enables hot-reload mapping inside Docker volumes
    },
  },
});
