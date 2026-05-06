'use client'
// ============================================================
// ARKZEN GENERATED — church-community/error.tsx
// Next.js segment-scoped runtime error boundary.
// Rendered when an unhandled exception is thrown during render under /church-community.
// Must be a Client Component — Next.js requirement.
// DO NOT EDIT DIRECTLY. Edit the @arkzen:error:500 block in the tatemono instead.
// Generated: 2026-05-06T11:18:01.304Z
// ============================================================

import React from 'react'
import { ErrorScreen } from './components'

function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-amber-50 to-white">
      <div className="text-center">
        <p className="text-7xl font-light text-amber-300">500</p>
        <p className="text-amber-700 mt-2">Something went wrong</p>
        <button onClick={reset} className="mt-4 px-4 py-2 bg-amber-700 text-white rounded-full text-sm">Try again</button>
      </div>
    </div>
  )
}

export default function ArkzenError_ChurchCommunity({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ServerErrorPage reset={reset} />
}
