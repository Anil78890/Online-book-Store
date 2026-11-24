import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Server-side proxy for Gutenberg text: Gutenberg omits Access-Control-Allow-Origin,
// so the browser fetches /api/gutenberg/... on our own origin instead.
// Production equivalents live in netlify.toml and nginx.conf.
const gutenbergProxy = {
  '/api/gutenberg': {
    target: 'https://www.gutenberg.org',
    changeOrigin: true,
    secure: true,
    rewrite: (path: string) => path.replace(/^\/api\/gutenberg/, '')
  }
};

export default defineConfig({
  plugins: [react()],
  server: { proxy: gutenbergProxy },
  preview: { proxy: gutenbergProxy },
  build: {
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
  optimizeDeps: {
    include: ['react', 'react-dom', 'lucide-react']
  }
});