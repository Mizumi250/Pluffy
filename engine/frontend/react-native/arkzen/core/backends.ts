// ============================================================
// ARKZEN ENGINE — BACKEND VARIANTS v1.0
//
// Maps the active backend (arkzen.json "activeBackend") to the DSL
// variant suffix its code blocks use. Laravel is the reference
// backend; every other backend imitates it.
//
//   laravel / laravel-inertia → php
//   express                   → ts
//   fastapi / django          → py
//   spring-boot               → java
//   aspnet                    → cs
//
// Suffix names are not final (see TEMP_PLUFF_FEATURE_PLAN.md). Keep
// them in this one file so a rename is a single edit. mizumi.js keeps
// its own copy of the backend → variant map for display only.
//
// Block syntax (variant sits between the marker and the name, same
// idea as the frontend :expo / :rn / :lynx variants):
//
//   /* @arkzen:middleware:ts:requireJson
//   */
//   ...body...
//   /* @arkzen:middleware:ts:requireJson:end */
//
// An unsuffixed block with a code body is treated as :php (legacy).
// An unsuffixed block with no code body is shared by every backend.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'

export type BackendVariant = 'php' | 'ts' | 'py' | 'java' | 'cs'

export const VARIANT_TOKENS: BackendVariant[] = ['php', 'ts', 'py', 'java', 'cs']

export const BACKEND_VARIANTS: Record<string, BackendVariant> = {
  'laravel':         'php',
  'laravel-inertia': 'php',
  'express':         'ts',
  'fastapi':         'py',
  'django':          'py',
  'spring-boot':     'java',
  'aspnet':          'cs',
}

/** Walks up from startPath to the root arkzen.json and returns the effective backend name. */
export function resolveActiveBackend(startPath: string = process.cwd()): string {
  if (process.env.PLUFF_BACKEND && BACKEND_VARIANTS[process.env.PLUFF_BACKEND]) {
    return process.env.PLUFF_BACKEND
  }
  let dir = path.resolve(startPath)
  try { if (fs.statSync(dir).isFile()) dir = path.dirname(dir) } catch { /* keep dir */ }

  for (let i = 0; i < 12; i++) {
    const file = path.join(dir, 'arkzen.json')
    if (fs.existsSync(file)) {
      try {
        const json = JSON.parse(fs.readFileSync(file, 'utf-8'))
        // The root registry has activeStack; stack-local arkzen.json files do not.
        if (json && typeof json === 'object' && 'activeStack' in json) {
          if (json.activeStack === 'react-inertia') return 'laravel-inertia'
          return BACKEND_VARIANTS[json.activeBackend] ? json.activeBackend : 'laravel'
        }
      } catch { /* malformed json: keep walking */ }
    }
    const parent = path.dirname(dir)
    if (parent === dir) break
    dir = parent
  }
  return 'laravel'
}

export function activeBackendVariant(startPath: string = process.cwd()): BackendVariant {
  return BACKEND_VARIANTS[resolveActiveBackend(startPath)] ?? 'php'
}
