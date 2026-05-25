// ============================================================
// ARKZEN GENERATED — Expo Route Registry v1.0
// Auto-updated when tatemonos are built / removed
// DO NOT EDIT — managed by Arkzen engine
//
// Consumed by:
//   src/layouts/AuthLayout.tsx   — to know login route per tatemono
//   src/layouts/GuestLayout.tsx  — to know dashboard route per tatemono
// ============================================================

export interface ArkzenExpoRoute {
  tatName:    string
  screenName: string
  /** Expo Router path e.g. '/barbershop-booking/index' */
  routePath:  string
  /** 'guest' | 'auth' | 'blank' | custom */
  layout:     string
  auth:       boolean
}

export const ARKZEN_EXPO_ROUTES: ArkzenExpoRoute[] = [
// ROUTE:animation-lab:index:/animation-lab/index:guest:false
  { tatName: 'animation-lab', screenName: 'index', routePath: '/animation-lab/index', layout: 'guest', auth: false },
// ROUTE:asset-hub:index:/asset-hub/index:guest:false
  { tatName: 'asset-hub', screenName: 'index', routePath: '/asset-hub/index', layout: 'guest', auth: false },
// ROUTE:auth-test:login:/auth-test/login:guest:false
  { tatName: 'auth-test', screenName: 'login', routePath: '/auth-test/login', layout: 'guest', auth: false },
// ROUTE:auth-test:register:/auth-test/register:guest:false
  { tatName: 'auth-test', screenName: 'register', routePath: '/auth-test/register', layout: 'guest', auth: false },
// ROUTE:auth-test:dashboard:/auth-test/dashboard:auth:true
  { tatName: 'auth-test', screenName: 'dashboard', routePath: '/auth-test/dashboard', layout: 'auth', auth: true },
// ROUTE:body-endpoint-handler:index:/body-endpoint-handler/index:guest:false
  { tatName: 'body-endpoint-handler', screenName: 'index', routePath: '/body-endpoint-handler/index', layout: 'guest', auth: false },
// ROUTE:body-mail-notification:login:/body-mail-notification/login:guest:false
  { tatName: 'body-mail-notification', screenName: 'login', routePath: '/body-mail-notification/login', layout: 'guest', auth: false },
// ROUTE:body-mail-notification:register:/body-mail-notification/register:guest:false
  { tatName: 'body-mail-notification', screenName: 'register', routePath: '/body-mail-notification/register', layout: 'guest', auth: false },
// ROUTE:body-mail-notification:dashboard:/body-mail-notification/dashboard:auth:true
  { tatName: 'body-mail-notification', screenName: 'dashboard', routePath: '/body-mail-notification/dashboard', layout: 'auth', auth: true },
// ROUTE:broadcast-test:login:/broadcast-test/login:guest:false
  { tatName: 'broadcast-test', screenName: 'login', routePath: '/broadcast-test/login', layout: 'guest', auth: false },
// ROUTE:broadcast-test:register:/broadcast-test/register:guest:false
  { tatName: 'broadcast-test', screenName: 'register', routePath: '/broadcast-test/register', layout: 'guest', auth: false },
// ROUTE:broadcast-test:dashboard:/broadcast-test/dashboard:auth:true
  { tatName: 'broadcast-test', screenName: 'dashboard', routePath: '/broadcast-test/dashboard', layout: 'auth', auth: true },
// ROUTE:certflow:login:/certflow/login:guest:false
  { tatName: 'certflow', screenName: 'login', routePath: '/certflow/login', layout: 'guest', auth: false },
// ROUTE:certflow:dashboard:/certflow/dashboard:auth:true
  { tatName: 'certflow', screenName: 'dashboard', routePath: '/certflow/dashboard', layout: 'auth', auth: true },
// ROUTE:certflow:fill:/certflow/fill:app:false
  { tatName: 'certflow', screenName: 'fill', routePath: '/certflow/fill', layout: 'app', auth: false },
// ROUTE:certflow:verify:/certflow/verify:app:false
  { tatName: 'certflow', screenName: 'verify', routePath: '/certflow/verify', layout: 'app', auth: false },
// ROUTE:church-community:index:/church-community/index:guest:false
  { tatName: 'church-community', screenName: 'index', routePath: '/church-community/index', layout: 'guest', auth: false },
// ROUTE:church-community:members:/church-community/members:guest:false
  { tatName: 'church-community', screenName: 'members', routePath: '/church-community/members', layout: 'guest', auth: false },
// ROUTE:church-community:inventory:/church-community/inventory:guest:false
  { tatName: 'church-community', screenName: 'inventory', routePath: '/church-community/inventory', layout: 'guest', auth: false },
// ROUTE:church-community:admin:/church-community/admin:guest:false
  { tatName: 'church-community', screenName: 'admin', routePath: '/church-community/admin', layout: 'guest', auth: false },
// ROUTE:church-community:login:/church-community/login:guest:false
  { tatName: 'church-community', screenName: 'login', routePath: '/church-community/login', layout: 'guest', auth: false },
// ROUTE:church-community:register:/church-community/register:guest:false
  { tatName: 'church-community', screenName: 'register', routePath: '/church-community/register', layout: 'guest', auth: false },
// ROUTE:crud-test:index:/crud-test/index:guest:false
  { tatName: 'crud-test', screenName: 'index', routePath: '/crud-test/index', layout: 'guest', auth: false },
// ROUTE:dtr-geofencing:index:/dtr-geofencing/index:app:false
  { tatName: 'dtr-geofencing', screenName: 'index', routePath: '/dtr-geofencing/index', layout: 'app', auth: false },
// ROUTE:dtr-geofencing:admin:/dtr-geofencing/admin:app:false
  { tatName: 'dtr-geofencing', screenName: 'admin', routePath: '/dtr-geofencing/admin', layout: 'app', auth: false },
// ROUTE:errors-test:index:/errors-test/index:guest:false
  { tatName: 'errors-test', screenName: 'index', routePath: '/errors-test/index', layout: 'guest', auth: false },
// ROUTE:events-test:index:/events-test/index:guest:false
  { tatName: 'events-test', screenName: 'index', routePath: '/events-test/index', layout: 'guest', auth: false },
// ROUTE:inventory-management:index:/inventory-management/index:guest:false
  { tatName: 'inventory-management', screenName: 'index', routePath: '/inventory-management/index', layout: 'guest', auth: false },
// ROUTE:jo-payroll:index:/jo-payroll/index:app:false
  { tatName: 'jo-payroll', screenName: 'index', routePath: '/jo-payroll/index', layout: 'app', auth: false },
// ROUTE:jo-payroll:job-database:/jo-payroll/job-database:app:false
  { tatName: 'jo-payroll', screenName: 'job-database', routePath: '/jo-payroll/job-database', layout: 'app', auth: false },
// ROUTE:jo-payroll:cash-atm:/jo-payroll/cash-atm:app:false
  { tatName: 'jo-payroll', screenName: 'cash-atm', routePath: '/jo-payroll/cash-atm', layout: 'app', auth: false },
// ROUTE:jo-payroll:sss:/jo-payroll/sss:app:false
  { tatName: 'jo-payroll', screenName: 'sss', routePath: '/jo-payroll/sss', layout: 'app', auth: false },
// ROUTE:jo-payroll:hdmf:/jo-payroll/hdmf:app:false
  { tatName: 'jo-payroll', screenName: 'hdmf', routePath: '/jo-payroll/hdmf', layout: 'app', auth: false },
// ROUTE:jo-payroll:appointments:/jo-payroll/appointments:app:false
  { tatName: 'jo-payroll', screenName: 'appointments', routePath: '/jo-payroll/appointments', layout: 'app', auth: false },
// ROUTE:jo-payroll:payslip:/jo-payroll/payslip:app:false
  { tatName: 'jo-payroll', screenName: 'payslip', routePath: '/jo-payroll/payslip', layout: 'app', auth: false },
// ROUTE:job-test:dashboard:/job-test/dashboard:guest:false
  { tatName: 'job-test', screenName: 'dashboard', routePath: '/job-test/dashboard', layout: 'guest', auth: false },
// ROUTE:mail-test:login:/mail-test/login:guest:false
  { tatName: 'mail-test', screenName: 'login', routePath: '/mail-test/login', layout: 'guest', auth: false },
// ROUTE:mail-test:register:/mail-test/register:guest:false
  { tatName: 'mail-test', screenName: 'register', routePath: '/mail-test/register', layout: 'guest', auth: false },
// ROUTE:mail-test:dashboard:/mail-test/dashboard:auth:true
  { tatName: 'mail-test', screenName: 'dashboard', routePath: '/mail-test/dashboard', layout: 'auth', auth: true },
// ROUTE:middleware-test:index:/middleware-test/index:guest:false
  { tatName: 'middleware-test', screenName: 'index', routePath: '/middleware-test/index', layout: 'guest', auth: false },
// ROUTE:mij-tribute:index:/mij-tribute/index:guest:false
  { tatName: 'mij-tribute', screenName: 'index', routePath: '/mij-tribute/index', layout: 'guest', auth: false },
// ROUTE:new-updates-styles:index:/new-updates-styles/index:guest:false
  { tatName: 'new-updates-styles', screenName: 'index', routePath: '/new-updates-styles/index', layout: 'guest', auth: false },
// ROUTE:new-updates-styles:about:/new-updates-styles/about:guest:false
  { tatName: 'new-updates-styles', screenName: 'about', routePath: '/new-updates-styles/about', layout: 'guest', auth: false },
// ROUTE:new-updates-styles:features:/new-updates-styles/features:guest:false
  { tatName: 'new-updates-styles', screenName: 'features', routePath: '/new-updates-styles/features', layout: 'guest', auth: false },
// ROUTE:notification-test:login:/notification-test/login:guest:false
  { tatName: 'notification-test', screenName: 'login', routePath: '/notification-test/login', layout: 'guest', auth: false },
// ROUTE:notification-test:register:/notification-test/register:guest:false
  { tatName: 'notification-test', screenName: 'register', routePath: '/notification-test/register', layout: 'guest', auth: false },
// ROUTE:notification-test:dashboard:/notification-test/dashboard:auth:true
  { tatName: 'notification-test', screenName: 'dashboard', routePath: '/notification-test/dashboard', layout: 'auth', auth: true },
// ROUTE:portfolio-test:index:/portfolio-test/index:guest:false
  { tatName: 'portfolio-test', screenName: 'index', routePath: '/portfolio-test/index', layout: 'guest', auth: false },
// ROUTE:queue-flow:index:/queue-flow/index:app:false
  { tatName: 'queue-flow', screenName: 'index', routePath: '/queue-flow/index', layout: 'app', auth: false },
// ROUTE:queue-flow:join:/queue-flow/join:app:false
  { tatName: 'queue-flow', screenName: 'join', routePath: '/queue-flow/join', layout: 'app', auth: false },
// ROUTE:queue-flow:admin:/queue-flow/admin:app:false
  { tatName: 'queue-flow', screenName: 'admin', routePath: '/queue-flow/admin', layout: 'app', auth: false },
// ROUTE:roles-test:login:/roles-test/login:guest:false
  { tatName: 'roles-test', screenName: 'login', routePath: '/roles-test/login', layout: 'guest', auth: false },
// ROUTE:roles-test:register:/roles-test/register:guest:false
  { tatName: 'roles-test', screenName: 'register', routePath: '/roles-test/register', layout: 'guest', auth: false },
// ROUTE:roles-test:dashboard:/roles-test/dashboard:auth:true
  { tatName: 'roles-test', screenName: 'dashboard', routePath: '/roles-test/dashboard', layout: 'auth', auth: true },
// ROUTE:scheduler-test:dashboard:/scheduler-test/dashboard:guest:false
  { tatName: 'scheduler-test', screenName: 'dashboard', routePath: '/scheduler-test/dashboard', layout: 'guest', auth: false },
// ROUTE:shan-portfolio:index:/shan-portfolio/index:guest:false
  { tatName: 'shan-portfolio', screenName: 'index', routePath: '/shan-portfolio/index', layout: 'guest', auth: false },
// ROUTE:upload-test:dashboard:/upload-test/dashboard:guest:false
  { tatName: 'upload-test', screenName: 'dashboard', routePath: '/upload-test/dashboard', layout: 'guest', auth: false },
// ROUTE:visual-lab:index:/visual-lab/index:guest:false
  { tatName: 'visual-lab', screenName: 'index', routePath: '/visual-lab/index', layout: 'guest', auth: false },
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
