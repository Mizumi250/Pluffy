// ============================================================
// ARKZEN React+Inertia — Application Entry Point
// resources/js/app.tsx
//
// How Inertia works:
//   1. Laravel handles ALL routing (no React Router)
//   2. Every request hits Laravel first
//   3. Controllers call Inertia::render('TatName/PageName', $props)
//   4. Inertia sends the component name + props as JSON
//   5. This resolver maps the name to the React component
//   6. On navigation, Inertia fetches JSON (no full page reload)
//
// DO NOT ADD routes here — they live in Laravel's web.php
// ============================================================

import React from 'react'
import { createRoot } from 'react-dom/client'
import { createInertiaApp } from '@inertiajs/react'
import { ARKZEN_INERTIA_PAGES } from './arkzen/generated/pages'

// Inertia app initialization
createInertiaApp({
  // Resolve page component from name string sent by Laravel
  // e.g. 'MyApp/Dashboard' → import('@/Pages/MyApp/Dashboard')
  resolve: (name: string) => {
    const pages = ARKZEN_INERTIA_PAGES

    if (!(name in pages)) {
      console.error(`[Arkzen Inertia] Page not found: "${name}"`)
      console.error(`[Arkzen Inertia] Available pages:`, Object.keys(pages))
      // Return a fallback 404 page
      return Promise.resolve({
        default: () => (
          <div style={{
            minHeight: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'system-ui',
            background: '#f5f5f0',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>404</div>
            <div style={{ fontSize: '14px', color: '#aaa' }}>
              Page not found: {name}
            </div>
            <div style={{ fontSize: '12px', color: '#ccc', marginTop: '8px' }}>
              Run the Arkzen engine to rebuild pages
            </div>
          </div>
        ),
      })
    }

    return pages[name]()
  },

  // App wrapper — Inertia renders all pages inside this
  setup({ el, App, props }) {
    createRoot(el).render(
      <React.StrictMode>
        <App {...props} />
      </React.StrictMode>
    )
  },

  // Page title
  title: title => title ? `${title} — Arkzen` : 'Arkzen',
})