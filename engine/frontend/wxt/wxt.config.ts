import { defineConfig } from 'wxt'
import tailwindcss from '@tailwindcss/vite'
import { existsSync, readFileSync } from 'node:fs'
import { resolve } from 'node:path'

// Two sources feed the build:
//
//   Normal mode (emitter)           entrypoints/                 written by the engine
//                                   arkzen/generated/manifest.json  manifest data from @arkzen:ext:project
//                                   arkzen/generated/manifest.firefox.json  keys only Firefox gets
//   Reference mode                  reference/<name>/entrypoints/   hand-written known-good target
//                                   reference/<name>/manifest.json
//
// Reference mode is switched on with ARKZEN_EXT_REFERENCE=<name> (see scripts/build-reference.mjs).
// The emitter output must match the reference for the same tatemono.
const reference = process.env.ARKZEN_EXT_REFERENCE
const base      = reference ? `reference/${reference}` : null

const entrypointsDir = base ? `${base}/entrypoints` : 'entrypoints'
const manifestFile   = base ? `${base}/manifest.json` : 'arkzen/generated/manifest.json'
const firefoxFile    = base ? `${base}/manifest.firefox.json` : 'arkzen/generated/manifest.firefox.json'

function readJson(file: string): Record<string, unknown> {
  const full = resolve(import.meta.dirname, file)
  if (!existsSync(full)) return {}
  return JSON.parse(readFileSync(full, 'utf8'))
}

// arkzen/generated/ext.json is written by the emitter (build settings of the tatemono)
const settings = reference ? {} : readJson('arkzen/generated/ext.json')

/** The manifest data for one browser. Chrome gets it as written. */
function manifestFor(browser: string): Record<string, unknown> {
  const data = readJson(manifestFile)
  if (browser !== 'firefox') return data

  // Firefox warns about keys it does not know: minimum_chrome_version, and commands[].global (a Chrome feature).
  const { minimum_chrome_version: _chromeOnly, ...rest } = data
  const commands = rest.commands
  if (commands && typeof commands === 'object') {
    rest.commands = Object.fromEntries(Object.entries(commands as Record<string, Record<string, unknown>>).map(([id, command]) => {
      const { global: _global, ...kept } = command
      return [id, kept]
    }))
  }
  return { ...rest, ...readJson(firefoxFile) }
}

export default defineConfig({
  modules: ['@wxt-dev/module-react'],
  entrypointsDir,
  // ext:script modules are written to ext-scripts/ and imported as '@ext/<name>'
  alias: { '@ext': resolve(import.meta.dirname, 'ext-scripts') },
  manifest: ({ browser }) => manifestFor(browser),
  // The zip is named <zipName>-<version>-<browser>.zip with the tatemono's name and version. WXT would otherwise
  // fill {{version}} from this stack's package.json, so the version is written into the template here.
  ...(typeof settings.zipName === 'string' && typeof settings.version === 'string'
    ? {
        zip: {
          name: settings.zipName,
          artifactTemplate: `{{name}}-${settings.version}-{{browser}}.zip`,
          sourcesTemplate:  `{{name}}-${settings.version}-sources.zip`,
          // WXT zips sources for Firefox on its own. Here it only happens when ext:export says sources_zip: true.
          zipSources: settings.sourcesZip === true,
        },
      }
    : {}),
  vite: () => ({
    plugins: [tailwindcss()],
  }),
})
