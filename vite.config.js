import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
  // Development server configuration
  server: {
    port: 3000,
    open: true
  },
  
  // Build configuration for library mode
  build: {
    lib: {
      entry: resolve(__dirname, 'src/index.js'),
      name: 'Flies',
      formats: ['umd', 'es'],
      fileName: (format) => {
        if (format === 'umd') {
          return 'flysplatter.js';
        }
        return `flysplatter.${format}.js`;
      }
    },
    rollupOptions: {
      output: {
        // Provide global variables to use in the UMD build
        // for externalized deps
        globals: {}
      }
    },
    // Generate sourcemaps for debugging
    sourcemap: true,
    // Copy assets to dist
    copyPublicDir: false
  },
  
  // Configure asset handling
  assetsInclude: ['**/*.png', '**/*.jpg', '**/*.mp3', '**/*.ogg'],
  
  // Public directory for demo site
  publicDir: 'public'
});
