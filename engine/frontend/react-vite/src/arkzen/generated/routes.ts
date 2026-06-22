// ============================================================
// ARKZEN GENERATED — Route Registry (React+Vite)
// Auto-updated when tatemonos are built/removed
// DO NOT EDIT — managed by Arkzen engine
// ============================================================
import React from 'react'
import { lazy, ComponentType } from 'react'

export interface ArkzenRoute {
  path:      string
  name:      string
  tatemono:  string
  component: ComponentType
  auth:      boolean
}

// ROUTE:asset-hub:index:/asset-hub:false
const ArkzenPage_AssetHub_Index = lazy(() => import('@/pages/asset-hub/index'))
// ROUTE:atelier:index:/atelier:false
const ArkzenPage_Atelier_Index = lazy(() => import('@/pages/atelier/index'))
// ROUTE:auth-test:login:/auth-test/login:true
const ArkzenPage_AuthTest_Login = lazy(() => import('@/pages/auth-test/login'))
// ROUTE:auth-test:register:/auth-test/register:true
const ArkzenPage_AuthTest_Register = lazy(() => import('@/pages/auth-test/register'))
// ROUTE:auth-test:dashboard:/auth-test/dashboard:true
const ArkzenPage_AuthTest_Dashboard = lazy(() => import('@/pages/auth-test/dashboard'))
// ROUTE:auth-test:__root_redirect:/auth-test:true
const ArkzenPage_AuthTest_RootRedirect = lazy(() => import('@/pages/auth-test/__root_redirect'))
// ROUTE:body-endpoint-handler:index:/body-endpoint-handler:false
const ArkzenPage_BodyEndpointHandler_Index = lazy(() => import('@/pages/body-endpoint-handler/index'))
// ROUTE:body-mail-notification:login:/body-mail-notification/login:true
const ArkzenPage_BodyMailNotification_Login = lazy(() => import('@/pages/body-mail-notification/login'))
// ROUTE:body-mail-notification:register:/body-mail-notification/register:true
const ArkzenPage_BodyMailNotification_Register = lazy(() => import('@/pages/body-mail-notification/register'))
// ROUTE:body-mail-notification:dashboard:/body-mail-notification/dashboard:true
const ArkzenPage_BodyMailNotification_Dashboard = lazy(() => import('@/pages/body-mail-notification/dashboard'))
// ROUTE:body-mail-notification:__root_redirect:/body-mail-notification:true
const ArkzenPage_BodyMailNotification_RootRedirect = lazy(() => import('@/pages/body-mail-notification/__root_redirect'))
// ROUTE:broadcast-test:login:/broadcast-test/login:true
const ArkzenPage_BroadcastTest_Login = lazy(() => import('@/pages/broadcast-test/login'))
// ROUTE:broadcast-test:register:/broadcast-test/register:true
const ArkzenPage_BroadcastTest_Register = lazy(() => import('@/pages/broadcast-test/register'))
// ROUTE:broadcast-test:dashboard:/broadcast-test/dashboard:true
const ArkzenPage_BroadcastTest_Dashboard = lazy(() => import('@/pages/broadcast-test/dashboard'))
// ROUTE:broadcast-test:__root_redirect:/broadcast-test:true
const ArkzenPage_BroadcastTest_RootRedirect = lazy(() => import('@/pages/broadcast-test/__root_redirect'))
// ROUTE:cafe-teresita:index:/cafe-teresita:false
const ArkzenPage_CafeTeresita_Index = lazy(() => import('@/pages/cafe-teresita/index'))
// ROUTE:crud-test:index:/crud-test:false
const ArkzenPage_CrudTest_Index = lazy(() => import('@/pages/crud-test/index'))
// ROUTE:dtr-geofencing:index:/dtr-geofencing:false
const ArkzenPage_DtrGeofencing_Index = lazy(() => import('@/pages/dtr-geofencing/index'))
// ROUTE:dtr-geofencing:admin:/dtr-geofencing/admin:false
const ArkzenPage_DtrGeofencing_Admin = lazy(() => import('@/pages/dtr-geofencing/admin'))
// ROUTE:errors-test:index:/errors-test:false:ArkzenErrorBoundary_ErrorsTest
const ArkzenPage_ErrorsTest_Index = lazy(() => import('@/pages/errors-test/index'))
// ROUTE:errors-test:not-found:/errors-test/*:false
const ArkzenPage_ErrorsTest_NotFound = lazy(() => import('@/pages/errors-test/not-found'))
// ROUTE:ethan-pool:index:/ethan-pool:false
const ArkzenPage_EthanPool_Index = lazy(() => import('@/pages/ethan-pool/index'))
// ROUTE:events-test:index:/events-test:false
const ArkzenPage_EventsTest_Index = lazy(() => import('@/pages/events-test/index'))
// ROUTE:hw-coffee:index:/hw-coffee:false
const ArkzenPage_HwCoffee_Index = lazy(() => import('@/pages/hw-coffee/index'))
// ROUTE:inventory-management:index:/inventory-management:false
const ArkzenPage_InventoryManagement_Index = lazy(() => import('@/pages/inventory-management/index'))
// ROUTE:jo-payroll:index:/jo-payroll:false
const ArkzenPage_JoPayroll_Index = lazy(() => import('@/pages/jo-payroll/index'))
// ROUTE:jo-payroll:job-database:/jo-payroll/job-database:false
const ArkzenPage_JoPayroll_JobDatabase = lazy(() => import('@/pages/jo-payroll/job-database'))
// ROUTE:jo-payroll:cash-atm:/jo-payroll/cash-atm:false
const ArkzenPage_JoPayroll_CashAtm = lazy(() => import('@/pages/jo-payroll/cash-atm'))
// ROUTE:jo-payroll:sss:/jo-payroll/sss:false
const ArkzenPage_JoPayroll_Sss = lazy(() => import('@/pages/jo-payroll/sss'))
// ROUTE:jo-payroll:hdmf:/jo-payroll/hdmf:false
const ArkzenPage_JoPayroll_Hdmf = lazy(() => import('@/pages/jo-payroll/hdmf'))
// ROUTE:jo-payroll:appointments:/jo-payroll/appointments:false
const ArkzenPage_JoPayroll_Appointments = lazy(() => import('@/pages/jo-payroll/appointments'))
// ROUTE:jo-payroll:payslip:/jo-payroll/payslip:false
const ArkzenPage_JoPayroll_Payslip = lazy(() => import('@/pages/jo-payroll/payslip'))
// ROUTE:jo-payroll:not-found:/jo-payroll/*:false
const ArkzenPage_JoPayroll_NotFound = lazy(() => import('@/pages/jo-payroll/not-found'))
// ROUTE:job-test:dashboard:/job-test/dashboard:false
const ArkzenPage_JobTest_Dashboard = lazy(() => import('@/pages/job-test/dashboard'))
// ROUTE:job-test:__root_redirect:/job-test:false
const ArkzenPage_JobTest_RootRedirect = lazy(() => import('@/pages/job-test/__root_redirect'))
// ROUTE:layout-test:index:/layout-test:false
const ArkzenPage_LayoutTest_Index = lazy(() => import('@/pages/layout-test/index'))
// ROUTE:layout-test:panel:/layout-test/panel:false
const ArkzenPage_LayoutTest_Panel = lazy(() => import('@/pages/layout-test/panel'))
// ROUTE:layout-test:deep:/layout-test/deep:false
const ArkzenPage_LayoutTest_Deep = lazy(() => import('@/pages/layout-test/deep'))
// ROUTE:layout-test:guard-auth:/layout-test/guard-auth:false
const ArkzenPage_LayoutTest_GuardAuth = lazy(() => import('@/pages/layout-test/guard-auth'))
// ROUTE:layout-test:chain-auth:/layout-test/chain-auth:false
const ArkzenPage_LayoutTest_ChainAuth = lazy(() => import('@/pages/layout-test/chain-auth'))
// ROUTE:layout-test:guard-guest:/layout-test/guard-guest:false
const ArkzenPage_LayoutTest_GuardGuest = lazy(() => import('@/pages/layout-test/guard-guest'))
// ROUTE:layout-test:chain-guest:/layout-test/chain-guest:false
const ArkzenPage_LayoutTest_ChainGuest = lazy(() => import('@/pages/layout-test/chain-guest'))
// ROUTE:layout-test:not-found:/layout-test/*:false
const ArkzenPage_LayoutTest_NotFound = lazy(() => import('@/pages/layout-test/not-found'))
// ROUTE:mail-test:login:/mail-test/login:true
const ArkzenPage_MailTest_Login = lazy(() => import('@/pages/mail-test/login'))
// ROUTE:mail-test:register:/mail-test/register:true
const ArkzenPage_MailTest_Register = lazy(() => import('@/pages/mail-test/register'))
// ROUTE:mail-test:dashboard:/mail-test/dashboard:true
const ArkzenPage_MailTest_Dashboard = lazy(() => import('@/pages/mail-test/dashboard'))
// ROUTE:mail-test:__root_redirect:/mail-test:true
const ArkzenPage_MailTest_RootRedirect = lazy(() => import('@/pages/mail-test/__root_redirect'))
// ROUTE:middleware-test:index:/middleware-test:false
const ArkzenPage_MiddlewareTest_Index = lazy(() => import('@/pages/middleware-test/index'))
// ROUTE:new-updates-styles:index:/new-updates-styles:false
const ArkzenPage_NewUpdatesStyles_Index = lazy(() => import('@/pages/new-updates-styles/index'))
// ROUTE:new-updates-styles:about:/new-updates-styles/about:false
const ArkzenPage_NewUpdatesStyles_About = lazy(() => import('@/pages/new-updates-styles/about'))
// ROUTE:new-updates-styles:features:/new-updates-styles/features:false
const ArkzenPage_NewUpdatesStyles_Features = lazy(() => import('@/pages/new-updates-styles/features'))
// ROUTE:new-updates-styles:not-found:/new-updates-styles/*:false
const ArkzenPage_NewUpdatesStyles_NotFound = lazy(() => import('@/pages/new-updates-styles/not-found'))
// ROUTE:notification-test:login:/notification-test/login:true
const ArkzenPage_NotificationTest_Login = lazy(() => import('@/pages/notification-test/login'))
// ROUTE:notification-test:register:/notification-test/register:true
const ArkzenPage_NotificationTest_Register = lazy(() => import('@/pages/notification-test/register'))
// ROUTE:notification-test:dashboard:/notification-test/dashboard:true
const ArkzenPage_NotificationTest_Dashboard = lazy(() => import('@/pages/notification-test/dashboard'))
// ROUTE:notification-test:__root_redirect:/notification-test:true
const ArkzenPage_NotificationTest_RootRedirect = lazy(() => import('@/pages/notification-test/__root_redirect'))
// ROUTE:portfolio-test:index:/portfolio-test:false
const ArkzenPage_PortfolioTest_Index = lazy(() => import('@/pages/portfolio-test/index'))
// ROUTE:roles-test:login:/roles-test/login:true
const ArkzenPage_RolesTest_Login = lazy(() => import('@/pages/roles-test/login'))
// ROUTE:roles-test:register:/roles-test/register:true
const ArkzenPage_RolesTest_Register = lazy(() => import('@/pages/roles-test/register'))
// ROUTE:roles-test:dashboard:/roles-test/dashboard:true
const ArkzenPage_RolesTest_Dashboard = lazy(() => import('@/pages/roles-test/dashboard'))
// ROUTE:roles-test:__root_redirect:/roles-test:true
const ArkzenPage_RolesTest_RootRedirect = lazy(() => import('@/pages/roles-test/__root_redirect'))
// ROUTE:scheduler-test:dashboard:/scheduler-test/dashboard:false
const ArkzenPage_SchedulerTest_Dashboard = lazy(() => import('@/pages/scheduler-test/dashboard'))
// ROUTE:scheduler-test:__root_redirect:/scheduler-test:false
const ArkzenPage_SchedulerTest_RootRedirect = lazy(() => import('@/pages/scheduler-test/__root_redirect'))
// ROUTE:upload-test:dashboard:/upload-test/dashboard:false
const ArkzenPage_UploadTest_Dashboard = lazy(() => import('@/pages/upload-test/dashboard'))
// ROUTE:upload-test:__root_redirect:/upload-test:false
const ArkzenPage_UploadTest_RootRedirect = lazy(() => import('@/pages/upload-test/__root_redirect'))
// ROUTE:visual-lab:index:/visual-lab:false
const ArkzenPage_VisualLab_Index = lazy(() => import('@/pages/visual-lab/index'))
// ROUTE:ethereane:index:/ethereane:false
const ArkzenPage_Ethereane_Index = lazy(() => import('@/pages/ethereane/index'))

