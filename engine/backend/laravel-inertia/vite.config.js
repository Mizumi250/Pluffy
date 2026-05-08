import { defineConfig } from 'vite'
import laravel from 'laravel-vite-plugin'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

export default defineConfig({
    plugins: [
        laravel({
            input: ['resources/js/app.tsx'],
            refresh: true,
        }),
        react(),
        tailwindcss(),
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
        watch: {
            ignored: ['**/storage/framework/views/**', '**/vendor/**'],
        },
    },
})