// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — auth-test [TanStack]
// Visiting /auth-test redirects to /auth-test/login
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-28T23:23:07.029Z
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/auth-test/__root_redirect')({
  beforeLoad: () => {
    throw redirect({ to: '/auth-test/login', replace: true })
  },
})
