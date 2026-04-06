import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import { resolve } from 'path';
import { copyFileSync } from 'fs';

/** Copy index.html to 404.html in dist so GitHub Pages serves the SPA for all routes. */
function spaFallback(): Plugin {
  return {
    name: 'spa-fallback',
    writeBundle(options) {
      const dir = options.dir ?? resolve(__dirname, 'dist');
      copyFileSync(resolve(dir, 'index.html'), resolve(dir, '404.html'));
    },
  };
}

export default defineConfig({
  plugins: [react(), spaFallback()],
  base: './',
  resolve: {
    alias: {
      '@': resolve(__dirname, 'src'),
    },
  },
  server: {
    proxy: {
      '/api': 'http://localhost:8080',
    },
  },
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['./src/test-setup.ts'],
  },
});
