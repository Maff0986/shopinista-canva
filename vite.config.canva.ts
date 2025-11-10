import { defineConfig } from "vite";

export default defineConfig({
  build: {
    lib: {
      entry: "src/canva-entry.ts",
      formats: ["es"],
      fileName: () => "app"
    },
    rollupOptions: {
      external: ["@canva/app-sdk"]
    },
    outDir: "dist"
  }
});
