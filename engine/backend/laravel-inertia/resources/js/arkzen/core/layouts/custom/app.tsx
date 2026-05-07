// ============================================================
// ARKZEN ENGINE — CUSTOM LAYOUT: app [React+Inertia]
// resources/js/arkzen/core/layouts/custom/app.tsx
//
// Generic app-shell layout used by tatemonos that declare
// layout: app in their page DSL. Wraps pages in a neutral
// root container — no nav, no sidebar, no auth gating.
// Extend or replace per-project as needed.
//
// Inertia equivalent of the nextjs / react-vite custom/app.tsx.
// ============================================================

import React from 'react'

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="app-root min-h-screen bg-neutral-50 dark:bg-neutral-950">
      {children}
    </div>
  )
}
