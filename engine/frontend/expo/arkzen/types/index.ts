// ============================================================
// ARKZEN ENGINE — EXPO TYPES v1.0
// arkzen/types/index.ts
//
// Re-exports all shared types from the Next.js engine.
// Adds Expo-specific types for Expo Router, SecureStore, etc.
// ============================================================

// Re-export all shared types from the Next.js engine
export type {
  ParsedTatemono,
  ArkzenPage,
  ArkzenComponent,
  ArkzenLayout,
  ArkzenDatabase,
  ArkzenApi,
  ArkzenMeta,
  BuildResult,
  BuildStep,
} from '../../../nextjs/arkzen/types'

// ─── Expo screen definition ───────────────────────────────────────────────────

export interface ExpoScreenDef {
  /** tatemono name e.g. 'barbershop-booking' */
  tatemono:   string
  /** screen name from @arkzen:native:page:name e.g. 'index' | 'dashboard' | 'login' */
  screen:     string
  /** Expo Router file path e.g. 'app/barbershop-booking/index.tsx' */
  filePath:   string
  /** layout type — 'guest' | 'auth' | custom */
  layout:     string
  /** Whether auth guard is active */
  auth:       boolean
}

export interface ExpoBuildResult {
  success:  boolean
  tatemono: string
  errors:   string[]
  steps:    { name: string; status: 'success' | 'failed'; message?: string }[]
}

// ─── Expo Router types ────────────────────────────────────────────────────────

export type ExpoRouterHref =
  | string
  | { pathname: string; params?: Record<string, string> }

// ─── Arkzen Expo auth types ───────────────────────────────────────────────────

export interface ArkzenExpoAuthState {
  token:     string | null
  user:      { id: number; name: string; email: string; role?: string } | null
  isLoading: boolean
  error:     string | null
}

// ─── Native meta (parsed from @arkzen:meta:native) ───────────────────────────

export interface ArkzenNativeMeta {
  /** 'expo' | 'bare-react-native' — defaults to 'expo' if omitted */
  framework?:   'expo' | 'bare-react-native'
  /** Expo SDK version e.g. 52 */
  sdk?:         number
  /** App display name shown on device */
  displayName?: string
  /** App bundle identifier e.g. com.yourco.appname */
  bundleId?:    string
  /** Status bar style */
  statusBar?:   'light' | 'dark' | 'auto'
  /** Orientation lock */
  orientation?: 'portrait' | 'landscape' | 'default'
  /** Primary brand color for splash / icon backgrounds */
  primaryColor?: string
}
