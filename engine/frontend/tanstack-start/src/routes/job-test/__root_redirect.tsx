// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — job-test [TanStack]
// Visiting /job-test redirects to /job-test/dashboard
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-13T08:27:08.656Z
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/job-test/__root_redirect')({
  beforeLoad: () => {
    throw redirect({ to: '/job-test/dashboard', replace: true })
  },
})
