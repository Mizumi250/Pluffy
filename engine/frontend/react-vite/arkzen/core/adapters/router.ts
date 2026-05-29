// ============================================================
// ARKZEN ENGINE — REACT+VITE ROUTER ADAPTER
// arkzen/core/adapters/router.ts  (React+Vite stack)
// Concrete implementation of useArkzenRouter / useArkzenPathname.
// Shared layouts import from '../adapters/router' — this file
// satisfies that import for the React+Vite stack.
// ============================================================

import { useNavigate, useLocation } from 'react-router'

export interface ArkzenRouter {
  replace: (path: string) => void
  push:    (path: string) => void
}

export function useArkzenRouter(): ArkzenRouter {
  const navigate = useNavigate()
  return {
    replace: (path: string) => navigate(path, { replace: true }),
    push:    (path: string) => navigate(path),
  }
}

export function useArkzenPathname(): string {
  return useLocation().pathname
}
