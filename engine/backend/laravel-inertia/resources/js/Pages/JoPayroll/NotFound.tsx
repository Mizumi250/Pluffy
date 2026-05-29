// ============================================================
// ARKZEN GENERATED — jo-payroll/NotFound.tsx [React+Inertia]
// Inertia page rendered for unmatched sub-routes under this tatemono.
// Registered as a catch-all route in routes/modules/jo-payroll.pages.php
// DO NOT EDIT — edit the @arkzen:error:404 block in the tatemono instead.
// Generated: 2026-05-29T02:41:49.825Z
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
      <Link href="/jo-payroll" className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-700 transition-colors">
        Back to Dashboard
      </Link>
    </div>
  </div>
)

export default NotFoundPage
