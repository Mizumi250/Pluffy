// ============================================================
// ARKZEN GENERATED — new-updates-styles/not-found.tsx
// Next.js segment-scoped 404 handler.
// DO NOT EDIT DIRECTLY. Edit the @arkzen:error:404 block in the tatemono instead.
// Generated: 2026-10-24T13:18:48.662Z
// ============================================================

import React from 'react'
import Link from 'next/link'

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
