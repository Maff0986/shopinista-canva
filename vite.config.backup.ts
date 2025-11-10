import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// Configuración limpia y estable para Shopinista Canva
export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    open: true,
  },
  build: {
    outDir: "dist",
    sourcemap: true,
  },
});
