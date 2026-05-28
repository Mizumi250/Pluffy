// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — mail-test [TanStack]
// Visiting /mail-test redirects to /mail-test/login
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-28T23:23:14.191Z
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/mail-test/__root_redirect')({
  beforeLoad: () => {
    throw redirect({ to: '/mail-test/login', replace: true })
  },
})
