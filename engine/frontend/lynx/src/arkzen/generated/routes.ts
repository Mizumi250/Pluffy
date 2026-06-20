// ============================================================
// ARKZEN GENERATED — LYNX ROUTE REGISTRY
// DO NOT EDIT DIRECTLY. Managed by arkzen lynx-router.
// Derived from routes.meta.json — the source of truth.
// ============================================================

export interface LynxRouteEntry {
  page:   string
  layout: string
}

export const lynxRoutes: Record<string, LynxRouteEntry[]> = {
  'asset-hub': [
    { page: 'index', layout: 'default' },
  ],
  'auth-test': [
    { page: 'login', layout: 'default' },
    { page: 'register', layout: 'default' },
    { page: 'dashboard', layout: 'default' },
  ],
  'body-endpoint-handler': [
    { page: 'index', layout: 'default' },
  ],
  'body-mail-notification': [
    { page: 'login', layout: 'default' },
    { page: 'register', layout: 'default' },
    { page: 'dashboard', layout: 'default' },
  ],
  'broadcast-test': [
    { page: 'login', layout: 'default' },
    { page: 'register', layout: 'default' },
    { page: 'dashboard', layout: 'default' },
  ],
  'crud-test': [
    { page: 'index', layout: 'default' },
  ],
  'errors-test': [
    { page: 'index', layout: 'default' },
  ],
  'events-test': [
    { page: 'index', layout: 'default' },
  ],
  'hello-native': [
    { page: 'index', layout: 'default' },
    { page: 'about', layout: 'default' },
  ],
  'inventory-management': [
    { page: 'index', layout: 'default' },
  ],
  'jo-payroll': [
    { page: 'index', layout: 'default' },
    { page: 'job-database', layout: 'default' },
    { page: 'cash-atm', layout: 'default' },
    { page: 'appointments', layout: 'default' },
    { page: 'payslip', layout: 'default' },
  ],
  'job-test': [
    { page: 'dashboard', layout: 'default' },
  ],
  'layout-test': [
    { page: 'index', layout: 'default' },
    { page: 'single', layout: 'default' },
    { page: 'chain', layout: 'default' },
    { page: 'native-deep', layout: 'default' },
    { page: 'native-auth', layout: 'default' },
    { page: 'native-chain-auth', layout: 'default' },
    { page: 'native-guest', layout: 'default' },
  ],
  'mail-test': [
    { page: 'login', layout: 'default' },
    { page: 'register', layout: 'default' },
    { page: 'dashboard', layout: 'default' },
  ],
  'middleware-test': [
    { page: 'index', layout: 'default' },
  ],
  'new-updates-styles': [
    { page: 'index', layout: 'default' },
    { page: 'about', layout: 'default' },
    { page: 'features', layout: 'default' },
  ],
  'notification-test': [
    { page: 'login', layout: 'default' },
    { page: 'register', layout: 'default' },
    { page: 'dashboard', layout: 'default' },
  ],
  'portfolio-test': [
    { page: 'index', layout: 'default' },
  ],
  'roles-test': [
    { page: 'login', layout: 'default' },
    { page: 'register', layout: 'default' },
    { page: 'dashboard', layout: 'default' },
  ],
  'scheduler-test': [
    { page: 'dashboard', layout: 'default' },
  ],
  'upload-test': [
    { page: 'dashboard', layout: 'default' },
  ],
}

export const lynxErrorFlags: Record<string, { has404: boolean; has500: boolean }> = {
  'asset-hub': { has404: false, has500: false },
  'auth-test': { has404: false, has500: false },
  'body-endpoint-handler': { has404: false, has500: false },
  'body-mail-notification': { has404: false, has500: false },
  'broadcast-test': { has404: false, has500: false },
  'crud-test': { has404: false, has500: false },
  'errors-test': { has404: true, has500: true },
  'events-test': { has404: false, has500: false },
  'hello-native': { has404: false, has500: false },
  'inventory-management': { has404: false, has500: false },
  'jo-payroll': { has404: false, has500: false },
  'job-test': { has404: false, has500: false },
  'layout-test': { has404: true, has500: false },
  'mail-test': { has404: false, has500: false },
  'middleware-test': { has404: false, has500: false },
  'new-updates-styles': { has404: false, has500: false },
  'notification-test': { has404: false, has500: false },
  'portfolio-test': { has404: false, has500: false },
  'roles-test': { has404: false, has500: false },
  'scheduler-test': { has404: false, has500: false },
  'upload-test': { has404: false, has500: false },
}

export type LynxRouteName = keyof typeof lynxRoutes
