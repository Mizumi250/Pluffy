// ============================================================
// ARKZEN — TanStack Router Factory
// src/router.tsx
//
// createRouter() is called by both client.tsx and server.tsx.
// Imports the generated route tree from src/arkzen/generated/routeTree.ts
// which Arkzen rebuilds whenever a tatemono is added/removed.
// ============================================================

import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './arkzen/generated/routeTree'

export function createRouter() {
  return createTanStackRouter({
    routeTree,
    defaultPreload: 'intent',
    scrollRestoration: true,
  })
}

// Augment TanStack Router's Register type so useRouter() is fully typed
declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof createRouter>
  }
}
