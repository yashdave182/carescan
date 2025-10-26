import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Basic Vite config for the CareScan web app
export default defineConfig({
  plugins: [react()],
  publicDir: 'public',
  server: {
    port: 5173,
    open: true,
  },
  preview: {
    port: 5173,
  },
  resolve: {
    alias: {
      '@': '/src',
    },
  },
  build: {
    outDir: 'dist',
    target: 'esnext',
    sourcemap: true,
  },
});
