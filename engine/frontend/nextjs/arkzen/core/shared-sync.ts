// ============================================================
// ARKZEN ENGINE — SHARED CORE SYNC
// Copies shared arkzen/core pieces into the current stack:
//   components/, hooks/, lib/
// ============================================================

import * as fs from 'fs'
import * as path from 'path'

const SHARED_FOLDERS = ['components', 'hooks', 'lib'] as const

export function syncSharedCoreToCurrentStack(label: string): void {
  const rootDir = path.resolve(process.cwd(), '..', '..', '..')
  const sharedCoreDir = path.join(rootDir, 'engine', 'shared', 'arkzen', 'core')
  const stackCoreDir = path.join(process.cwd(), 'arkzen', 'core')

  if (!fs.existsSync(sharedCoreDir)) {
    console.warn(`[${label}] ⚠ Shared core not found at ${sharedCoreDir}`)
    return
  }

  fs.mkdirSync(stackCoreDir, { recursive: true })

  for (const folder of SHARED_FOLDERS) {
    const src = path.join(sharedCoreDir, folder)
    const dest = path.join(stackCoreDir, folder)
    if (!fs.existsSync(src)) continue
    fs.mkdirSync(dest, { recursive: true })
    fs.cpSync(src, dest, { recursive: true })
  }

  console.log(`[${label}] ✓ Synced shared core (${SHARED_FOLDERS.join(', ')})`)
}
