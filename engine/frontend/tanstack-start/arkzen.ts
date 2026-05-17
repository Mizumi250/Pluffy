// ============================================================
// ARKZEN ENGINE — TANSTACK START ENTRY POINT
// Run: tsx watch arkzen.ts (from engine/frontend/tanstack-start/)
// Watches tatemonos/ and generates:
//   src/pages/{tat}/{page}.tsx                    ← React page components
//   src/routes/{tat}/{page}.tsx                   ← TanStack file-based routes
//   src/arkzen/generated/routeTree.ts             ← assembled route tree
//   src/arkzen/generated/{name}.animations.ts     ← GSAP animations
// ============================================================

import { startTanStackWatcher } from './arkzen/core/tanstack-watcher'

startTanStackWatcher().catch(error => {
  console.error('[Arkzen TanStack] Fatal error starting engine:', error)
  process.exit(1)
})
