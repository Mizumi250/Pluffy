// ============================================================
// ARKZEN ENGINE — LYNX ROUTER ADAPTER v1.0
// arkzen/core/adapters/router.ts  (Lynx stack)
//
// Lynx has no built-in router (no expo-router, no react-router).
// The generated App.tsx owns navigation state. This adapter
// provides a no-op / global-state shim so shared layouts that
// import from '../adapters/router' compile without errors.
//
// Real navigation is driven by the `navigate` prop injected
// by App.tsx into every page component:
//   navigate({ module: 'my-tat', page: 'dashboard' })
//
// useArkzenRouter() here is a fallback for shared layout code
// that may call router.replace() — it logs a warning if used
// outside of App.tsx's navigate context.
// ============================================================

import { useState } from '@lynx-js/react'

export interface ArkzenRouter {
  replace: (path: string) => void
  push:    (path: string) => void
}

// Global navigation callback — set by App.tsx via setGlobalNavigate()
let _globalNavigate: ((key: { module: string; page: string }) => void) | null = null

export function setGlobalNavigate(fn: (key: { module: string; page: string }) => void): void {
  _globalNavigate = fn
}

// Parses '/module/page' → { module, page } or falls back to index
function parsePath(path: string): { module: string; page: string } {
  const parts = path.replace(/^\//, '').split('/')
  return {
    module: parts[0] ?? 'index',
    page:   parts[1] ?? 'index',
  }
}

export function useArkzenRouter(): ArkzenRouter {
  return {
    replace: (path: string) => {
      if (_globalNavigate) {
        _globalNavigate(parsePath(path))
      } else {
        console.warn('[Arkzen Lynx Router] useArkzenRouter().replace() called before App.tsx set navigate context. Path:', path)
      }
    },
    push: (path: string) => {
      if (_globalNavigate) {
        _globalNavigate(parsePath(path))
      } else {
        console.warn('[Arkzen Lynx Router] useArkzenRouter().push() called before App.tsx set navigate context. Path:', path)
      }
    },
  }
}

// Returns a flat '/module/page' string — layouts that call useArkzenPathname()
// get the current simulated path based on global navigate state.
// This is a simplified shim; complex pathname-based logic should use
// the navigate prop directly in page components.
export function useArkzenPathname(): string {
  return '/'
}
