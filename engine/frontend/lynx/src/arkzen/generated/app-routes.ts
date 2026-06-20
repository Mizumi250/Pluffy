// ============================================================
// ARKZEN GENERATED — Lynx App Routes (src/arkzen/generated/app-routes.ts)
// DO NOT EDIT DIRECTLY. Managed by arkzen lynx-router.
// Generated: 2026-06-20T13:59:08.474Z
//
// Pure data — component imports + the route table. Mirrors React+Vite's
// src/arkzen/generated/routes.ts. src/App.tsx is static and imports from
// this file; the generator never touches App.tsx.
// ============================================================

import { AssetHubIndex } from '../../pages/asset-hub/index'
import { AuthTestLogin } from '../../pages/auth-test/login'
import { AuthTestRegister } from '../../pages/auth-test/register'
import { AuthTestDashboard } from '../../pages/auth-test/dashboard'
import { BodyEndpointHandlerIndex } from '../../pages/body-endpoint-handler/index'
import { BodyMailNotificationLogin } from '../../pages/body-mail-notification/login'
import { BodyMailNotificationRegister } from '../../pages/body-mail-notification/register'
import { BodyMailNotificationDashboard } from '../../pages/body-mail-notification/dashboard'
import { BroadcastTestLogin } from '../../pages/broadcast-test/login'
import { BroadcastTestRegister } from '../../pages/broadcast-test/register'
import { BroadcastTestDashboard } from '../../pages/broadcast-test/dashboard'
import { CrudTestIndex } from '../../pages/crud-test/index'
import { ErrorsTestIndex } from '../../pages/errors-test/index'
import { EventsTestIndex } from '../../pages/events-test/index'
import { HelloNativeIndex } from '../../pages/hello-native/index'
import { HelloNativeAbout } from '../../pages/hello-native/about'
import { InventoryManagementIndex } from '../../pages/inventory-management/index'
import { JoPayrollIndex } from '../../pages/jo-payroll/index'
import { JoPayrollJobDatabase } from '../../pages/jo-payroll/job-database'
import { JoPayrollCashAtm } from '../../pages/jo-payroll/cash-atm'
import { JoPayrollAppointments } from '../../pages/jo-payroll/appointments'
import { JoPayrollPayslip } from '../../pages/jo-payroll/payslip'
import { JobTestDashboard } from '../../pages/job-test/dashboard'
import { LayoutTestIndex } from '../../pages/layout-test/index'
import { LayoutTestSingle } from '../../pages/layout-test/single'
import { LayoutTestChain } from '../../pages/layout-test/chain'
import { LayoutTestNativeDeep } from '../../pages/layout-test/native-deep'
import { LayoutTestNativeAuth } from '../../pages/layout-test/native-auth'
import { LayoutTestNativeChainAuth } from '../../pages/layout-test/native-chain-auth'
import { LayoutTestNativeGuest } from '../../pages/layout-test/native-guest'
import { MailTestLogin } from '../../pages/mail-test/login'
import { MailTestRegister } from '../../pages/mail-test/register'
import { MailTestDashboard } from '../../pages/mail-test/dashboard'
import { MiddlewareTestIndex } from '../../pages/middleware-test/index'
import { NewUpdatesStylesIndex } from '../../pages/new-updates-styles/index'
import { NewUpdatesStylesAbout } from '../../pages/new-updates-styles/about'
import { NewUpdatesStylesFeatures } from '../../pages/new-updates-styles/features'
import { NotificationTestLogin } from '../../pages/notification-test/login'
import { NotificationTestRegister } from '../../pages/notification-test/register'
import { NotificationTestDashboard } from '../../pages/notification-test/dashboard'
import { PortfolioTestIndex } from '../../pages/portfolio-test/index'
import { RolesTestLogin } from '../../pages/roles-test/login'
import { RolesTestRegister } from '../../pages/roles-test/register'
import { RolesTestDashboard } from '../../pages/roles-test/dashboard'
import { SchedulerTestDashboard } from '../../pages/scheduler-test/dashboard'
import { UploadTestDashboard } from '../../pages/upload-test/dashboard'
import { default as ErrorsTestError404 } from '../../pages/errors-test/error-404'
import { default as ErrorsTestError500 } from '../../pages/errors-test/error-500'
import { default as LayoutTestError404 } from '../../pages/layout-test/error-404'

