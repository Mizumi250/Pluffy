// ============================================================
// ARKZEN ENGINE — EXPO ROUTER v1.0
//
// Expo equivalent of nextjs/arkzen/core/router.ts.
// Generates two outputs per tatemono screen:
//
//   1. src/screens/{tat}/{screen}.tsx
//      The actual screen component with NativeWind className styling.
//      This is where the tatemono's @arkzen:native:page content lives.
//      The screen reads its own JSX from the tatemono DSL block.
//
//   2. app/{tat}/{screen}.tsx
//      Thin Expo Router file-based route entry.
//      Just re-exports the screen from src/screens/.
//      Expo Router auto-discovers these as routes.
//
//   3. src/arkzen/generated/routes.ts
//      Route registry consumed by src/layouts/ and navigation helpers.
//
// KEY DIFFERENCES from web router:
//   - No HTML elements — React Native View/Text/etc
//   - No CSS — NativeWind className (same Tailwind syntax)
//   - No <div> — <View>, <Text>, <ScrollView>, <FlatList>
//   - No href routing — expo-router useRouter().push()
//   - Layouts are NOT file-based segments — they're React components
//     wrapping screen content (AuthLayout / GuestLayout)
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
// Generates src/screens/{tat}/{screen}.tsx
//
// v1.0: Scaffold screen — uses NativeWind className prop.
// The tatemono author writes native JSX inside @arkzen:native:page:name blocks.
// The engine places that JSX directly into the screen component.
//
// For tatemonos without a native section (@arkzen:meta:native),
// a well-structured placeholder screen is generated instead.
// This placeholder shows the web JSX as a comment reference.

function generateScreenFile(tatemono: ParsedTatemono, page: ArkzenPage): string {
  const tatName    = tatemono.meta.name
  const screenName = toPascalCase(page.name) + 'Screen'
  const isAuth     = page.layout === 'auth'
  const isGuest    = page.layout === 'guest'

  const layoutImport = isAuth
    ? `import { AuthLayout }  from '@/layouts/AuthLayout'`
    : isGuest
    ? `import { GuestLayout } from '@/layouts/GuestLayout'`
    : `// No layout wrapper — blank screen`

  const layoutOpen = isAuth
    ? `<AuthLayout tatSlug="${tatName}" loginRoute="/${tatName}/login">`
    : isGuest
    ? `<GuestLayout tatSlug="${tatName}" dashboardRoute="/${tatName}/dashboard">`
    : ''

  const layoutClose = isAuth
    ? `</AuthLayout>`
    : isGuest
    ? `</GuestLayout>`
    : ''

  // The raw content from the tatemono page block
  // In v1.0 this is the web JSX preserved as comment + a native placeholder
  // When authors write @arkzen:native:page blocks, raw IS native JSX
  const hasNativeContent = page.raw && page.raw.trim().length > 0

  const screenBody = hasNativeContent
    ? page.raw.trim()
    : `{/* ── PLACEHOLDER — Replace with your native UI ────────────── */}
        <View className="flex-1 items-center justify-center p-6">
          <Text className="text-xs text-gray-400 uppercase tracking-widest mb-2">
            ${tatName}
          </Text>
          <Text className="text-2xl font-semibold text-gray-900 mb-3">
            ${page.name}
          </Text>
          <Text className="text-sm text-gray-500 text-center max-w-xs leading-5">
            Build this screen with React Native + NativeWind.
            Write JSX inside @arkzen:native:page:${page.name} in your tatemono.
          </Text>
        </View>`

  return `// ============================================================
// ARKZEN GENERATED SCREEN — ${tatName}/${page.name} [Expo]
// Layout: ${page.layout} | Auth required: ${isAuth}
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
      ${layoutOpen ? layoutOpen : ''}
      <ScrollView
        className="flex-1"
        contentContainerStyle={{ flexGrow: 1 }}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        ${screenBody}
      </ScrollView>
      ${layoutClose ? layoutClose : ''}
    </SafeAreaView>
  )
}

export default ${screenName}
`
}

// ─── Expo Router file-based route entry ───────────────────────────────────────
//
// Generates app/{tat}/{screen}.tsx
// This is a thin re-export so Expo Router discovers the route.
// All logic lives in src/screens/.

function generateExpoRouteFile(tatName: string, screenName: string, pascalName: string): string {
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
  routePath:  string   // e.g. '/barbershop-booking/index'
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

// ─── Main: register tatemono screens ─────────────────────────────────────────

export function registerExpoScreens(tatemono: ParsedTatemono): void {
  const tatName = tatemono.meta.name

  const screenDir = path.join(SRC_SCREENS_DIR, tatName)
  const appDir    = path.join(APP_DIR, tatName)
  ensureDir(screenDir)
  ensureDir(appDir)

  const existingRoutes = readExistingRoutes().filter(r => r.tatName !== tatName)
  const newRoutes: ExpoRoute[] = []

  for (const page of tatemono.pages) {
    const screenName  = page.name
    const pascalName  = toPascalCase(screenName) + 'Screen'
    const routePath   = `/${tatName}/${screenName}`

    // Write src/screens/{tat}/{screen}.tsx
    const screenContent = generateScreenFile(tatemono, page)
    fs.writeFileSync(path.join(screenDir, `${screenName}.tsx`), screenContent, 'utf-8')

    // Write app/{tat}/{screen}.tsx — thin Expo Router file-based entry
    const routeContent = generateExpoRouteFile(tatName, screenName, pascalName)
    fs.writeFileSync(path.join(appDir, `${screenName}.tsx`), routeContent, 'utf-8')

    newRoutes.push({
      tatName,
      screenName,
      routePath,
      layout: page.layout,
      auth:   tatemono.meta.auth && page.layout === 'auth',
    })

    console.log(`[Arkzen Expo Router] ✓ ${routePath} [${page.layout}]`)
  }

  writeRouteRegistry([...existingRoutes, ...newRoutes])
  console.log(`[Arkzen Expo Router] ✓ Route registry updated: ${newRoutes.length} screen(s)`)
}

// ─── Remove tatemono screens ──────────────────────────────────────────────────

export function unregisterExpoScreens(tatName: string): void {
  // Remove src/screens/{tat}/
  const screenDir = path.join(SRC_SCREENS_DIR, tatName)
  if (fs.existsSync(screenDir)) {
    fs.rmSync(screenDir, { recursive: true, force: true })
    console.log(`[Arkzen Expo Router] ✓ Removed screens: ${tatName}`)
  }

  // Remove app/{tat}/
  const appDir = path.join(APP_DIR, tatName)
  if (fs.existsSync(appDir)) {
    fs.rmSync(appDir, { recursive: true, force: true })
    console.log(`[Arkzen Expo Router] ✓ Removed app routes: ${tatName}`)
  }

  // Update route registry
  const routes = readExistingRoutes().filter(r => r.tatName !== tatName)
  writeRouteRegistry(routes)
  console.log(`[Arkzen Expo Router] ✓ Route registry updated`)
}
