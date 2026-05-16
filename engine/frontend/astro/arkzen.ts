// ============================================================
// ARKZEN ENGINE — ASTRO ENTRY POINT
// Run via: npm run arkzen  (which runs: tsx watch arkzen.ts)
// Called by start.js via: npm run dev
//   → sync:shared && concurrently "npm run arkzen" "astro dev --port 3000"
//
// Watches tatemonos/ and generates:
//   src/pages/{tat}/{page}.astro              ← Astro page shells
//   src/pages/{tat}/{page}.tsx                ← React island components
//   src/pages/{tat}/components/               ← shared component islands
//   src/arkzen/generated/routes.ts            ← route registry
//   src/arkzen/generated/{name}.animations.ts ← GSAP animations
// ============================================================

import { startAstroWatcher } from './arkzen/core/astro-watcher'

startAstroWatcher().catch(error => {
  console.error('[Arkzen Astro] Fatal error starting engine:', error)
  process.exit(1)
})