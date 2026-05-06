// ============================================================
// ARKZEN ENGINE — SHARED CORE SYNC
// Copies shared arkzen/core pieces into the current stack:
//   components/, hooks/, lib/
// Skips unchanged files to avoid watch-restart loops.
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
    syncDirectoryIfChanged(src, dest)
  }

  console.log(`[${label}] ✓ Synced shared core (${SHARED_FOLDERS.join(', ')})`)
}

function syncDirectoryIfChanged(srcDir: string, destDir: string): void {
  fs.mkdirSync(destDir, { recursive: true })

  for (const entry of fs.readdirSync(srcDir, { withFileTypes: true })) {
    const srcPath = path.join(srcDir, entry.name)
    const destPath = path.join(destDir, entry.name)

    if (entry.isDirectory()) {
      syncDirectoryIfChanged(srcPath, destPath)
      continue
    }

    if (!entry.isFile()) continue

    if (!fs.existsSync(destPath)) {
      fs.copyFileSync(srcPath, destPath)
      continue
    }

    const srcStat = fs.statSync(srcPath)
    const destStat = fs.statSync(destPath)
    if (srcStat.size === destStat.size) {
      const srcBuf = fs.readFileSync(srcPath)
      const destBuf = fs.readFileSync(destPath)
      if (srcBuf.equals(destBuf)) {
        continue
      }
    }

    fs.copyFileSync(srcPath, destPath)
  }
}
