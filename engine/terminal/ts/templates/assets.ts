// Generated: the files your program carries with it.
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

// When assets are embedded their content is in this object (base64), otherwise it is null and
// the files sit beside the code in the assets folder.
const EMBEDDED: Record<string, string> | null = /*__EMBEDDED__*/ null
const NAMES: string[] = /*__NAMES__*/ []
const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../../', /*__DEST__*/ 'assets')

/** The names of all assets, relative to the assets folder. */
export function assetNames(): string[] {
  return [...NAMES]
}

/** Reads an asset, for example readAsset("templates/index.html"). */
export function readAsset(name: string): Buffer {
  const clean = name.replace(/\\/g, '/').replace(/^\.?\//, '')
  if (EMBEDDED) {
    const data = EMBEDDED[clean]
    if (data === undefined) throw new Error(`no such asset: ${clean}`)
    return Buffer.from(data, 'base64')
  }
  const file = path.resolve(ROOT, clean)
  if (path.relative(ROOT, file).startsWith('..')) throw new Error(`no such asset: ${clean}`)
  return fs.readFileSync(file)
}
