// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — broadcast-test [TanStack]
// Visiting /broadcast-test redirects to /broadcast-test/login
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-14T02:28:52.473Z
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/broadcast-test/__root_redirect')({
  beforeLoad: () => {
    throw redirect({ to: '/broadcast-test/login', replace: true })
  },
})
