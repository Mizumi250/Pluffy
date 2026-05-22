// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — certflow [TanStack]
// Visiting /certflow redirects to /certflow/login
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-22T23:09:42.273Z
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/certflow/__root_redirect')({
  beforeLoad: () => {
    throw redirect({ to: '/certflow/login', replace: true })
  },
})
