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
// ROUTE:auth-test:login:/auth-test/login:guest:false
  { tatName: 'auth-test', screenName: 'login', routePath: '/auth-test/login', layout: 'guest', auth: false },
// ROUTE:auth-test:register:/auth-test/register:guest:false
  { tatName: 'auth-test', screenName: 'register', routePath: '/auth-test/register', layout: 'guest', auth: false },
// ROUTE:auth-test:dashboard:/auth-test/dashboard:auth:true
  { tatName: 'auth-test', screenName: 'dashboard', routePath: '/auth-test/dashboard', layout: 'auth', auth: true },
// ROUTE:crud-test:index:/crud-test:default:false
  { tatName: 'crud-test', screenName: 'index', routePath: '/crud-test', layout: 'default', auth: false },
// ROUTE:hello-native:index:/hello-native:default:false
  { tatName: 'hello-native', screenName: 'index', routePath: '/hello-native', layout: 'default', auth: false },
// ROUTE:hello-native:about:/hello-native/about:default:false
  { tatName: 'hello-native', screenName: 'about', routePath: '/hello-native/about', layout: 'default', auth: false },
// ROUTE:upload-test:dashboard:/upload-test/dashboard:default:false
  { tatName: 'upload-test', screenName: 'dashboard', routePath: '/upload-test/dashboard', layout: 'default', auth: false },
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
