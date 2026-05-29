// ============================================================
// ARKZEN GENERATED — Expo Route Registry v2.2
// Auto-updated when tatemonos are built / removed
// DO NOT EDIT — managed by Arkzen engine
//
// Only tatemonos with @arkzen:native:page blocks appear here.
// Web-only tatemonos are never registered.
//
// Consumed by:
//   src/layouts/AuthLayout.tsx   — login route per tatemono
//   src/layouts/GuestLayout.tsx  — dashboard route per tatemono
//   src/layouts/AppLayout.tsx    — app shell per tatemono
// ============================================================

export interface ArkzenExpoRoute {
  tatName:    string
  screenName: string
  /** Expo Router path e.g. '/barbershop-booking/index' */
  routePath:  string
  /** 'guest' | 'auth' | 'app' | 'default' */
  layout:     string
  auth:       boolean
}

export const ARKZEN_EXPO_ROUTES: ArkzenExpoRoute[] = [
// ROUTE:hello-native:index:/hello-native/index:default:false
  { tatName: 'hello-native', screenName: 'index', routePath: '/hello-native/index', layout: 'default', auth: false },
// ROUTE:hello-native:about:/hello-native/about:default:false
  { tatName: 'hello-native', screenName: 'about', routePath: '/hello-native/about', layout: 'default', auth: false },
]

/** Find the login route for a given tatemono */
export function getLoginRoute(tatName: string): string {
  const login = ARKZEN_EXPO_ROUTES.find(
    r => r.tatName === tatName && r.screenName === 'login'
  )
  return login?.routePath ?? `/${tatName}/login`
}

/** Find the dashboard / first auth-required route for a given tatemono */
export function getDashboardRoute(tatName: string): string {
  const dashboard = ARKZEN_EXPO_ROUTES.find(
    r => r.tatName === tatName && (r.screenName === 'dashboard' || r.screenName === 'index') && r.auth
  )
  return dashboard?.routePath ?? `/${tatName}/dashboard`
}
