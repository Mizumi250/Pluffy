// ============================================================
// ARKZEN GENERATED — React Navigation Route Registry v2.0
// Auto-updated when tatemonos are built/removed
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

// ROUTE:animation-lab:index:animation-lab/index:default:false
import { ArkzenScreen_AnimationLab_Index as AnimationLabIndexScreen } from '../../screens/animation-lab/index'

// React Navigation param list — required for type-safe navigation
export type ArkzenRootStackParamList = {
  'animation-lab/index': undefined
}

export interface ArkzenNativeRoute {
  name:      string
  component: React.ComponentType<any>
  auth:      boolean
  tatemono:  string
  screenName: string
  layout:    string
}

export const ARKZEN_NATIVE_ROUTES: ArkzenNativeRoute[] = [
  {
    name:      'animation-lab/index',
    component: AnimationLabIndexScreen,
    auth:      false,
    tatemono:  'animation-lab',
    screenName: 'index',
    layout:    'default',
  }
]

export function getFirstRouteForTat(tatName: string): string | undefined {
  return ARKZEN_NATIVE_ROUTES.find(r => r.tatemono === tatName)?.name
}

export function getLoginRoute(tatName: string): string {
  const login = ARKZEN_NATIVE_ROUTES.find(r => r.tatemono === tatName && r.screenName === 'login')
  return login?.name ?? `${tatName}/login`
}

export function getDashboardRoute(tatName: string): string {
  const dash = ARKZEN_NATIVE_ROUTES.find(
    r => r.tatemono === tatName && (r.screenName === 'dashboard' || r.screenName === 'index') && r.auth
  )
  return dash?.name ?? `${tatName}/dashboard`
}
