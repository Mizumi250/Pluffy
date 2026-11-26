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

function readJson(file: string): Record<string, unknown> {
  const full = resolve(import.meta.dirname, file)
  if (!existsSync(full)) return {}
  return JSON.parse(readFileSync(full, 'utf8'))
}

// arkzen/generated/ext.json is written by the emitter (build settings of the tatemono)
const settings = reference ? {} : readJson('arkzen/generated/ext.json')

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  entrypointsDir,
  manifest: () => readJson(manifestFile),
  // The zip is named <zipName>-<version>-<browser>.zip with the tatemono's name and version. WXT would otherwise
  // fill {{version}} from this stack's package.json, so the version is written into the template here.
  ...(typeof settings.zipName === 'string' && typeof settings.version === 'string'
    ? { zip: { name: settings.zipName, artifactTemplate: `{{name}}-${settings.version}-{{browser}}.zip` } }
    : {}),
  vite: () => ({
    plugins: [tailwindcss()],
  }),
})
