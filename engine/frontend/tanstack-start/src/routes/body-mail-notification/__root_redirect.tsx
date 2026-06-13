// ============================================================
// ARKZEN GENERATED ROOT REDIRECT — body-mail-notification [TanStack]
// Visiting /body-mail-notification redirects to /body-mail-notification/login
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-06-13T08:08:52.205Z
// ============================================================

import { createFileRoute, redirect } from '@tanstack/react-router'

export const Route = createFileRoute('/body-mail-notification/__root_redirect')({
  beforeLoad: () => {
    throw redirect({ to: '/body-mail-notification/login', replace: true })
  },
})
