// ============================================================
// ARKZEN ENGINE — EXPO ENTRY POINT v1.0
// Run: tsx watch arkzen.ts (from engine/frontend/expo/)
//
// Watches tatemonos/ and generates:
//   src/screens/{tatName}/{screenName}.tsx  ← Expo screen components
//   src/arkzen/generated/routes.ts          ← Expo Router route config
//   app/{tatName}/{screenName}.tsx          ← Expo Router file-based routes
//
// The generated app is a standard Expo Go project.
// This engine watches and generates — you run Expo separately:
//   cd engine/frontend/expo && npx expo start
// ============================================================

import { startExpoWatcher } from './arkzen/core/expo-watcher'

startExpoWatcher().catch(error => {
  console.error('[Arkzen Expo] Fatal error starting engine:', error)
  process.exit(1)
})
