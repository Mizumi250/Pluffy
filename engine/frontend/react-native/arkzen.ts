// ============================================================
// ARKZEN ENGINE — REACT NATIVE ENTRY POINT
// Run: tsx watch arkzen.ts (from engine/frontend/react-native/)
// Watches tatemonos/ and generates:
//   src/screens/{tat}/{screen}.tsx   ← RN screen components
//   src/arkzen/generated/routes.ts   ← React Navigation route config
//
// NOTE: The generated app is a separate Expo/RN project.
// This engine only generates code — you run the app separately.
// See README.md for full setup.
// ============================================================

import { startNativeWatcher } from './arkzen/core/native-watcher'

startNativeWatcher().catch(error => {
  console.error('[Arkzen Native] Fatal error starting engine:', error)
  process.exit(1)
})