// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — auth-test [TanStack]
// Visiting /auth-test redirects to /auth-test/login
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-22T06:34:36.242Z
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth-test/__root_redirect')({
  beforeLoad: () => {
    throw redirect({ to: '/auth-test/login', replace: true })
  },
})
