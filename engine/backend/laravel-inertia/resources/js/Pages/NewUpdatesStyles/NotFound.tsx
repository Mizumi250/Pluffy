// ============================================================
// ARKZEN GENERATED — new-updates-styles/NotFound.tsx [React+Inertia]
// Inertia page rendered for unmatched sub-routes under this tatemono.
// Registered as a catch-all route in routes/modules/new-updates-styles.pages.php
// DO NOT EDIT — edit the @arkzen:error:404 block in the tatemono instead.
// Generated: 2026-10-13T17:05:21.710Z
// ============================================================

import React from 'react'
import { ErrorScreen } from './components/ErrorScreen'

const NotFoundPage = () => (
  <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <p className="text-[120px] font-black text-indigo-100 leading-none">404</p>
      <h1 className="text-xl font-bold text-neutral-900 -mt-2 mb-2">Page not found</h1>
      <p className="text-sm text-neutral-500 mb-6">This route doesn't exist in the new-updates-styles module.</p>
      <Link href="/new-updates-styles" className="inline-flex items-center gap-2 px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-500 transition-colors">
        Back to Home
      </Link>
    </div>
  </div>
)

export default NotFoundPage
