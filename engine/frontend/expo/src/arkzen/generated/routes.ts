// ============================================================
// ARKZEN GENERATED — Expo Route Registry v1.0
// src/arkzen/generated/routes.ts
//
// Auto-updated when tatemonos are built / removed.
// DO NOT EDIT — managed by Arkzen engine.
//
// Consumed by:
//   app/index.tsx              — redirects to first route
//   src/layouts/AuthLayout     — finds login route per tatemono
//   src/layouts/GuestLayout    — finds dashboard route per tatemono
// ============================================================

export interface ArkzenExpoRoute {
  tatName:    string
  screenName: string
  /** Expo Router path e.g. '/barbershop-booking/index' */
  routePath:  string
  /** 'guest' | 'auth' | 'blank' */
  layout:     string
  auth:       boolean
}

export const ARKZEN_EXPO_ROUTES: ArkzenExpoRoute[] = [
  // Routes auto-injected here by expo-router.ts
]

/** Find the login route for a given tatemono */
export function getLoginRoute(tatName: string): string {
  const login = ARKZEN_EXPO_ROUTES.find(
    r => r.tatName === tatName && r.screenName === 'login',
  )
  return login?.routePath ?? `/${tatName}/login`
}

/** Find the dashboard / first auth-required route for a given tatemono */
export function getDashboardRoute(tatName: string): string {
  const dashboard = ARKZEN_EXPO_ROUTES.find(
    r =>
      r.tatName === tatName &&
      (r.screenName === 'dashboard' || r.screenName === 'index') &&
      r.auth,
  )
  return dashboard?.routePath ?? `/${tatName}/dashboard`
}
