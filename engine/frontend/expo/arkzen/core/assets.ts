// ============================================================
// ARKZEN ENGINE — NATIVE ASSETS
// Mirrors web-core/assets.ts for the Expo stack.
//
// Web flow:   tatemonos/{name}/assets/ → public/tatemonos/{name}/assets/
//             referenced as URL: /tatemonos/{name}/assets/images/foo.png
//
// Native flow: tatemonos/{name}/assets/ → engine/frontend/expo/assets/tatemonos/{name}/
//              referenced via require(): require('../../assets/tatemonos/{name}/images/foo.jpg')
//
// Called by expo-builder.ts at build time (Step: Distribute Assets).
// Clean is called at remove time.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'

// ─────────────────────────────────────────────
// RECURSIVE COPY — preserves subfolder structure
// Reuses same logic as web-core/assets.ts
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
        console.warn(`[Arkzen Native Assets] Failed to copy ${entry}:`, err)
      }
    }
  }

  return count
}

// ─────────────────────────────────────────────
// COPY ASSETS TO EXPO ASSETS FOLDER
//
// Output path: engine/frontend/expo/assets/tatemonos/{tatName}/...
// require() in screen:
//   require('../../assets/tatemonos/{tatName}/images/foo.jpg')
//
// expoAssetsPath = absolute path to engine/frontend/expo/assets/
// ─────────────────────────────────────────────

export function copyAssetsToExpo(
  tatName:        string,
  assetsPath:     string,
  expoAssetsPath: string
): boolean {
  if (!fs.existsSync(assetsPath)) {
    return false
  }

  try {
    const destDir = path.join(expoAssetsPath, 'tatemonos', tatName)
    fs.mkdirSync(destDir, { recursive: true })

    const count = copyDirRecursive(assetsPath, destDir)

    if (count === 0) {
      return false
    }

    console.log(`[Arkzen Native Assets] ✓ Copied ${count} file(s) for ${tatName} → assets/tatemonos/${tatName}/`)
    return true
  } catch (err) {
    console.error(`[Arkzen Native Assets] Error during asset distribution:`, err)
    return false
  }
}

// ─────────────────────────────────────────────
// CLEAN OLD ASSETS
// Called by removeExpoTatemono()
// ─────────────────────────────────────────────

export function cleanExpoAssets(
  tatName:        string,
  expoAssetsPath: string
): boolean {
  try {
    const destDir = path.join(expoAssetsPath, 'tatemonos', tatName)

    if (fs.existsSync(destDir)) {
      fs.rmSync(destDir, { recursive: true, force: true })
      console.log(`[Arkzen Native Assets] ✓ Cleaned assets for ${tatName}`)
      return true
    }
  } catch (err) {
    console.warn(`[Arkzen Native Assets] Failed to clean assets for ${tatName}:`, err)
  }

  return false
}
