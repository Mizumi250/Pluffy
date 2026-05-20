import { defineConfig } from 'vite'
import { tanstackStart } from '@tanstack/react-start/plugin/vite'
import viteReact from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [
    tanstackStart(),
    viteReact(), // must come AFTER tanstackStart
  ],
  resolve: {
    alias: [
      { find: '@/arkzen/core/adapters', replacement: path.resolve(import.meta.dirname, './arkzen/core/adapters') },
      { find: '@/arkzen/core', replacement: path.resolve(import.meta.dirname, './arkzen/core') },
      { find: '@', replacement: path.resolve(import.meta.dirname, './src') },
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
})