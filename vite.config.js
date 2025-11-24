import { defineConfig } from 'vite';
export default defineConfig({
  build: {
    rollupOptions: {
      external: [
        '@canva/bridge',
        '@canva/intents',
        '@canva/intents/design',
        '@canva/app-ui-kit'
      ]
    }
  },
  server: {
    port: 8080
  }
});