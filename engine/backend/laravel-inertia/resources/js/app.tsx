// ============================================================
// ARKZEN — INERTIA REACT ROOT
// resources/js/app.tsx
//
// Static entry point — do NOT edit. Arkzen generates pages
// into resources/js/Pages/{TatName}/{Page}.tsx automatically.
// ============================================================

import './bootstrap'
import '../css/app.css'

import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { createRoot } from 'react-dom/client'
import { ToastProvider } from '@/arkzen/core/components/Toast'

const appName = import.meta.env.VITE_APP_NAME || 'Arkzen'

createInertiaApp({
    title: (title) => `${title} — ${appName}`,

    // Resolves Pages/{TatName}/{Page}.tsx automatically
    // eager: true so Vite (and Tailwind's scanner) processes ALL page files
    // at build time — lazy glob causes Tailwind to purge every className
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx', { eager: true }),
        ),

    setup({ el, App, props }) {
        createRoot(el).render(
            <ToastProvider position="top-right">
                <App {...props} />
            </ToastProvider>
        )
    },

    // Show a progress bar on navigation (built-in Inertia)
    progress: {
        color: '#6366f1',
    },
})