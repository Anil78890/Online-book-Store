/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Server-side proxy for Gutenberg text: Gutenberg omits Access-Control-Allow-Origin,
// so the browser fetches /api/gutenberg/... on our own origin instead.
// Uses official Project Gutenberg Literary Archive Foundation (PGLAF) mirror for resilience.
const gutenbergProxy = {
  '/api/gutenberg': {
    target: 'https://gutenberg.pglaf.org',
    changeOrigin: true,
    secure: true,
    rewrite: (path: string) => path.replace(/^\/api\/gutenberg/, '')
  }
};

export default defineConfig(({ mode }) => ({
  plugins: [react()],
  server: { proxy: gutenbergProxy },
  preview: { proxy: gutenbergProxy },
  test: {
    include: ['tests/**/*.test.ts'],
    exclude: ['tests/**/*.spec.ts', 'node_modules/**']
  },
  build: {
    sourcemap: false,
    rollupOptions: {
      output: {
        manualChunks: {
          vendor: ['react', 'react-dom'],
          icons: ['lucide-react']
        }
      }
    },
    chunkSizeWarningLimit: 1000,
    minify: 'esbuild'
  },
  esbuild: {
    drop: mode === 'production' ? ['console', 'debugger'] : []
  },
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react']
  }
}));