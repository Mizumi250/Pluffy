// ============================================================
// ARKZEN ENGINE — EXPO ROUTER v2.0
//
// Generates Expo screen files from @arkzen:native:page blocks ONLY.
// Never touches web DSL (@arkzen:web:page). If a tatemono has no
// nativePages the builder already skips it before reaching here.
//
// Outputs per tatemono screen:
//
//   1. src/screens/{tat}/{screen}.tsx
//      Screen component built from @arkzen:native:page JSX.
//      Uses React Native primitives + NativeWind className.
//
//   2. app/{tat}/{screen}.tsx
//      Thin Expo Router file-based route entry — re-exports
//      the screen. Expo Router auto-discovers these as routes.
//
//   3. src/arkzen/generated/routes.ts
//      Route registry consumed by layouts and navigation helpers.
//
// Layout values for native pages (set via @arkzen:native:page:layout:name):
//   auth    → wrapped in AuthLayout  (requires login)
//   guest   → wrapped in GuestLayout (redirects if logged in)
//   app     → wrapped in AppLayout   (no auth redirect, general shell)
//   default → bare SafeAreaView, no layout wrapper
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage } from '../types'

// Resolved relative to CWD (engine/frontend/expo/)
const SRC_SCREENS_DIR  = path.resolve(process.cwd(), 'src', 'screens')
const APP_DIR          = path.resolve(process.cwd(), 'app')
const GENERATED_DIR    = path.resolve(process.cwd(), 'src', 'arkzen', 'generated')
const ROUTES_FILE      = path.join(GENERATED_DIR, 'routes.ts')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true })
}

// ─── Screen component generator ───────────────────────────────────────────────
//
// Generates src/screens/{tat}/{screen}.tsx from @arkzen:native:page JSX.
// No web JSX fallback — if there's no native content a clean placeholder
// is generated so the screen still compiles.

function generateScreenFile(tatemono: ParsedTatemono, page: ArkzenPage): string {
  const tatName    = tatemono.meta.name
  const screenName = toPascalCase(page.name) + 'Screen'
  const layout     = page.layout ?? 'default'
  const isAuth     = layout === 'auth'
  const isGuest    = layout === 'guest'
  const isApp      = layout === 'app'

  const layoutImport = isAuth
    ? `import { AuthLayout }  from '@/layouts/AuthLayout'`
    : isGuest
    ? `import { GuestLayout } from '@/layouts/GuestLayout'`
    : isApp
    ? `import { AppLayout }   from '@/layouts/AppLayout'`
    : `// No layout wrapper — default bare screen`

  const layoutOpen = isAuth
    ? `<AuthLayout tatSlug="${tatName}" loginRoute="/${tatName}/login">`
    : isGuest
    ? `<GuestLayout tatSlug="${tatName}" dashboardRoute="/${tatName}/dashboard">`
    : isApp
    ? `<AppLayout tatSlug="${tatName}">`
    : ''

  const layoutClose = isAuth
    ? `</AuthLayout>`
    : isGuest
    ? `</GuestLayout>`
    : isApp
    ? `</AppLayout>`
    : ''

  const hasNativeContent = page.raw && page.raw.trim().length > 0

  const screenBody = hasNativeContent
    ? page.raw.trim()
    : `{/* ── PLACEHOLDER — write JSX inside @arkzen:native:page:${page.name} ── */}
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-xs text-gray-400 uppercase tracking-widest mb-2">
            ${tatName}
          </Text>
          <Text className="text-2xl font-semibold text-gray-900 mb-3">
            ${page.name}
          </Text>
          <Text className="text-sm text-gray-500 text-center max-w-xs leading-5">
            Add your native UI inside @arkzen:native:page:${page.name} in your tatemono.
          </Text>
        </View>`

  return `// ============================================================
// ARKZEN GENERATED SCREEN — ${tatName}/${page.name} [Expo]
// Source: @arkzen:native:page:${page.name}
// Layout: ${layout} | Auth required: ${isAuth}
// DO NOT EDIT — edit tatemono @arkzen:native:page:${page.name} instead
// Generated: ${new Date().toISOString()}
// ============================================================

import React from 'react'
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  FlatList,
  ActivityIndicator,
  SafeAreaView,
  Image,
  Pressable,
  RefreshControl,
  KeyboardAvoidingView,
  Platform,
} from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
${layoutImport}

export function ${screenName}() {
  const router = useRouter()

  return (
    <SafeAreaView className="flex-1 bg-neutral-50">
      <StatusBar style="dark" />
      ${layoutOpen}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        ${screenBody}
      </ScrollView>
      ${layoutClose}
    </SafeAreaView>
  )
}

export default ${screenName}
`
}

// ─── Expo Router file-based route entry ───────────────────────────────────────
//
// app/{tat}/{screen}.tsx — thin re-export, no logic here.

function generateExpoRouteFile(tatName: string, screenName: string): string {
  return `// ============================================================
// ARKZEN EXPO ROUTE — ${tatName}/${screenName}
// DO NOT EDIT — managed by Arkzen engine
// ============================================================

export { default } from '@/screens/${tatName}/${screenName}'
`
}

// ─── Route registry ───────────────────────────────────────────────────────────

interface ExpoRoute {
  tatName:    string
  screenName: string
  routePath:  string
  layout:     string
  auth:       boolean
}

