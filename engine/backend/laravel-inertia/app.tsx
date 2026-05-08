// ============================================================
// ARKZEN — INERTIA REACT ROOT
// resources/js/app.tsx
//
// Static entry point — NOT generated, never overwritten.
// Inertia resolves pages from resources/js/Pages/ which is
// where inertia-router.ts writes the generated page components.
// ============================================================

import { createInertiaApp } from '@inertiajs/react'
import { resolvePageComponent } from 'laravel-vite-plugin/inertia-helpers'
import { createRoot } from 'react-dom/client'
import { StrictMode } from 'react'
import { ToastProvider } from './resources/js/arkzen/core/components/Toast'
import '../css/app.css'

const appName = import.meta.env.VITE_APP_NAME || 'Arkzen'

createInertiaApp({
    title: (title) => `${title} — ${appName}`,

    // Dynamically resolve generated pages from Pages/ directory
    // Each tatemono lives under Pages/{TatName}/{PageName}.tsx
    resolve: (name) =>
        resolvePageComponent(
            `./Pages/${name}.tsx`,
            import.meta.glob('./Pages/**/*.tsx'),
        ),

    setup({ el, App, props }) {
        createRoot(el).render(
            <StrictMode>
                <ToastProvider position="top-right">
                    <App {...props} />
                </ToastProvider>
            </StrictMode>,
        )
    },

    progress: {
        color: '#6366f1',  // Tailwind indigo-500 — matches Arkzen default theme
    },
})
