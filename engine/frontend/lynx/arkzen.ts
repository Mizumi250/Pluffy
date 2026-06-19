// ============================================================
// ARKZEN ENGINE — LYNX ENTRY POINT v1.0
// Run: tsx watch arkzen.ts (from engine/frontend/lynx/)
//
// Watches tatemonos/ and generates:
//   src/pages/{tatName}/{pageName}.tsx   ← Lynx page components
//   src/pages/{tatName}/components/*.tsx ← Lynx components
//   src/arkzen/generated/routes.ts       ← Lynx route registry
//   src/App.tsx                          ← Regenerated entry point
//
// The generated app is a standard Rspeedy / ReactLynx project.
// This engine watches and generates — you run Lynx separately:
//   cd engine/frontend/lynx && npx rspeedy dev
//   (then scan the QR code with the LynxExplorer app)
// ============================================================

import { startLynxWatcher } from './arkzen/core/lynx-watcher'

startLynxWatcher().catch(error => {
  console.error('[Arkzen Lynx] Fatal error starting engine:', error)
  process.exit(1)
})