function readExistingRoutes(): ExpoRoute[] {
  if (!fs.existsSync(ROUTES_FILE)) return []
  const content = fs.readFileSync(ROUTES_FILE, 'utf-8')
  const matches = [
    ...content.matchAll(
      /\/\/ ROUTE:([^:]+):([^:]+):([^:]+):([^:]+):(true|false)/g
    ),
  ]
  return matches.map(m => ({
    tatName:    m[1],
    screenName: m[2],
    routePath:  m[3],
    layout:     m[4],
    auth:       m[5] === 'true',
  }))
}

function writeRouteRegistry(routes: ExpoRoute[]): void {
  ensureDir(GENERATED_DIR)

  const routeLines = routes.map(r =>
    `// ROUTE:${r.tatName}:${r.screenName}:${r.routePath}:${r.layout}:${r.auth}\n` +
    `  { tatName: '${r.tatName}', screenName: '${r.screenName}', routePath: '${r.routePath}', layout: '${r.layout}', auth: ${r.auth} },`
  ).join('\n')

  const content = `// ============================================================
// ARKZEN GENERATED — Expo Route Registry v2.0
// Auto-updated when tatemonos are built / removed
// DO NOT EDIT — managed by Arkzen engine
//
// Only tatemonos with @arkzen:native:page blocks appear here.
// Web-only tatemonos are never registered.
//
// Consumed by:
//   src/layouts/AuthLayout.tsx   — login route per tatemono
//   src/layouts/GuestLayout.tsx  — dashboard route per tatemono
//   src/layouts/AppLayout.tsx    — app shell per tatemono
// ============================================================

export interface ArkzenExpoRoute {
  tatName:    string
  screenName: string
  /** Expo Router path e.g. '/barbershop-booking/index' */
  routePath:  string
  /** 'guest' | 'auth' | 'app' | 'default' */
  layout:     string
  auth:       boolean
}

export const ARKZEN_EXPO_ROUTES: ArkzenExpoRoute[] = [
${routeLines}
]

/** Find the login route for a given tatemono */
export function getLoginRoute(tatName: string): string {
  const login = ARKZEN_EXPO_ROUTES.find(
    r => r.tatName === tatName && r.screenName === 'login'
  )
  return login?.routePath ?? \`/\${tatName}/login\`
}

/** Find the dashboard / first auth-required route for a given tatemono */
export function getDashboardRoute(tatName: string): string {
  const dashboard = ARKZEN_EXPO_ROUTES.find(
    r => r.tatName === tatName && (r.screenName === 'dashboard' || r.screenName === 'index') && r.auth
  )
  return dashboard?.routePath ?? \`/\${tatName}/dashboard\`
}
`

  fs.writeFileSync(ROUTES_FILE, content, 'utf-8')
}

// ─── Main: register native screens only ──────────────────────────────────────
//
// Called by expo-builder AFTER the native guard passes, so parsed.nativePages
// is guaranteed non-empty here. Uses parsed.nativePages exclusively.

export function registerExpoScreens(tatemono: ParsedTatemono): void {
  const tatName = tatemono.meta.name

  const screenDir = path.join(SRC_SCREENS_DIR, tatName)
  const appDir    = path.join(APP_DIR, tatName)
  ensureDir(screenDir)
  ensureDir(appDir)

  const existingRoutes = readExistingRoutes().filter(r => r.tatName !== tatName)
  const newRoutes: ExpoRoute[] = []

  for (const page of tatemono.nativePages) {
    const screenName = page.name
    const routePath  = `/${tatName}/${screenName}`
    const layout     = page.layout ?? 'default'

    // src/screens/{tat}/{screen}.tsx
    const screenContent = generateScreenFile(tatemono, page)
    fs.writeFileSync(path.join(screenDir, `${screenName}.tsx`), screenContent, 'utf-8')

    // app/{tat}/{screen}.tsx
    const routeContent = generateExpoRouteFile(tatName, screenName)
    fs.writeFileSync(path.join(appDir, `${screenName}.tsx`), routeContent, 'utf-8')

    newRoutes.push({
      tatName,
      screenName,
      routePath,
      layout,
      auth: tatemono.meta.auth && layout === 'auth',
    })

    console.log(`[Arkzen Expo Router] ✓ ${routePath} [${layout}]`)
  }

  writeRouteRegistry([...existingRoutes, ...newRoutes])
  console.log(`[Arkzen Expo Router] ✓ Route registry updated: ${newRoutes.length} screen(s)`)
}

// ─── Remove tatemono screens ──────────────────────────────────────────────────

export function unregisterExpoScreens(tatName: string): void {
  const screenDir = path.join(SRC_SCREENS_DIR, tatName)
  if (fs.existsSync(screenDir)) {
    fs.rmSync(screenDir, { recursive: true, force: true })
    console.log(`[Arkzen Expo Router] ✓ Removed screens: ${tatName}`)
  }

  const appDir = path.join(APP_DIR, tatName)
  if (fs.existsSync(appDir)) {
    fs.rmSync(appDir, { recursive: true, force: true })
    console.log(`[Arkzen Expo Router] ✓ Removed app routes: ${tatName}`)
  }

  const routes = readExistingRoutes().filter(r => r.tatName !== tatName)
  writeRouteRegistry(routes)
  console.log(`[Arkzen Expo Router] ✓ Route registry updated`)
}
