// ============================================================
// ARKZEN — Vite Config (React+Inertia stack)
// Inertia uses Laravel as the entry point — Vite is asset-only
// Laravel serves the HTML shell; Inertia hydrates in browser
// ============================================================
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './resources/js'),
    },
  },
  build: {
    // Output goes into Laravel public/build — served by Laravel
    outDir: '../../backend/laravel/public/build',
    emptyOutDir: true,
    rollupOptions: {
      input: 'resources/js/app.tsx',
    },
    manifest: true,
  },
  server: {
    port: 5173,
    host: '0.0.0.0',
    // HMR connects to Vite dev server; Laravel proxies assets
    hmr: {
      host: 'localhost',
    },
  },
})