import { ArkzenErrorBoundary_ErrorsTest } from '@/pages/errors-test/error-boundary'

export const ARKZEN_ERROR_BOUNDARIES: Record<string, React.ComponentType<{ children: React.ReactNode }>> = {
  'errors-test': ArkzenErrorBoundary_ErrorsTest,
}

export const ARKZEN_ROUTES: ArkzenRoute[] = [
  { path: '/asset-hub', name: 'index', tatemono: 'asset-hub', component: ArkzenPage_AssetHub_Index, auth: false },
  { path: '/atelier', name: 'index', tatemono: 'atelier', component: ArkzenPage_Atelier_Index, auth: false },
  { path: '/auth-test/login', name: 'login', tatemono: 'auth-test', component: ArkzenPage_AuthTest_Login, auth: true },
  { path: '/auth-test/register', name: 'register', tatemono: 'auth-test', component: ArkzenPage_AuthTest_Register, auth: true },
  { path: '/auth-test/dashboard', name: 'dashboard', tatemono: 'auth-test', component: ArkzenPage_AuthTest_Dashboard, auth: true },
  { path: '/auth-test', name: '__root_redirect', tatemono: 'auth-test', component: ArkzenPage_AuthTest_RootRedirect, auth: true },
  { path: '/body-endpoint-handler', name: 'index', tatemono: 'body-endpoint-handler', component: ArkzenPage_BodyEndpointHandler_Index, auth: false },
  { path: '/body-mail-notification/login', name: 'login', tatemono: 'body-mail-notification', component: ArkzenPage_BodyMailNotification_Login, auth: true },
  { path: '/body-mail-notification/register', name: 'register', tatemono: 'body-mail-notification', component: ArkzenPage_BodyMailNotification_Register, auth: true },
  { path: '/body-mail-notification/dashboard', name: 'dashboard', tatemono: 'body-mail-notification', component: ArkzenPage_BodyMailNotification_Dashboard, auth: true },
  { path: '/body-mail-notification', name: '__root_redirect', tatemono: 'body-mail-notification', component: ArkzenPage_BodyMailNotification_RootRedirect, auth: true },
  { path: '/broadcast-test/login', name: 'login', tatemono: 'broadcast-test', component: ArkzenPage_BroadcastTest_Login, auth: true },
  { path: '/broadcast-test/register', name: 'register', tatemono: 'broadcast-test', component: ArkzenPage_BroadcastTest_Register, auth: true },
  { path: '/broadcast-test/dashboard', name: 'dashboard', tatemono: 'broadcast-test', component: ArkzenPage_BroadcastTest_Dashboard, auth: true },
  { path: '/broadcast-test', name: '__root_redirect', tatemono: 'broadcast-test', component: ArkzenPage_BroadcastTest_RootRedirect, auth: true },
  { path: '/cafe-teresita', name: 'index', tatemono: 'cafe-teresita', component: ArkzenPage_CafeTeresita_Index, auth: false },
  { path: '/crud-test', name: 'index', tatemono: 'crud-test', component: ArkzenPage_CrudTest_Index, auth: false },
  { path: '/dtr-geofencing', name: 'index', tatemono: 'dtr-geofencing', component: ArkzenPage_DtrGeofencing_Index, auth: false },
  { path: '/dtr-geofencing/admin', name: 'admin', tatemono: 'dtr-geofencing', component: ArkzenPage_DtrGeofencing_Admin, auth: false },
  { path: '/errors-test', name: 'index', tatemono: 'errors-test', component: ArkzenPage_ErrorsTest_Index, auth: false },
  { path: '/errors-test/*', name: 'not-found', tatemono: 'errors-test', component: ArkzenPage_ErrorsTest_NotFound, auth: false },
  { path: '/ethan-pool', name: 'index', tatemono: 'ethan-pool', component: ArkzenPage_EthanPool_Index, auth: false },
  { path: '/events-test', name: 'index', tatemono: 'events-test', component: ArkzenPage_EventsTest_Index, auth: false },
  { path: '/hw-coffee', name: 'index', tatemono: 'hw-coffee', component: ArkzenPage_HwCoffee_Index, auth: false },
  { path: '/inventory-management', name: 'index', tatemono: 'inventory-management', component: ArkzenPage_InventoryManagement_Index, auth: false },
  { path: '/jo-payroll', name: 'index', tatemono: 'jo-payroll', component: ArkzenPage_JoPayroll_Index, auth: false },
  { path: '/jo-payroll/job-database', name: 'job-database', tatemono: 'jo-payroll', component: ArkzenPage_JoPayroll_JobDatabase, auth: false },
  { path: '/jo-payroll/cash-atm', name: 'cash-atm', tatemono: 'jo-payroll', component: ArkzenPage_JoPayroll_CashAtm, auth: false },
  { path: '/jo-payroll/sss', name: 'sss', tatemono: 'jo-payroll', component: ArkzenPage_JoPayroll_Sss, auth: false },
  { path: '/jo-payroll/hdmf', name: 'hdmf', tatemono: 'jo-payroll', component: ArkzenPage_JoPayroll_Hdmf, auth: false },
  { path: '/jo-payroll/appointments', name: 'appointments', tatemono: 'jo-payroll', component: ArkzenPage_JoPayroll_Appointments, auth: false },
  { path: '/jo-payroll/payslip', name: 'payslip', tatemono: 'jo-payroll', component: ArkzenPage_JoPayroll_Payslip, auth: false },
  { path: '/jo-payroll/*', name: 'not-found', tatemono: 'jo-payroll', component: ArkzenPage_JoPayroll_NotFound, auth: false },
  { path: '/job-test/dashboard', name: 'dashboard', tatemono: 'job-test', component: ArkzenPage_JobTest_Dashboard, auth: false },
  { path: '/job-test', name: '__root_redirect', tatemono: 'job-test', component: ArkzenPage_JobTest_RootRedirect, auth: false },
  { path: '/layout-test', name: 'index', tatemono: 'layout-test', component: ArkzenPage_LayoutTest_Index, auth: false },
  { path: '/layout-test/panel', name: 'panel', tatemono: 'layout-test', component: ArkzenPage_LayoutTest_Panel, auth: false },
  { path: '/layout-test/deep', name: 'deep', tatemono: 'layout-test', component: ArkzenPage_LayoutTest_Deep, auth: false },
  { path: '/layout-test/guard-auth', name: 'guard-auth', tatemono: 'layout-test', component: ArkzenPage_LayoutTest_GuardAuth, auth: false },
  { path: '/layout-test/chain-auth', name: 'chain-auth', tatemono: 'layout-test', component: ArkzenPage_LayoutTest_ChainAuth, auth: false },
  { path: '/layout-test/guard-guest', name: 'guard-guest', tatemono: 'layout-test', component: ArkzenPage_LayoutTest_GuardGuest, auth: false },
  { path: '/layout-test/chain-guest', name: 'chain-guest', tatemono: 'layout-test', component: ArkzenPage_LayoutTest_ChainGuest, auth: false },
  { path: '/layout-test/*', name: 'not-found', tatemono: 'layout-test', component: ArkzenPage_LayoutTest_NotFound, auth: false },
  { path: '/mail-test/login', name: 'login', tatemono: 'mail-test', component: ArkzenPage_MailTest_Login, auth: true },
  { path: '/mail-test/register', name: 'register', tatemono: 'mail-test', component: ArkzenPage_MailTest_Register, auth: true },
  { path: '/mail-test/dashboard', name: 'dashboard', tatemono: 'mail-test', component: ArkzenPage_MailTest_Dashboard, auth: true },
  { path: '/mail-test', name: '__root_redirect', tatemono: 'mail-test', component: ArkzenPage_MailTest_RootRedirect, auth: true },
  { path: '/middleware-test', name: 'index', tatemono: 'middleware-test', component: ArkzenPage_MiddlewareTest_Index, auth: false },
  { path: '/new-updates-styles', name: 'index', tatemono: 'new-updates-styles', component: ArkzenPage_NewUpdatesStyles_Index, auth: false },
  { path: '/new-updates-styles/about', name: 'about', tatemono: 'new-updates-styles', component: ArkzenPage_NewUpdatesStyles_About, auth: false },
  { path: '/new-updates-styles/features', name: 'features', tatemono: 'new-updates-styles', component: ArkzenPage_NewUpdatesStyles_Features, auth: false },
  { path: '/new-updates-styles/*', name: 'not-found', tatemono: 'new-updates-styles', component: ArkzenPage_NewUpdatesStyles_NotFound, auth: false },
  { path: '/notification-test/login', name: 'login', tatemono: 'notification-test', component: ArkzenPage_NotificationTest_Login, auth: true },
  { path: '/notification-test/register', name: 'register', tatemono: 'notification-test', component: ArkzenPage_NotificationTest_Register, auth: true },
  { path: '/notification-test/dashboard', name: 'dashboard', tatemono: 'notification-test', component: ArkzenPage_NotificationTest_Dashboard, auth: true },
  { path: '/notification-test', name: '__root_redirect', tatemono: 'notification-test', component: ArkzenPage_NotificationTest_RootRedirect, auth: true },
  { path: '/portfolio-test', name: 'index', tatemono: 'portfolio-test', component: ArkzenPage_PortfolioTest_Index, auth: false },
  { path: '/roles-test/login', name: 'login', tatemono: 'roles-test', component: ArkzenPage_RolesTest_Login, auth: true },
  { path: '/roles-test/register', name: 'register', tatemono: 'roles-test', component: ArkzenPage_RolesTest_Register, auth: true },
  { path: '/roles-test/dashboard', name: 'dashboard', tatemono: 'roles-test', component: ArkzenPage_RolesTest_Dashboard, auth: true },
  { path: '/roles-test', name: '__root_redirect', tatemono: 'roles-test', component: ArkzenPage_RolesTest_RootRedirect, auth: true },
  { path: '/scheduler-test/dashboard', name: 'dashboard', tatemono: 'scheduler-test', component: ArkzenPage_SchedulerTest_Dashboard, auth: false },
  { path: '/scheduler-test', name: '__root_redirect', tatemono: 'scheduler-test', component: ArkzenPage_SchedulerTest_RootRedirect, auth: false },
  { path: '/upload-test/dashboard', name: 'dashboard', tatemono: 'upload-test', component: ArkzenPage_UploadTest_Dashboard, auth: false },
  { path: '/upload-test', name: '__root_redirect', tatemono: 'upload-test', component: ArkzenPage_UploadTest_RootRedirect, auth: false },
  { path: '/visual-lab', name: 'index', tatemono: 'visual-lab', component: ArkzenPage_VisualLab_Index, auth: false },
  { path: '/ethereane', name: 'index', tatemono: 'ethereane', component: ArkzenPage_Ethereane_Index, auth: false },
]
