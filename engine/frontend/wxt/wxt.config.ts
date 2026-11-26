import { defineConfig } from 'wxt'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Two sources feed the build:
//
//   Normal mode (emitter, Phase 3)  entrypoints/                 written by the engine
//                                   arkzen/generated/manifest.json  manifest data from @arkzen:ext:project
//   Reference mode                  reference/<name>/entrypoints/   hand-written known-good target
//                                   reference/<name>/manifest.json
//
// Reference mode is switched on with ARKZEN_EXT_REFERENCE=<name> (see scripts/build-reference.mjs).
// The emitter output must match the reference for the same tatemono.
const reference = process.env.ARKZEN_EXT_REFERENCE
const base      = reference ? `reference/${reference}` : null

const entrypointsDir = base ? `${base}/entrypoints` : 'entrypoints'
const manifestFile   = base ? `${base}/manifest.json` : 'arkzen/generated/manifest.json'

function readManifestData(): Record<string, unknown> {
  const file = resolve(import.meta.dirname, manifestFile)
  if (!existsSync(file)) return {}
  return JSON.parse(readFileSync(file, 'utf8'))
}

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  entrypointsDir,
  manifest: () => readManifestData(),
  vite: () => ({
    plugins: [tailwindcss()],
  }),
})
