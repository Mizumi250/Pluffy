import fs from 'fs'
import path from 'path'

// ─────────────────────────────────────────────
// FILE TYPE CATEGORIZATION
// ─────────────────────────────────────────────

const FILE_TYPE_MAP: Record<string, string[]> = {
  images: ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico', '.bmp', '.tiff'],
  videos: ['.mp4', '.webm', '.mov', '.avi', '.mkv', '.flv', '.m4v', '.mpg', '.mpeg'],
  audio: ['.mp3', '.wav', '.ogg', '.aac', '.flac', '.m4a', '.wma'],
  documents: ['.pdf', '.doc', '.docx', '.txt', '.xlsx', '.xls', '.csv', '.ppt', '.pptx'],
  fonts: ['.woff', '.woff2', '.ttf', '.otf', '.eot', '.fnt'],
  archives: ['.zip', '.rar', '.7z', '.tar', '.gz', '.bz2'],
  data: ['.json', '.xml', '.yaml', '.yml', '.toml', '.csv'],
  code: ['.js', '.ts', '.jsx', '.tsx', '.py', '.java', '.go', '.rs', '.cpp', '.c', '.h'],
}

// ─────────────────────────────────────────────
// GET FILE TYPE CATEGORY
// ─────────────────────────────────────────────

function getFileTypeCategory(filename: string): string {
  const ext = path.extname(filename).toLowerCase()

  for (const [category, extensions] of Object.entries(FILE_TYPE_MAP)) {
    if (extensions.includes(ext)) {
      return category
    }
  }

  return 'other'
}

// ─────────────────────────────────────────────
// CATEGORIZE ASSETS FOLDER (flat, top-level only)
// ─────────────────────────────────────────────

interface CategorizedAssets {
  [category: string]: string[]
}

export function categorizeAssets(folderPath: string): CategorizedAssets {
  const result: CategorizedAssets = {}

  if (!fs.existsSync(folderPath)) {
    return result
  }

  try {
    const files = fs.readdirSync(folderPath)

    for (const file of files) {
      const fullPath = path.join(folderPath, file)
      const stat = fs.statSync(fullPath)

      // Skip directories and hidden files
      if (stat.isDirectory() || file.startsWith('.')) {
        continue
      }

      const category = getFileTypeCategory(file)

      if (!result[category]) {
        result[category] = []
      }

      result[category].push(file)
    }
  } catch (err) {
    console.error(`[Arkzen Assets] Error reading folder ${folderPath}:`, err)
  }

  return result
}

// ─────────────────────────────────────────────
// RECURSIVE COPY — preserves subfolder structure
// This is what makes /assets/images/foo.png work
// ─────────────────────────────────────────────

function copyDirRecursive(src: string, dest: string): number {
  let count = 0

  if (!fs.existsSync(src)) return count

  const entries = fs.readdirSync(src)

  for (const entry of entries) {
    if (entry.startsWith('.')) continue

    const srcPath = path.join(src, entry)
    const destPath = path.join(dest, entry)
    const stat = fs.statSync(srcPath)

    if (stat.isDirectory()) {
      // Recurse into subdirectory
      fs.mkdirSync(destPath, { recursive: true })
      count += copyDirRecursive(srcPath, destPath)
    } else {
      // Copy the file
      fs.mkdirSync(path.dirname(destPath), { recursive: true })
      try {
        fs.copyFileSync(srcPath, destPath)
        count++
      } catch (err) {
        console.warn(`[Arkzen Assets] Failed to copy ${entry}:`, err)
      }
    }
  }

  return count
}

// ─────────────────────────────────────────────
// COPY ASSETS TO PUBLIC FOLDER
//
// Output path: public/tatemonos/{tatName}/assets/...
// Browser URL: /tatemonos/{tatName}/assets/...
//
// This matches what ASSET_REGISTRY in core.tsx
// expects: /tatemonos/asset-hub/assets/images/foo.png
// ─────────────────────────────────────────────

export function copyAssetsToPublic(
  tatName: string,
  assetsPath: string,
  publicPath: string
): boolean {
  if (!fs.existsSync(assetsPath)) {
    return false
  }

  try {
    // Output to: public/tatemonos/{tatName}/assets/
    const destDir = path.join(publicPath, 'tatemonos', tatName, 'assets')
    fs.mkdirSync(destDir, { recursive: true })

    const count = copyDirRecursive(assetsPath, destDir)

    if (count === 0) {
      return false
    }

    console.log(`[Arkzen Assets] ✓ Copied ${count} file(s) for ${tatName} → /tatemonos/${tatName}/assets/`)
    return true
  } catch (err) {
    console.error(`[Arkzen Assets] Error during asset distribution:`, err)
    return false
  }
}

// ─────────────────────────────────────────────
// CLEAN OLD ASSETS
// ─────────────────────────────────────────────

export function cleanOldAssets(tatName: string, publicPath: string): boolean {
  try {
    // Clean the new path location
    const newPath = path.join(publicPath, 'tatemonos', tatName, 'assets')
    if (fs.existsSync(newPath)) {
      fs.rmSync(newPath, { recursive: true, force: true })
      console.log(`[Arkzen Assets] ✓ Cleaned old assets for ${tatName}`)
      return true
    }

    // Also clean the old path location (migration safety)
    const oldPath = path.join(publicPath, 'assets', tatName)
    if (fs.existsSync(oldPath)) {
      fs.rmSync(oldPath, { recursive: true, force: true })
      console.log(`[Arkzen Assets] ✓ Cleaned legacy assets for ${tatName}`)
      return true
    }
  } catch (err) {
    console.warn(`[Arkzen Assets] Failed to clean old assets:`, err)
  }

  return false
}

// ─────────────────────────────────────────────
// SUPPORTED FILE TYPES (FOR DOCUMENTATION)
// ─────────────────────────────────────────────

export function getSupportedFileTypes(): Record<string, string[]> {
  return FILE_TYPE_MAP
}

export function getSupportedExtensions(): string[] {
  const extensions: string[] = []
  for (const exts of Object.values(FILE_TYPE_MAP)) {
    extensions.push(...exts)
  }
  return extensions.sort()
}
