import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
    plugins: [
        tailwindcss(),
        laravel({
            input: ['resources/css/app.css', 'resources/js/app.tsx'], // ← add app.css
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