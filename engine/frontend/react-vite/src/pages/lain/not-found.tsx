// ============================================================
// ARKZEN GENERATED — lain/not-found [React+Vite]
// Rendered by the wildcard route /lain/* for any
// unmatched sub-path under this tatemono prefix.
// DO NOT EDIT — edit @arkzen:error:404 in tatemono instead
// Generated: 2026-06-25T16:06:19.980Z
// ============================================================

import React from 'react'
import { ErrorScreen } from './components/ErrorScreen'

const NotFoundPage = () => (
  <div className="min-h-screen bg-white flex items-center justify-center p-8">
    <div className="text-center max-w-md">
      <p className="text-[120px] font-black text-neutral-100 leading-none">404</p>
      <h1 className="text-xl font-bold text-neutral-900 -mt-2 mb-2">Page not found</h1>
      <p className="text-sm text-neutral-500 mb-6">This route doesn't exist in the lain tatemono.</p>
      <Link to="/lain" className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-700 transition-colors">
        Back to Home
      </Link>
    </div>
  </div>
)

export default NotFoundPage
