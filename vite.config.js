import { defineConfig } from 'vite';

export default defineConfig({
  // Development server configuration
  server: {
    open: '/index.html',
    port: 5173
  },
  // Preview server configuration
  preview: {
    port: 4173
  }
});
