// ============================================================
// ARKZEN ENGINE — REACT+VITE ENTRY POINT
// Run: tsx watch arkzen.ts (from engine/frontend/react-vite/)
// Watches tatemonos/ and generates:
//   src/pages/{tat}/{page}.tsx            ← React page components
//   src/arkzen/generated/routes.ts        ← React Router route registry
//   src/arkzen/generated/{name}.animations.ts ← GSAP animations
// ============================================================

import { startViteWatcher } from './arkzen/core/vite-watcher'

startViteWatcher().catch(error => {
  console.error('[Arkzen Vite] Fatal error starting engine:', error)
  process.exit(1)
})