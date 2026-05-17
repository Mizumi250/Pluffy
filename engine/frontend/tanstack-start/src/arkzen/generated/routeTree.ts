// ============================================================
// ARKZEN GENERATED — Route Tree (TanStack Start)
// Auto-updated when tatemonos are built/removed.
// DO NOT EDIT — managed by Arkzen engine (tanstack-router.ts)
// ============================================================

import { createRootRoute, createRoute, createRouter, lazyRouteComponent } from '@tanstack/react-router'
import { Route as RootRoute } from '../../routes/__root'
import { Route as IndexRoute } from '../../routes/index'

// ─── Tatemono page routes (injected by Arkzen engine) ────────

// TANSTACK_ROUTE_IMPORTS_START

// TANSTACK_ROUTE_IMPORTS_END

// ─── Route tree assembly ──────────────────────────────────────

const routeTree = RootRoute.addChildren([
  IndexRoute,

  // TANSTACK_ROUTE_CHILDREN_START

  // TANSTACK_ROUTE_CHILDREN_END
])

export { routeTree }

// ─── Auth tatemonos manifest ──────────────────────────────────

// TANSTACK_AUTH_TATEMONOS_START
export const AUTH_TATEMONOS: string[] = [

]
// TANSTACK_AUTH_TATEMONOS_END
