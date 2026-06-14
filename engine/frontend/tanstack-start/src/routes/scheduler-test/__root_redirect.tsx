// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — scheduler-test [TanStack]
// Visiting /scheduler-test redirects to /scheduler-test/dashboard
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-14T02:29:00.319Z
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/scheduler-test/__root_redirect')({
  beforeLoad: () => {
    throw redirect({ to: '/scheduler-test/dashboard', replace: true })
  },
})
