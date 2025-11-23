import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  server: {
    port: 8080,
    open: true,
    headers: {
      "Access-Control-Allow-Origin": "*",
      "Cross-Origin-Embedder-Policy": "unsafe-none",
      "Cross-Origin-Opener-Policy": "unsafe-none"
    },
    hmr: { overlay: false }
  },
  build: {
    sourcemap: false,
    outDir: "dist",
    rollupOptions: {
      external: [
        "@canva/bridge",
        "@canva/app-ui-kit",
        "@canva/design",
        "@canva/intents",
        "@canva/intents/design",
        "@canva/user"
      ],
      output: {
        entryFileNames: "assets/[name]-[hash].js",
        chunkFileNames: "assets/[name]-[hash].js",
        assetFileNames: "assets/[name]-[hash].[ext]"
      }
    }
  }
});
