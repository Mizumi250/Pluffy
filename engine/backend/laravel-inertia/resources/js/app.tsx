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
import { setActiveTatemono } from '@/arkzen/core/stores/authStore'

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
        // Initialize tatemono slug from server-passed props
        // This ensures Zustand auth store uses the correct localStorage key
        // before any component mounts and tries to restore the auth token.
        const arkzen = (props.initialPage?.props as any)?.arkzen || {}
        const tatemono = arkzen.tatemono || 'default'
        setActiveTatemono(tatemono)
        console.log('[Arkzen Inertia] Tatemono slug initialized:', tatemono)

        // Populate process.env.NEXT_PUBLIC_* polyfill with Reverb config from server
        // This allows tatemono code that reads process.env.NEXT_PUBLIC_REVERB_* to work
        const reverb = arkzen.reverb || {}
        if (typeof window !== 'undefined' && window.process?.env) {
            window.process.env.NEXT_PUBLIC_REVERB_HOST = reverb.host || 'localhost'
            window.process.env.NEXT_PUBLIC_REVERB_PORT = reverb.port || '8080'
            window.process.env.NEXT_PUBLIC_REVERB_SCHEME = reverb.scheme || 'ws'
            window.process.env.NEXT_PUBLIC_REVERB_APP_KEY = reverb.appKey || 'arkzen-key'
            console.log('[Arkzen Inertia] Reverb config loaded:', {
                host: window.process.env.NEXT_PUBLIC_REVERB_HOST,
                port: window.process.env.NEXT_PUBLIC_REVERB_PORT,
                scheme: window.process.env.NEXT_PUBLIC_REVERB_SCHEME,
                appKey: window.process.env.NEXT_PUBLIC_REVERB_APP_KEY,
            })
        }

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