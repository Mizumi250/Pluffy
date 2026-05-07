// ============================================================
// ARKZEN ENGINE — REACT+INERTIA ENTRY POINT
// Run: tsx watch arkzen.ts (from engine/frontend/react-inertia/)
// Watches tatemonos/ and generates:
//   ../../backend/laravel-inertia/resources/js/Pages/{tat}/{Page}.tsx
//   ../../backend/laravel-inertia/routes/modules/{tat}.php  ← via backend bridge
// ============================================================

import { startInertiaWatcher } from './arkzen/core/inertia-watcher'

startInertiaWatcher().catch(error => {
  console.error('[Arkzen Inertia] Fatal error starting engine:', error)
  process.exit(1)
})
