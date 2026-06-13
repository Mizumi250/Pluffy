// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — mail-test [TanStack]
// Visiting /mail-test redirects to /mail-test/login
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-13T08:27:09.013Z
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/mail-test/__root_redirect')({
  beforeLoad: () => {
    throw redirect({ to: '/mail-test/login', replace: true })
  },
})