export interface LynxAppRoute {
  module:         string
  page:           string
  component:      any
  layout:         any
  loginRoute:     string
  dashboardRoute: string
}

export const LYNX_ROUTES: LynxAppRoute[] = [
  { module: 'asset-hub', page: 'index', component: AssetHubIndex, layout: null, loginRoute: '/asset-hub/index', dashboardRoute: '/asset-hub/index' },
  { module: 'auth-test', page: 'login', component: AuthTestLogin, layout: null, loginRoute: '/auth-test/login', dashboardRoute: '/auth-test/dashboard' },
  { module: 'auth-test', page: 'register', component: AuthTestRegister, layout: null, loginRoute: '/auth-test/login', dashboardRoute: '/auth-test/dashboard' },
  { module: 'auth-test', page: 'dashboard', component: AuthTestDashboard, layout: null, loginRoute: '/auth-test/login', dashboardRoute: '/auth-test/dashboard' },
  { module: 'auth-test', page: 'index', component: AuthTestLogin, layout: null, loginRoute: '/auth-test/login', dashboardRoute: '/auth-test/dashboard' },
  { module: 'body-endpoint-handler', page: 'index', component: BodyEndpointHandlerIndex, layout: null, loginRoute: '/body-endpoint-handler/index', dashboardRoute: '/body-endpoint-handler/index' },
  { module: 'body-mail-notification', page: 'login', component: BodyMailNotificationLogin, layout: null, loginRoute: '/body-mail-notification/login', dashboardRoute: '/body-mail-notification/dashboard' },
  { module: 'body-mail-notification', page: 'register', component: BodyMailNotificationRegister, layout: null, loginRoute: '/body-mail-notification/login', dashboardRoute: '/body-mail-notification/dashboard' },
  { module: 'body-mail-notification', page: 'dashboard', component: BodyMailNotificationDashboard, layout: null, loginRoute: '/body-mail-notification/login', dashboardRoute: '/body-mail-notification/dashboard' },
  { module: 'body-mail-notification', page: 'index', component: BodyMailNotificationLogin, layout: null, loginRoute: '/body-mail-notification/login', dashboardRoute: '/body-mail-notification/dashboard' },
  { module: 'broadcast-test', page: 'login', component: BroadcastTestLogin, layout: null, loginRoute: '/broadcast-test/login', dashboardRoute: '/broadcast-test/dashboard' },
  { module: 'broadcast-test', page: 'register', component: BroadcastTestRegister, layout: null, loginRoute: '/broadcast-test/login', dashboardRoute: '/broadcast-test/dashboard' },
  { module: 'broadcast-test', page: 'dashboard', component: BroadcastTestDashboard, layout: null, loginRoute: '/broadcast-test/login', dashboardRoute: '/broadcast-test/dashboard' },
  { module: 'broadcast-test', page: 'index', component: BroadcastTestLogin, layout: null, loginRoute: '/broadcast-test/login', dashboardRoute: '/broadcast-test/dashboard' },
  { module: 'crud-test', page: 'index', component: CrudTestIndex, layout: null, loginRoute: '/crud-test/index', dashboardRoute: '/crud-test/index' },
  { module: 'errors-test', page: 'index', component: ErrorsTestIndex, layout: null, loginRoute: '/errors-test/index', dashboardRoute: '/errors-test/index' },
  { module: 'events-test', page: 'index', component: EventsTestIndex, layout: null, loginRoute: '/events-test/index', dashboardRoute: '/events-test/index' },
  { module: 'hello-native', page: 'index', component: HelloNativeIndex, layout: null, loginRoute: '/hello-native/index', dashboardRoute: '/hello-native/index' },
  { module: 'hello-native', page: 'about', component: HelloNativeAbout, layout: null, loginRoute: '/hello-native/index', dashboardRoute: '/hello-native/index' },
  { module: 'inventory-management', page: 'index', component: InventoryManagementIndex, layout: null, loginRoute: '/inventory-management/index', dashboardRoute: '/inventory-management/index' },
  { module: 'jo-payroll', page: 'index', component: JoPayrollIndex, layout: null, loginRoute: '/jo-payroll/index', dashboardRoute: '/jo-payroll/index' },
  { module: 'jo-payroll', page: 'job-database', component: JoPayrollJobDatabase, layout: null, loginRoute: '/jo-payroll/index', dashboardRoute: '/jo-payroll/index' },
  { module: 'jo-payroll', page: 'cash-atm', component: JoPayrollCashAtm, layout: null, loginRoute: '/jo-payroll/index', dashboardRoute: '/jo-payroll/index' },
  { module: 'jo-payroll', page: 'appointments', component: JoPayrollAppointments, layout: null, loginRoute: '/jo-payroll/index', dashboardRoute: '/jo-payroll/index' },
  { module: 'jo-payroll', page: 'payslip', component: JoPayrollPayslip, layout: null, loginRoute: '/jo-payroll/index', dashboardRoute: '/jo-payroll/index' },
  { module: 'job-test', page: 'dashboard', component: JobTestDashboard, layout: null, loginRoute: '/job-test/index', dashboardRoute: '/job-test/dashboard' },
  { module: 'job-test', page: 'index', component: JobTestDashboard, layout: null, loginRoute: '/job-test/index', dashboardRoute: '/job-test/dashboard' },
  { module: 'layout-test', page: 'index', component: LayoutTestIndex, layout: null, loginRoute: '/layout-test/index', dashboardRoute: '/layout-test/index' },
  { module: 'layout-test', page: 'single', component: LayoutTestSingle, layout: null, loginRoute: '/layout-test/index', dashboardRoute: '/layout-test/index' },
  { module: 'layout-test', page: 'chain', component: LayoutTestChain, layout: null, loginRoute: '/layout-test/index', dashboardRoute: '/layout-test/index' },
  { module: 'layout-test', page: 'native-deep', component: LayoutTestNativeDeep, layout: null, loginRoute: '/layout-test/index', dashboardRoute: '/layout-test/index' },
  { module: 'layout-test', page: 'native-auth', component: LayoutTestNativeAuth, layout: null, loginRoute: '/layout-test/index', dashboardRoute: '/layout-test/index' },
  { module: 'layout-test', page: 'native-chain-auth', component: LayoutTestNativeChainAuth, layout: null, loginRoute: '/layout-test/index', dashboardRoute: '/layout-test/index' },
  { module: 'layout-test', page: 'native-guest', component: LayoutTestNativeGuest, layout: null, loginRoute: '/layout-test/index', dashboardRoute: '/layout-test/index' },
  { module: 'mail-test', page: 'login', component: MailTestLogin, layout: null, loginRoute: '/mail-test/login', dashboardRoute: '/mail-test/dashboard' },
  { module: 'mail-test', page: 'register', component: MailTestRegister, layout: null, loginRoute: '/mail-test/login', dashboardRoute: '/mail-test/dashboard' },
  { module: 'mail-test', page: 'dashboard', component: MailTestDashboard, layout: null, loginRoute: '/mail-test/login', dashboardRoute: '/mail-test/dashboard' },
  { module: 'mail-test', page: 'index', component: MailTestLogin, layout: null, loginRoute: '/mail-test/login', dashboardRoute: '/mail-test/dashboard' },
  { module: 'middleware-test', page: 'index', component: MiddlewareTestIndex, layout: null, loginRoute: '/middleware-test/index', dashboardRoute: '/middleware-test/index' },
  { module: 'new-updates-styles', page: 'index', component: NewUpdatesStylesIndex, layout: null, loginRoute: '/new-updates-styles/index', dashboardRoute: '/new-updates-styles/index' },
  { module: 'new-updates-styles', page: 'about', component: NewUpdatesStylesAbout, layout: null, loginRoute: '/new-updates-styles/index', dashboardRoute: '/new-updates-styles/index' },
  { module: 'new-updates-styles', page: 'features', component: NewUpdatesStylesFeatures, layout: null, loginRoute: '/new-updates-styles/index', dashboardRoute: '/new-updates-styles/index' },
  { module: 'notification-test', page: 'login', component: NotificationTestLogin, layout: null, loginRoute: '/notification-test/login', dashboardRoute: '/notification-test/dashboard' },
  { module: 'notification-test', page: 'register', component: NotificationTestRegister, layout: null, loginRoute: '/notification-test/login', dashboardRoute: '/notification-test/dashboard' },
  { module: 'notification-test', page: 'dashboard', component: NotificationTestDashboard, layout: null, loginRoute: '/notification-test/login', dashboardRoute: '/notification-test/dashboard' },
  { module: 'notification-test', page: 'index', component: NotificationTestLogin, layout: null, loginRoute: '/notification-test/login', dashboardRoute: '/notification-test/dashboard' },
  { module: 'portfolio-test', page: 'index', component: PortfolioTestIndex, layout: null, loginRoute: '/portfolio-test/index', dashboardRoute: '/portfolio-test/index' },
  { module: 'roles-test', page: 'login', component: RolesTestLogin, layout: null, loginRoute: '/roles-test/login', dashboardRoute: '/roles-test/dashboard' },
  { module: 'roles-test', page: 'register', component: RolesTestRegister, layout: null, loginRoute: '/roles-test/login', dashboardRoute: '/roles-test/dashboard' },
  { module: 'roles-test', page: 'dashboard', component: RolesTestDashboard, layout: null, loginRoute: '/roles-test/login', dashboardRoute: '/roles-test/dashboard' },
  { module: 'roles-test', page: 'index', component: RolesTestLogin, layout: null, loginRoute: '/roles-test/login', dashboardRoute: '/roles-test/dashboard' },
  { module: 'scheduler-test', page: 'dashboard', component: SchedulerTestDashboard, layout: null, loginRoute: '/scheduler-test/index', dashboardRoute: '/scheduler-test/dashboard' },
  { module: 'scheduler-test', page: 'index', component: SchedulerTestDashboard, layout: null, loginRoute: '/scheduler-test/index', dashboardRoute: '/scheduler-test/dashboard' },
  { module: 'upload-test', page: 'dashboard', component: UploadTestDashboard, layout: null, loginRoute: '/upload-test/index', dashboardRoute: '/upload-test/dashboard' },
  { module: 'upload-test', page: 'index', component: UploadTestDashboard, layout: null, loginRoute: '/upload-test/index', dashboardRoute: '/upload-test/dashboard' },
]

