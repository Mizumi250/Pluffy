// ============================================================
// ARKZEN — Vite Config (Laravel+Inertia stack) v1.6
//
// v1.6: Upgraded to Vite 8 + @vitejs/plugin-react v6 (Oxc).
//       Tailwind v4 via @tailwindcss/vite (removed postcss.config.js
//       and tailwind.config.js — no longer needed in TW4).
//       Removed vite-plugin-top-level-await (Vite 8 + Rolldown
//       handles top-level await natively).
// ============================================================
import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import wasm from 'vite-plugin-wasm'
import path from 'path'

export default defineConfig({
    plugins: [
        tailwindcss(),   // TW4 — must be before laravel()
        wasm(),
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
    ],
    resolve: {
        alias: [
            // @/arkzen/core/adapters — inertia-specific (Link.tsx, router.ts) — most specific first
            {
                find: '@/arkzen/core/adapters',
                replacement: path.resolve(__dirname, 'resources/js/arkzen/core/adapters'),
            },
            // @/arkzen/core — synced from engine/shared by inertia-builder on every build
            {
                find: '@/arkzen/core',
                replacement: path.resolve(__dirname, 'resources/js/arkzen/core'),
            },
            // @/ — everything else: Pages, app.tsx, arkzen/generated, etc.
            {
                find: '@',
                replacement: path.resolve(__dirname, 'resources/js'),
            },
        ],
    },
    server: {
        host: '0.0.0.0',
        port: 5173,
        origin: 'http://localhost:5173',
        cors: {
            origin: 'http://localhost:8000',
        },
        watch: {
            ignored: ['**/storage/framework/views/**', '**/vendor/**'],
        },
    },
})
