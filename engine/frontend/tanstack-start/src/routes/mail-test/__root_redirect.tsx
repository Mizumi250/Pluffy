// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — mail-test [TanStack]
// Visiting /mail-test redirects to /mail-test/login
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-22T23:09:43.892Z
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/mail-test/__root_redirect')({
  beforeLoad: () => {
    throw redirect({ to: '/mail-test/login', replace: true })
  },
})
