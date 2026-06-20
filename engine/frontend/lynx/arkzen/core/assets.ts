// ============================================================
// ARKZEN ENGINE — LYNX ASSETS v1.0
// arkzen/core/assets.ts
//
// Lynx port of native-core/assets.ts.
//
// Key difference from Expo:
//   Expo flow:  tatemonos/{name}/assets/ → engine/frontend/expo/assets/tatemonos/{name}/
//               referenced via require('../../assets/tatemonos/{name}/images/foo.jpg')
//
//   Lynx flow:  tatemonos/{name}/assets/ → engine/frontend/lynx/src/assets/tatemonos/{name}/
//               referenced via ES import (Rspeedy/Rsbuild static asset handling):
//                 import foo from '../../assets/tatemonos/{name}/images/foo.jpg'
//                 <image src={foo} />
//               NOT require() — Lynx/Rspack resolves static asset imports to a
//               URL string at build time, same mechanism as the existing
//               `import arrow from './assets/arrow.png'` pattern already used
//               in src/App.tsx.
//
// Called by lynx-builder.ts at build time (Step: Distribute Assets).
// Clean is called at remove time.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'

// ─────────────────────────────────────────────
// RECURSIVE COPY — preserves subfolder structure
// Reuses same logic as web-core/assets.ts and native-core/assets.ts
// ─────────────────────────────────────────────

function copyDirRecursive(src: string, dest: string): number {
  let count = 0

  if (!fs.existsSync(src)) return count

  const entries = fs.readdirSync(src)

  for (const entry of entries) {
    if (entry.startsWith('.')) continue

    const srcPath  = path.join(src, entry)
    const destPath = path.join(dest, entry)
    const stat     = fs.statSync(srcPath)

    if (stat.isDirectory()) {
      fs.mkdirSync(destPath, { recursive: true })
      count += copyDirRecursive(srcPath, destPath)
    } else {
      fs.mkdirSync(path.dirname(destPath), { recursive: true })
      try {
        fs.copyFileSync(srcPath, destPath)
        count++
      } catch (err) {
        console.warn(`[Arkzen Lynx Assets] Failed to copy ${entry}:`, err)
      }
    }
  }

  return count
}

// ─────────────────────────────────────────────
// COPY ASSETS TO LYNX SRC/ASSETS FOLDER
//
// Output path: engine/frontend/lynx/src/assets/tatemonos/{tatName}/...
// import in screen:
//   import foo from '../../assets/tatemonos/{tatName}/images/foo.jpg'
//
// lynxAssetsPath = absolute path to engine/frontend/lynx/src/assets/
// ─────────────────────────────────────────────

export function copyAssetsToLynx(
  tatName:        string,
  assetsPath:     string,
  lynxAssetsPath: string
): boolean {
  if (!fs.existsSync(assetsPath)) {
    return false
  }

  try {
    const destDir = path.join(lynxAssetsPath, 'tatemonos', tatName)
    fs.mkdirSync(destDir, { recursive: true })

    const count = copyDirRecursive(assetsPath, destDir)

    if (count === 0) {
      return false
    }

    console.log(`[Arkzen Lynx Assets] ✓ Copied ${count} file(s) for ${tatName} → src/assets/tatemonos/${tatName}/`)
    return true
  } catch (err) {
    console.error(`[Arkzen Lynx Assets] Error during asset distribution:`, err)
    return false
  }
}

// ─────────────────────────────────────────────
// CLEAN OLD ASSETS
// Called by removeLynxTatemono()
// ─────────────────────────────────────────────

export function cleanLynxAssets(
  tatName:        string,
  lynxAssetsPath: string
): boolean {
  try {
    const destDir = path.join(lynxAssetsPath, 'tatemonos', tatName)

    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true, force: true })
      console.log(`[Arkzen Lynx Assets] ✓ Cleaned assets for ${tatName}`)
      return true
    }
  } catch (err) {
    console.warn(`[Arkzen Lynx Assets] Failed to clean assets for ${tatName}:`, err)
  }

  return false
}




