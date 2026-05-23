// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — certflow [TanStack]
// Visiting /certflow redirects to /certflow/login
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-23T13:04:07.472Z
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/certflow/__root_redirect')({
  beforeLoad: () => {
    throw redirect({ to: '/certflow/login', replace: true })
  },
})
