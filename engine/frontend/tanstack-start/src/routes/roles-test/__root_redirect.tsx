// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — roles-test [TanStack]
// Visiting /roles-test redirects to /roles-test/login
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-05-22T04:16:36.201Z
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/roles-test/__root_redirect')({
  beforeLoad: () => {
    throw redirect({ to: '/roles-test/login', replace: true })
  },
})
