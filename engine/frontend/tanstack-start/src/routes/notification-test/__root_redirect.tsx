// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — notification-test [TanStack]
// Visiting /notification-test redirects to /notification-test/login
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-14T02:28:57.935Z
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/notification-test/__root_redirect')({
  beforeLoad: () => {
    throw redirect({ to: '/notification-test/login', replace: true })
  },
})
