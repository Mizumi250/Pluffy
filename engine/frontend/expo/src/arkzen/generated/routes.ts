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
// ROUTE:broadcast-test:login:/broadcast-test/login:guest:false
  { tatName: 'broadcast-test', screenName: 'login', routePath: '/broadcast-test/login', layout: 'guest', auth: false },
// ROUTE:broadcast-test:register:/broadcast-test/register:guest:false
  { tatName: 'broadcast-test', screenName: 'register', routePath: '/broadcast-test/register', layout: 'guest', auth: false },
// ROUTE:broadcast-test:dashboard:/broadcast-test/dashboard:auth:true
  { tatName: 'broadcast-test', screenName: 'dashboard', routePath: '/broadcast-test/dashboard', layout: 'auth', auth: true },
// ROUTE:crud-test:index:/crud-test:default:false
  { tatName: 'crud-test', screenName: 'index', routePath: '/crud-test', layout: 'default', auth: false },
// ROUTE:errors-test:index:/errors-test:default:false
  { tatName: 'errors-test', screenName: 'index', routePath: '/errors-test', layout: 'default', auth: false },
// ROUTE:events-test:index:/events-test:default:false
  { tatName: 'events-test', screenName: 'index', routePath: '/events-test', layout: 'default', auth: false },
// ROUTE:hello-native:index:/hello-native:default:false
  { tatName: 'hello-native', screenName: 'index', routePath: '/hello-native', layout: 'default', auth: false },
// ROUTE:hello-native:about:/hello-native/about:default:false
  { tatName: 'hello-native', screenName: 'about', routePath: '/hello-native/about', layout: 'default', auth: false },
// ROUTE:inventory-management:index:/inventory-management:default:false
  { tatName: 'inventory-management', screenName: 'index', routePath: '/inventory-management', layout: 'default', auth: false },
// ROUTE:job-test:dashboard:/job-test/dashboard:default:false
  { tatName: 'job-test', screenName: 'dashboard', routePath: '/job-test/dashboard', layout: 'default', auth: false },
// ROUTE:mail-test:login:/mail-test/login:guest:false
  { tatName: 'mail-test', screenName: 'login', routePath: '/mail-test/login', layout: 'guest', auth: false },
// ROUTE:mail-test:register:/mail-test/register:guest:false
  { tatName: 'mail-test', screenName: 'register', routePath: '/mail-test/register', layout: 'guest', auth: false },
// ROUTE:mail-test:dashboard:/mail-test/dashboard:auth:true
  { tatName: 'mail-test', screenName: 'dashboard', routePath: '/mail-test/dashboard', layout: 'auth', auth: true },
// ROUTE:middleware-test:index:/middleware-test:default:false
  { tatName: 'middleware-test', screenName: 'index', routePath: '/middleware-test', layout: 'default', auth: false },
// ROUTE:notification-test:login:/notification-test/login:guest:false
  { tatName: 'notification-test', screenName: 'login', routePath: '/notification-test/login', layout: 'guest', auth: false },
// ROUTE:notification-test:register:/notification-test/register:guest:false
  { tatName: 'notification-test', screenName: 'register', routePath: '/notification-test/register', layout: 'guest', auth: false },
// ROUTE:notification-test:dashboard:/notification-test/dashboard:auth:true
  { tatName: 'notification-test', screenName: 'dashboard', routePath: '/notification-test/dashboard', layout: 'auth', auth: true },
// ROUTE:roles-test:login:/roles-test/login:guest:false
  { tatName: 'roles-test', screenName: 'login', routePath: '/roles-test/login', layout: 'guest', auth: false },
// ROUTE:roles-test:register:/roles-test/register:guest:false
  { tatName: 'roles-test', screenName: 'register', routePath: '/roles-test/register', layout: 'guest', auth: false },
// ROUTE:roles-test:dashboard:/roles-test/dashboard:auth:true
  { tatName: 'roles-test', screenName: 'dashboard', routePath: '/roles-test/dashboard', layout: 'auth', auth: true },
// ROUTE:scheduler-test:dashboard:/scheduler-test/dashboard:default:false
  { tatName: 'scheduler-test', screenName: 'dashboard', routePath: '/scheduler-test/dashboard', layout: 'default', auth: false },
// ROUTE:upload-test:dashboard:/upload-test/dashboard:default:false
  { tatName: 'upload-test', screenName: 'dashboard', routePath: '/upload-test/dashboard', layout: 'default', auth: false },
// ROUTE:body-endpoint-handler:index:/body-endpoint-handler:guest:false
  { tatName: 'body-endpoint-handler', screenName: 'index', routePath: '/body-endpoint-handler', layout: 'guest', auth: false },
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
