// ============================================================
// PLUFF PACKAGE DERIVERS v1.0
//
// derivePackage({ kind, ... }) -> the description the npm generator builds from:
//   { sources, entries, extraFiles, extraExports, shipFiles, symbols, typeSymbols, typeSamples,
//     consumerChecks, extraTests?, warnings, description, stats }
//
// Kinds: sdk, types, validators, openapi. All four read the same input: the engine's parsed
// output and the OpenAPI document export-openapi.js builds from it.
// ============================================================

import { loadDerivedInput } from '../common/parse-engine.js'
import { deriveOpenApi } from './openapi.js'
import { deriveSdk } from './sdk.js'
import { deriveTypes } from './types.js'
import { deriveValidators } from './validators.js'

export const DERIVED_KINDS = ['sdk', 'types', 'validators', 'openapi']

// Keys each block understands. Others are reported as ignored instead of being silently dropped.
const SUPPORTED = {
  sdk: ['package', 'languages', 'client_name', 'base_url_env', 'auth', 'include', 'exclude', 'style', 'retries'],
  types: ['package', 'languages', 'include', 'exclude', 'from'],
  validators: ['package', 'languages', 'include', 'exclude', 'emit_vectors'],
  openapi: ['package', 'include', 'exclude', 'server_url', 'backend', 'include_docs_html'],
}

const fail = message => { throw new Error(`[pkg] ${message}`) }

export function derivePackage({ kind, rootDir, tatName, pkg, version, stack, backend, apiUrl }) {
  if (!DERIVED_KINDS.includes(kind)) fail(`kind ${kind} is not a derived kind`)
  const spec = pkg[kind]
  if (!spec) fail(`kind: ${kind} needs an @arkzen:pkg:${kind} block`)

  if (kind !== 'openapi') {
    const languages = spec.languages
    if (!Array.isArray(languages) || !languages.includes('ts')) fail(`A ${kind} package for npm is TypeScript: add ts to languages (found ${JSON.stringify(languages)})`)
  }
  const ignored = Object.keys(spec).filter(k => !SUPPORTED[kind].includes(k))
  const input = loadDerivedInput({ rootDir, tatName, stack, backend: spec.backend ?? backend, serverUrl: spec.server_url ?? apiUrl })

  let derived
  if (kind === 'sdk') derived = deriveSdk({ ...input, spec, project: pkg.project, packageId: pkg.id })
  else if (kind === 'types') derived = deriveTypes({ ...input, spec })
  else if (kind === 'validators') derived = deriveValidators({ ...input, spec })
  else derived = deriveOpenApi({ ...input, spec, project: pkg.project, version })

  const warnings = [...(derived.warnings ?? [])]
  if (ignored.length) warnings.push(`@arkzen:pkg:${kind} keys not implemented yet and ignored: ${ignored.join(', ')}`)
  const others = Array.isArray(spec.languages) ? spec.languages.filter(l => l !== 'ts') : []
  if (others.length) warnings.push(`languages ${others.join(', ')} belong to other registry targets (not implemented yet); only ts was generated`)
  return { ...derived, warnings, backend: input.backend }
}
