// ============================================================
// ARKZEN ENGINE — ROUTER ADAPTER INTERFACE
// engine/shared/arkzen/core/adapters/router.ts
//
// This file is the INTERFACE DEFINITION only.
// It is NOT sync-copied to stacks — each stack ships its own
// concrete implementation at arkzen/core/adapters/router.ts.
//
// Interface:
//   useArkzenRouter()   → { replace(path): void, push(path): void }
//   useArkzenPathname() → string  (current pathname)
//
// Next.js implementation uses next/navigation.
// React+Vite implementation uses react-router-dom.
// ============================================================

export interface ArkzenRouter {
  replace: (path: string) => void
  push:    (path: string) => void
}

// These are re-exported by each stack's local adapter:
export declare function useArkzenRouter():   ArkzenRouter
export declare function useArkzenPathname(): string
