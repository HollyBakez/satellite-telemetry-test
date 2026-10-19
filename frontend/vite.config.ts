import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: true, // Allows external access (equivalent to 0.0.0.0)
    port: 5173, // Fixes Vite to a specific port
    strictPort: true, // Exits if the port is already in use
    watch: {
      usePolling: true, // Enables hot-reload mapping inside Docker volumes
    },
  },
});
