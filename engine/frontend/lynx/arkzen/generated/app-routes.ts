// ============================================================
// ARKZEN GENERATED — Lynx App Routes (src/arkzen/generated/app-routes.ts)
// DO NOT EDIT DIRECTLY. Managed by arkzen lynx-router.
//
// Pure data — component imports + the route table. Mirrors React+Vite's
// src/arkzen/generated/routes.ts. src/App.tsx is static and imports from
// this file; the generator never touches App.tsx.
//
// Seed file: empty until the watcher runs and registers a tatemono.
// ============================================================

export interface LynxAppRoute {
  module:         string
  page:           string
  component:      any
  layout:         any
  loginRoute:     string
  dashboardRoute: string
}

export const LYNX_ROUTES: LynxAppRoute[] = [
]

export const LYNX_ERROR_404: Record<string, any> = {
}

export const LYNX_ERROR_500: Record<string, any> = {
}

// NOTE on error-500 wiring: Lynx renders through a custom dual-thread
// reconciler (not ReactDOM), so support for class-component error
// boundaries (componentDidCatch) is unconfirmed for this target — shipping
// an unverified boundary here would risk silently breaking every route if
// the renderer doesn't implement that lifecycle. LYNX_ERROR_500 is exposed
// below so a tatemono's error-500 page can be rendered manually (e.g. from
// a try/catch inside the page itself, or wired into a confirmed boundary
// once Lynx error-boundary support is verified against a real build).
export function getLynxError500Page(tatName: string) {
  return LYNX_ERROR_500[tatName] ?? null
}
