// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — upload-test [TanStack]
// Visiting /upload-test redirects to /upload-test/dashboard
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-22T04:46:03.558Z
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/upload-test/__root_redirect')({
  beforeLoad: () => {
    throw redirect({ to: '/upload-test/dashboard', replace: true })
  },
})
