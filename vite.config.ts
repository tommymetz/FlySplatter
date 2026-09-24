/// <reference types="vitest/config" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// Demo game site (deployed to Netlify)
export default defineConfig({
  root: 'demo',
  plugins: [react()],
  build: {
    outDir: '../dist/site',
    emptyOutDir: true,
  },
  test: {
    root: '.',
    environment: 'jsdom',
    setupFiles: ['./test/setup.ts'],
  },
})
