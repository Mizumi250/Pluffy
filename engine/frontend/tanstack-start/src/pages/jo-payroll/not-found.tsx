// ============================================================
// ARKZEN GENERATED — jo-payroll/not-found [TanStack]
// Rendered by the wildcard route /jo-payroll/* for any
// unmatched sub-path under this tatemono prefix.
// DO NOT EDIT — edit @arkzen:error:404 in tatemono instead
// Generated: 2026-05-22T04:46:00.655Z
// ============================================================

import React from 'react'
import { ErrorScreen } from './components'

const NotFoundPage = () => (
  <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-8 font-['DM_Sans',sans-serif]">
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Syne:wght@700;800&display=swap');`}</style>
    <div className="text-center max-w-md">
      <p className="text-[120px] font-black text-neutral-200 font-['Syne',sans-serif] leading-none">404</p>
      <h1 className="text-xl font-bold text-neutral-900 font-['Syne',sans-serif] -mt-2 mb-2">Page not found</h1>
      <p className="text-sm text-neutral-500 mb-6">The page you're looking for doesn't exist in this module.</p>
      <Link to="/jo-payroll" className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-700 transition-colors">
        Back to Dashboard
      </Link>
    </div>
  </div>
)

export default NotFoundPage