export const LYNX_ERROR_404: Record<string, any> = {
  'errors-test': ErrorsTestError404,
  'layout-test': LayoutTestError404,
}

export const LYNX_ERROR_500: Record<string, any> = {
  'errors-test': ErrorsTestError500,
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

// ── Programmatic route helpers — mirrors Expo's routes.ts ──────────────────
// (LYNX_ROUTES entries already carry loginRoute/dashboardRoute baked in, but
// these are exposed for any other engine code — authStore, etc. — that wants
// to compute them without first locating the right route entry.)
export function getLoginRoute(tatName: string): string {
  const route = LYNX_ROUTES.find(r => r.module === tatName)
  return route?.loginRoute ?? `/${tatName}`
}

export function getDashboardRoute(tatName: string): string {
  const route = LYNX_ROUTES.find(r => r.module === tatName)
  return route?.dashboardRoute ?? `/${tatName}`
}

// v3.1: programmatic equivalent of visiting bare /${tatName} in Expo —
// resolves to the literal "index" page if one exists, otherwise the first
// registered page (which regenerateRoutesFile() above already aliased
// under page: 'index' for exactly this case).
export function getDefaultPage(tatName: string): string {
  const route = LYNX_ROUTES.find(r => r.module === tatName && r.page === 'index')
  return route?.page ?? LYNX_ROUTES.find(r => r.module === tatName)?.page ?? 'index'
}
