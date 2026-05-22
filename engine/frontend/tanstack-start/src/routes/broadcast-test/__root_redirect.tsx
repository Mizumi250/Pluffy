// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — broadcast-test [TanStack]
// Visiting /broadcast-test redirects to /broadcast-test/login
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-22T06:34:37.108Z
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/broadcast-test/__root_redirect')({
  beforeLoad: () => {
    throw redirect({ to: '/broadcast-test/login', replace: true })
  },
})
