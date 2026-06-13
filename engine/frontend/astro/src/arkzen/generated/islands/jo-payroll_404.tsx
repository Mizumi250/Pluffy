// ARKZEN GENERATED 404 ISLAND — jo-payroll
// DO NOT EDIT DIRECTLY.

import React from 'react'
import { ErrorScreen } from '@/arkzen/generated/components/jo-payroll/ErrorScreen'
import { Link } from '@/arkzen/core/adapters/Link'

import React from 'react'

const NotFoundPage = () => (
  <div className="min-h-screen bg-[#F4F5F7] flex items-center justify-center p-8 font-['Inter',sans-serif]">
    <style>{`@import url('https://fonts.googleapis.com/css2?family=DM+Sans:wght@400;500;600&family=Plus Jakarta Sans:wght@700;800&display=swap');`}</style>
    <div className="text-center max-w-md">
      <p className="text-[120px] font-black text-neutral-200 font-['Plus Jakarta Sans',sans-serif] leading-none">404</p>
      <h1 className="text-xl font-bold text-neutral-900 font-['Plus Jakarta Sans',sans-serif] -mt-2 mb-2">Page not found</h1>
      <p className="text-sm text-neutral-500 mb-6">The page you're looking for doesn't exist in this module.</p>
      <Link href="/jo-payroll" className="inline-flex items-center gap-2 px-5 py-2.5 bg-neutral-900 text-white text-sm font-semibold rounded-xl hover:bg-neutral-700 transition-colors">
        Back to Dashboard
      </Link>
    </div>
  </div>
)

export default NotFoundPage
