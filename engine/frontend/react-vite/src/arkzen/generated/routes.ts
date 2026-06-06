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

// ROUTE:animation-lab:index:/animation-lab:false
const ArkzenPage_AnimationLab_Index = lazy(() => import('@/pages/animation-lab/index'))
// ROUTE:asset-hub:index:/asset-hub:false
const ArkzenPage_AssetHub_Index = lazy(() => import('@/pages/asset-hub/index'))
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
// ROUTE:certflow:login:/certflow/login:true
const ArkzenPage_Certflow_Login = lazy(() => import('@/pages/certflow/login'))
// ROUTE:certflow:dashboard:/certflow/dashboard:true
const ArkzenPage_Certflow_Dashboard = lazy(() => import('@/pages/certflow/dashboard'))
// ROUTE:certflow:fill:/certflow/fill:true
const ArkzenPage_Certflow_Fill = lazy(() => import('@/pages/certflow/fill'))
// ROUTE:certflow:verify:/certflow/verify:true
const ArkzenPage_Certflow_Verify = lazy(() => import('@/pages/certflow/verify'))
// ROUTE:certflow:__root_redirect:/certflow:true
const ArkzenPage_Certflow_RootRedirect = lazy(() => import('@/pages/certflow/__root_redirect'))
// ROUTE:church-community:index:/church-community:true
const ArkzenPage_ChurchCommunity_Index = lazy(() => import('@/pages/church-community/index'))
// ROUTE:church-community:members:/church-community/members:true
const ArkzenPage_ChurchCommunity_Members = lazy(() => import('@/pages/church-community/members'))
// ROUTE:church-community:inventory:/church-community/inventory:true
const ArkzenPage_ChurchCommunity_Inventory = lazy(() => import('@/pages/church-community/inventory'))
// ROUTE:church-community:admin:/church-community/admin:true
const ArkzenPage_ChurchCommunity_Admin = lazy(() => import('@/pages/church-community/admin'))
// ROUTE:church-community:login:/church-community/login:true
const ArkzenPage_ChurchCommunity_Login = lazy(() => import('@/pages/church-community/login'))
// ROUTE:church-community:register:/church-community/register:true
const ArkzenPage_ChurchCommunity_Register = lazy(() => import('@/pages/church-community/register'))
// ROUTE:crud-test:index:/crud-test:false
const ArkzenPage_CrudTest_Index = lazy(() => import('@/pages/crud-test/index'))
// ROUTE:dtr-geofencing:index:/dtr-geofencing:false
const ArkzenPage_DtrGeofencing_Index = lazy(() => import('@/pages/dtr-geofencing/index'))
// ROUTE:dtr-geofencing:admin:/dtr-geofencing/admin:false
const ArkzenPage_DtrGeofencing_Admin = lazy(() => import('@/pages/dtr-geofencing/admin'))
// ROUTE:events-test:index:/events-test:false
const ArkzenPage_EventsTest_Index = lazy(() => import('@/pages/events-test/index'))
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
// ROUTE:queue-flow:index:/queue-flow:false
const ArkzenPage_QueueFlow_Index = lazy(() => import('@/pages/queue-flow/index'))
// ROUTE:queue-flow:join:/queue-flow/join:false
const ArkzenPage_QueueFlow_Join = lazy(() => import('@/pages/queue-flow/join'))
// ROUTE:queue-flow:admin:/queue-flow/admin:false
const ArkzenPage_QueueFlow_Admin = lazy(() => import('@/pages/queue-flow/admin'))
// ROUTE:queue-flow:not-found:/queue-flow/*:false
const ArkzenPage_QueueFlow_NotFound = lazy(() => import('@/pages/queue-flow/not-found'))
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
// ROUTE:shan-shan:index:/shan-shan:false
const ArkzenPage_ShanShan_Index = lazy(() => import('@/pages/shan-shan/index'))
// ROUTE:upload-test:dashboard:/upload-test/dashboard:false
const ArkzenPage_UploadTest_Dashboard = lazy(() => import('@/pages/upload-test/dashboard'))
// ROUTE:upload-test:__root_redirect:/upload-test:false
const ArkzenPage_UploadTest_RootRedirect = lazy(() => import('@/pages/upload-test/__root_redirect'))
// ROUTE:visual-lab:index:/visual-lab:false
const ArkzenPage_VisualLab_Index = lazy(() => import('@/pages/visual-lab/index'))
// ROUTE:errors-test:index:/errors-test:false:ArkzenErrorBoundary_ErrorsTest
const ArkzenPage_ErrorsTest_Index = lazy(() => import('@/pages/errors-test/index'))
// ROUTE:errors-test:not-found:/errors-test/*:false
const ArkzenPage_ErrorsTest_NotFound = lazy(() => import('@/pages/errors-test/not-found'))

