'use client'
// ============================================================
// ARKZEN GENERATED — errors-test/error.tsx
// Next.js segment-scoped runtime error boundary.
// DO NOT EDIT DIRECTLY. Edit the @arkzen:error:500 block in the tatemono instead.
// Generated: 2026-05-23T08:36:26.846Z
// ============================================================

import React from 'react'
import { ErrorScreen } from './components'

const ServerErrorPage = ({ reset }: { reset: () => void }) => <ErrorScreen code={500} reset={reset} />

export default function ArkzenError_ErrorsTest({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  return <ServerErrorPage reset={reset} />
}
