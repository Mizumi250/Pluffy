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

const appName = import.meta.env.VITE_APP_NAME || 'Arkzen'

createInertiaApp({
    title: (title) => `${title} — ${appName}`,

    // Resolves Pages/{TatName}/{Page}.tsx automatically
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),

    setup({ el, App, props }) {
        createRoot(el).render(<App {...props} />)
    },

    // Show a progress bar on navigation (built-in Inertia)
    progress: {
        color: '#6366f1',
    },
})