import { ArkzenErrorBoundary_ErrorsTest } from '@/pages/errors-test/error-boundary'

export const ARKZEN_ERROR_BOUNDARIES: Record<string, React.ComponentType<{ children: React.ReactNode }>> = {
  'errors-test': ArkzenErrorBoundary_ErrorsTest,
}

export const ARKZEN_ROUTES: ArkzenRoute[] = [
  { path: '/animation-lab', name: 'index', tatemono: 'animation-lab', component: ArkzenPage_AnimationLab_Index, auth: false },
  { path: '/asset-hub', name: 'index', tatemono: 'asset-hub', component: ArkzenPage_AssetHub_Index, auth: false },
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
  { path: '/certflow/login', name: 'login', tatemono: 'certflow', component: ArkzenPage_Certflow_Login, auth: true },
  { path: '/certflow/dashboard', name: 'dashboard', tatemono: 'certflow', component: ArkzenPage_Certflow_Dashboard, auth: true },
  { path: '/certflow/fill', name: 'fill', tatemono: 'certflow', component: ArkzenPage_Certflow_Fill, auth: true },
  { path: '/certflow/verify', name: 'verify', tatemono: 'certflow', component: ArkzenPage_Certflow_Verify, auth: true },
  { path: '/certflow', name: '__root_redirect', tatemono: 'certflow', component: ArkzenPage_Certflow_RootRedirect, auth: true },
  { path: '/church-community', name: 'index', tatemono: 'church-community', component: ArkzenPage_ChurchCommunity_Index, auth: true },
  { path: '/church-community/members', name: 'members', tatemono: 'church-community', component: ArkzenPage_ChurchCommunity_Members, auth: true },
  { path: '/church-community/inventory', name: 'inventory', tatemono: 'church-community', component: ArkzenPage_ChurchCommunity_Inventory, auth: true },
  { path: '/church-community/admin', name: 'admin', tatemono: 'church-community', component: ArkzenPage_ChurchCommunity_Admin, auth: true },
  { path: '/church-community/login', name: 'login', tatemono: 'church-community', component: ArkzenPage_ChurchCommunity_Login, auth: true },
  { path: '/church-community/register', name: 'register', tatemono: 'church-community', component: ArkzenPage_ChurchCommunity_Register, auth: true },
  { path: '/crud-test', name: 'index', tatemono: 'crud-test', component: ArkzenPage_CrudTest_Index, auth: false },
  { path: '/dtr-geofencing', name: 'index', tatemono: 'dtr-geofencing', component: ArkzenPage_DtrGeofencing_Index, auth: false },
  { path: '/dtr-geofencing/admin', name: 'admin', tatemono: 'dtr-geofencing', component: ArkzenPage_DtrGeofencing_Admin, auth: false },
  { path: '/events-test', name: 'index', tatemono: 'events-test', component: ArkzenPage_EventsTest_Index, auth: false },
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
  { path: '/mail-test/login', name: 'login', tatemono: 'mail-test', component: ArkzenPage_MailTest_Login, auth: true },
  { path: '/mail-test/register', name: 'register', tatemono: 'mail-test', component: ArkzenPage_MailTest_Register, auth: true },
  { path: '/mail-test/dashboard', name: 'dashboard', tatemono: 'mail-test', component: ArkzenPage_MailTest_Dashboard, auth: true },
  { path: '/mail-test', name: '__root_redirect', tatemono: 'mail-test', component: ArkzenPage_MailTest_RootRedirect, auth: true },
  { path: '/middleware-test', name: 'index', tatemono: 'middleware-test', component: ArkzenPage_MiddlewareTest_Index, auth: false },
  { path: '/new-updates-styles', name: 'index', tatemono: 'new-updates-styles', component: ArkzenPage_NewUpdatesStyles_Index, auth: false },
  { path: '/new-updates-styles/about', name: 'about', tatemono: 'new-updates-styles', component: ArkzenPage_NewUpdatesStyles_About, auth: false },
  { path: '/new-updates-styles/features', name: 'features', tatemono: 'new-updates-styles', component: ArkzenPage_NewUpdatesStyles_Features, auth: false },
  { path: '/notification-test/login', name: 'login', tatemono: 'notification-test', component: ArkzenPage_NotificationTest_Login, auth: true },
  { path: '/notification-test/register', name: 'register', tatemono: 'notification-test', component: ArkzenPage_NotificationTest_Register, auth: true },
  { path: '/notification-test/dashboard', name: 'dashboard', tatemono: 'notification-test', component: ArkzenPage_NotificationTest_Dashboard, auth: true },
  { path: '/notification-test', name: '__root_redirect', tatemono: 'notification-test', component: ArkzenPage_NotificationTest_RootRedirect, auth: true },
  { path: '/portfolio-test', name: 'index', tatemono: 'portfolio-test', component: ArkzenPage_PortfolioTest_Index, auth: false },
  { path: '/queue-flow', name: 'index', tatemono: 'queue-flow', component: ArkzenPage_QueueFlow_Index, auth: false },
  { path: '/queue-flow/join', name: 'join', tatemono: 'queue-flow', component: ArkzenPage_QueueFlow_Join, auth: false },
  { path: '/queue-flow/admin', name: 'admin', tatemono: 'queue-flow', component: ArkzenPage_QueueFlow_Admin, auth: false },
  { path: '/queue-flow/*', name: 'not-found', tatemono: 'queue-flow', component: ArkzenPage_QueueFlow_NotFound, auth: false },
  { path: '/roles-test/login', name: 'login', tatemono: 'roles-test', component: ArkzenPage_RolesTest_Login, auth: true },
  { path: '/roles-test/register', name: 'register', tatemono: 'roles-test', component: ArkzenPage_RolesTest_Register, auth: true },
  { path: '/roles-test/dashboard', name: 'dashboard', tatemono: 'roles-test', component: ArkzenPage_RolesTest_Dashboard, auth: true },
  { path: '/roles-test', name: '__root_redirect', tatemono: 'roles-test', component: ArkzenPage_RolesTest_RootRedirect, auth: true },
  { path: '/scheduler-test/dashboard', name: 'dashboard', tatemono: 'scheduler-test', component: ArkzenPage_SchedulerTest_Dashboard, auth: false },
  { path: '/scheduler-test', name: '__root_redirect', tatemono: 'scheduler-test', component: ArkzenPage_SchedulerTest_RootRedirect, auth: false },
  { path: '/shan-shan', name: 'index', tatemono: 'shan-shan', component: ArkzenPage_ShanShan_Index, auth: false },
  { path: '/upload-test/dashboard', name: 'dashboard', tatemono: 'upload-test', component: ArkzenPage_UploadTest_Dashboard, auth: false },
  { path: '/upload-test', name: '__root_redirect', tatemono: 'upload-test', component: ArkzenPage_UploadTest_RootRedirect, auth: false },
  { path: '/visual-lab', name: 'index', tatemono: 'visual-lab', component: ArkzenPage_VisualLab_Index, auth: false },
  { path: '/errors-test', name: 'index', tatemono: 'errors-test', component: ArkzenPage_ErrorsTest_Index, auth: false },
  { path: '/errors-test/*', name: 'not-found', tatemono: 'errors-test', component: ArkzenPage_ErrorsTest_NotFound, auth: false },
]
