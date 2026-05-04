// ============================================================
// ARKZEN — Vite Config (React+Vite stack)
// ============================================================
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: [
      // @/arkzen/core → engine root arkzen/core  (matches Next.js structure)
      // Must be listed BEFORE the catch-all @/ rule
      {
        find: '@/arkzen/core',
        replacement: path.resolve(__dirname, './arkzen/core'),
      },
      // @/ → src/  (everything else: pages, layouts, arkzen/generated, etc.)
      {
        find: '@',
        replacement: path.resolve(__dirname, './src'),
      },
    ],
  },
  server: {
    port: 3000,
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
      '/storage': {
        target: 'http://127.0.0.1:8000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: 'index.html',
    },
  },
})