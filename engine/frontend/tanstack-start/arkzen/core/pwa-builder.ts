// ARKZEN — TanStack Start PWA Builder
// Delegates to pwa-builder.shared.ts (synced from engine/shared)
import * as fs from 'fs'
import * as path from 'path'
import type { ParsedTatemono } from './parser'
import type { ArkzenPWAConfig } from './pwa-builder.shared'
import {
  generateManifest,
  generateServiceWorker,
  generatePWAHook,
  generateOfflinePageJSX,
  generateSWRegistration,
} from './pwa-builder.shared'

export * from './pwa-builder.shared'

export function generatePWAFiles(parsed: ParsedTatemono, pwaConfig: ArkzenPWAConfig): void {
  const TATEMONO_NAME = path.basename(path.dirname(parsed.sourceFile))
  const PUBLIC_DIR = path.resolve(process.cwd(), 'public')
  const SRC_DIR = path.resolve(process.cwd(), 'src')
  const GENERATED_DIR = path.join(SRC_DIR, 'arkzen', 'generated')

  // Generate manifest.json
  const manifest = generateManifest(pwaConfig)
  const manifestPath = path.join(PUBLIC_DIR, 'manifest.json')
  fs.mkdirSync(path.dirname(manifestPath), { recursive: true })
  fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2), 'utf-8')
  console.log(`[Arkzen TanStack]   ✓ Manifest: ${manifestPath}`)

  // Generate service worker
  const sw = generateServiceWorker(pwaConfig)
  const swPath = path.join(PUBLIC_DIR, 'service-worker.js')
  fs.writeFileSync(swPath, sw, 'utf-8')
  console.log(`[Arkzen TanStack]   ✓ Service Worker: ${swPath}`)

  // Generate PWA hook
  const hook = generatePWAHook()
  const hookPath = path.join(GENERATED_DIR, `usePWA_${TATEMONO_NAME}.ts`)
  fs.mkdirSync(path.dirname(hookPath), { recursive: true })
  fs.writeFileSync(hookPath, hook, 'utf-8')
  console.log(`[Arkzen TanStack]   ✓ PWA Hook: ${hookPath}`)

  // Generate offline page if enabled
  if (pwaConfig.offline) {
    const offlineJSX = generateOfflinePageJSX(TATEMONO_NAME)
    const offlinePath = path.join(GENERATED_DIR, `OfflinePage_${TATEMONO_NAME}.tsx`)
    fs.writeFileSync(offlinePath, offlineJSX, 'utf-8')
    console.log(`[Arkzen TanStack]   ✓ Offline Page: ${offlinePath}`)
  }

  // Generate SW registration snippet (for root layout)
  const registration = generateSWRegistration()
  const regPath = path.join(GENERATED_DIR, `swRegistration_${TATEMONO_NAME}.ts`)
  fs.writeFileSync(regPath, registration, 'utf-8')
  console.log(`[Arkzen TanStack]   ✓ SW Registration: ${regPath}`)
}
