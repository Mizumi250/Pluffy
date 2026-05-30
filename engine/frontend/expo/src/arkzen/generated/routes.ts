// ============================================================
// ARKZEN GENERATED — Expo Route Registry v3.1
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

export interface ArkzenExpoRoute {
  tatName:    string
  screenName: string
  routePath:  string
  layout:     string
  auth:       boolean
}

export const ARKZEN_EXPO_ROUTES: ArkzenExpoRoute[] = [
// ROUTE:hello-native:index:/hello-native/index:default:false
  { tatName: 'hello-native', screenName: 'index', routePath: '/hello-native/index', layout: 'default', auth: false },
// ROUTE:hello-native:about:/hello-native/about:default:false
  { tatName: 'hello-native', screenName: 'about', routePath: '/hello-native/about', layout: 'default', auth: false },
]

export function getLoginRoute(tatName: string): string {
  const login = ARKZEN_EXPO_ROUTES.find(r => r.tatName === tatName && r.screenName === 'login')
  return login?.routePath ?? `/${tatName}/login`
}

export function getDashboardRoute(tatName: string): string {
  const dashboard = ARKZEN_EXPO_ROUTES.find(
    r => r.tatName === tatName && (r.screenName === 'dashboard' || r.screenName === 'index') && r.auth
  )
  return dashboard?.routePath ?? `/${tatName}/dashboard`
}
