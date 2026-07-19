import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { resolve } from "path";

export default defineConfig({
  plugins: [react()],

  // Path aliases — resolves case-sensitivity issues with Rolldown on Windows
  resolve: {
    alias: {
      "@utils":    resolve(__dirname, "src/Utils"),
      "@data":     resolve(__dirname, "src/Data"),
      "@components": resolve(__dirname, "src/Components"),
    },
  },

  server: {
    proxy: {
      // Proxy all /api requests to the Express backend
      "/api": {
        target: "http://localhost:5000",
        changeOrigin: true,
      },
    },
  },
});