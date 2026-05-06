'use client'
// ============================================================
// ARKZEN GENERATED — church-community/error.tsx
// Next.js segment-scoped runtime error boundary.
// Rendered when an unhandled exception is thrown during render under /church-community.
// Must be a Client Component — Next.js requirement.
// DO NOT EDIT DIRECTLY. Edit the @arkzen:error:500 block in the tatemono instead.
// Generated: 2026-05-06T13:26:25.471Z
// ============================================================

import React from 'react'
import { ErrorScreen } from './components'

function Error({ reset }: { error: Error; reset: () => void }) {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #c5d0de 0%, #d4dde8 50%, #bcc8d6 100%)',
    }}>
      <div style={{ textAlign: 'center' }}>
        <p style={{ fontSize: 80, fontWeight: 800, background: Z.purpleGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>500</p>
        <p style={{ color: Z.textMid, marginTop: 8, fontSize: 15 }}>Something went wrong</p>
        <button
          onClick={reset}
          style={{
            display: 'inline-block', marginTop: 20, padding: '10px 28px', borderRadius: 20,
            background: Z.purpleGrad, color: '#fff', fontWeight: 700, fontSize: 14,
            border: 'none', cursor: 'pointer', boxShadow: Z.shadowPurp,
          }}
        >Try again</button>
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
