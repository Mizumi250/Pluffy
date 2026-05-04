// ============================================================
// ARKZEN ENGINE — INERTIA ENTRY POINT
// Run: tsx watch arkzen.ts (from engine/frontend/react-inertia/)
// Watches tatemonos/ and generates:
//   resources/js/Pages/{tat}/{page}.tsx    ← Inertia page components
//   resources/js/arkzen/generated/pages.ts ← Inertia page registry
//   ../../backend/laravel routes injected  ← via backend-bridge
// ============================================================

import { startInertiaWatcher } from './arkzen/core/inertia-watcher'

startInertiaWatcher().catch(error => {
  console.error('[Arkzen Inertia] Fatal error starting engine:', error)
  process.exit(1)
})