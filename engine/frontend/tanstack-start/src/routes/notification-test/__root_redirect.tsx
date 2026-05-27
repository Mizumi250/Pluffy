// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — notification-test [TanStack]
// Visiting /notification-test redirects to /notification-test/login
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-27T12:25:37.944Z
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/notification-test/__root_redirect')({
  beforeLoad: () => {
    throw redirect({ to: '/notification-test/login', replace: true })
  },
})
