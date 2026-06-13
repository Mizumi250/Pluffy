// ============================================================
// ARKZEN GENERATED — Route Tree (TanStack Start)
// Auto-updated when tatemonos are built/removed.
// DO NOT EDIT — managed by Arkzen engine (tanstack-router.ts)
// ============================================================

import { createRootRoute, createRoute, createRouter, lazyRouteComponent } from '@tanstack/react-router'
import { Route as RootRoute } from '../../routes/__root'
import { Route as IndexRoute } from '../../routes/index'

// ─── Tatemono page routes (injected by Arkzen engine) ────────

// TANSTACK_ROUTE_IMPORTS_START
import { Route as Route_animation_lab_index } from '../../routes/animation-lab/index'
import { Route as Route_asset_hub_index } from '../../routes/asset-hub/index'
import { Route as Route_auth_test_login } from '../../routes/auth-test/login'
import { Route as Route_auth_test_register } from '../../routes/auth-test/register'
import { Route as Route_auth_test_dashboard } from '../../routes/auth-test/dashboard'
import { Route as Route_body_endpoint_handler_index } from '../../routes/body-endpoint-handler/index'
import { Route as Route_body_mail_notification_login } from '../../routes/body-mail-notification/login'
import { Route as Route_body_mail_notification_register } from '../../routes/body-mail-notification/register'
import { Route as Route_body_mail_notification_dashboard } from '../../routes/body-mail-notification/dashboard'
import { Route as Route_broadcast_test_login } from '../../routes/broadcast-test/login'
import { Route as Route_broadcast_test_register } from '../../routes/broadcast-test/register'
import { Route as Route_broadcast_test_dashboard } from '../../routes/broadcast-test/dashboard'
import { Route as Route_crud_test_index } from '../../routes/crud-test/index'
import { Route as Route_dtr_geofencing_index } from '../../routes/dtr-geofencing/index'
import { Route as Route_dtr_geofencing_admin } from '../../routes/dtr-geofencing/admin'
import { Route as Route_errors_test_index } from '../../routes/errors-test/index'
import { Route as Route_events_test_index } from '../../routes/events-test/index'
import { Route as Route_inventory_management_index } from '../../routes/inventory-management/index'
import { Route as Route_jo_payroll_index } from '../../routes/jo-payroll/index'
import { Route as Route_jo_payroll_job_database } from '../../routes/jo-payroll/job-database'
import { Route as Route_jo_payroll_cash_atm } from '../../routes/jo-payroll/cash-atm'
import { Route as Route_jo_payroll_sss } from '../../routes/jo-payroll/sss'
import { Route as Route_jo_payroll_hdmf } from '../../routes/jo-payroll/hdmf'
import { Route as Route_jo_payroll_appointments } from '../../routes/jo-payroll/appointments'
import { Route as Route_jo_payroll_payslip } from '../../routes/jo-payroll/payslip'
import { Route as Route_job_test_dashboard } from '../../routes/job-test/dashboard'
import { Route as Route_mail_test_login } from '../../routes/mail-test/login'
import { Route as Route_mail_test_register } from '../../routes/mail-test/register'
import { Route as Route_mail_test_dashboard } from '../../routes/mail-test/dashboard'
import { Route as Route_middleware_test_index } from '../../routes/middleware-test/index'
import { Route as Route_new_updates_styles_index } from '../../routes/new-updates-styles/index'
import { Route as Route_new_updates_styles_about } from '../../routes/new-updates-styles/about'
import { Route as Route_new_updates_styles_features } from '../../routes/new-updates-styles/features'
import { Route as Route_notification_test_login } from '../../routes/notification-test/login'
import { Route as Route_notification_test_register } from '../../routes/notification-test/register'
import { Route as Route_notification_test_dashboard } from '../../routes/notification-test/dashboard'
import { Route as Route_portfolio_test_index } from '../../routes/portfolio-test/index'
import { Route as Route_queue_flow_index } from '../../routes/queue-flow/index'
import { Route as Route_queue_flow_join } from '../../routes/queue-flow/join'
import { Route as Route_queue_flow_admin } from '../../routes/queue-flow/admin'
import { Route as Route_roles_test_login } from '../../routes/roles-test/login'
import { Route as Route_roles_test_register } from '../../routes/roles-test/register'
import { Route as Route_roles_test_dashboard } from '../../routes/roles-test/dashboard'
import { Route as Route_scheduler_test_dashboard } from '../../routes/scheduler-test/dashboard'
import { Route as Route_shan_shan_index } from '../../routes/shan-shan/index'
import { Route as Route_upload_test_dashboard } from '../../routes/upload-test/dashboard'
import { Route as Route_visual_lab_index } from '../../routes/visual-lab/index'
// TANSTACK_ROUTE_IMPORTS_END

// ─── Route tree assembly ──────────────────────────────────────

const routeTree = RootRoute.addChildren([
  IndexRoute,

  // TANSTACK_ROUTE_CHILDREN_START
  Route_animation_lab_index,
  Route_asset_hub_index,
  Route_auth_test_login,
  Route_auth_test_register,
  Route_auth_test_dashboard,
  Route_body_endpoint_handler_index,
  Route_body_mail_notification_login,
  Route_body_mail_notification_register,
  Route_body_mail_notification_dashboard,
  Route_broadcast_test_login,
  Route_broadcast_test_register,
  Route_broadcast_test_dashboard,
  Route_crud_test_index,
  Route_dtr_geofencing_index,
  Route_dtr_geofencing_admin,
  Route_errors_test_index,
  Route_events_test_index,
  Route_inventory_management_index,
  Route_jo_payroll_index,
  Route_jo_payroll_job_database,
  Route_jo_payroll_cash_atm,
  Route_jo_payroll_sss,
  Route_jo_payroll_hdmf,
  Route_jo_payroll_appointments,
  Route_jo_payroll_payslip,
  Route_job_test_dashboard,
  Route_mail_test_login,
  Route_mail_test_register,
  Route_mail_test_dashboard,
  Route_middleware_test_index,
  Route_new_updates_styles_index,
  Route_new_updates_styles_about,
  Route_new_updates_styles_features,
  Route_notification_test_login,
  Route_notification_test_register,
  Route_notification_test_dashboard,
  Route_portfolio_test_index,
  Route_queue_flow_index,
  Route_queue_flow_join,
  Route_queue_flow_admin,
  Route_roles_test_login,
  Route_roles_test_register,
  Route_roles_test_dashboard,
  Route_scheduler_test_dashboard,
  Route_shan_shan_index,
  Route_upload_test_dashboard,
  Route_visual_lab_index,
  // TANSTACK_ROUTE_CHILDREN_END
])

export { routeTree }

// ─── Auth tatemonos manifest ──────────────────────────────────

// TANSTACK_AUTH_TATEMONOS_START
export const AUTH_TATEMONOS: string[] = [
  "auth-test",
  "body-mail-notification",
  "broadcast-test",
  "mail-test",
  "notification-test",
  "roles-test",
]
// TANSTACK_AUTH_TATEMONOS_END
