// ============================================================
// ARKZEN ENGINE — NATIVE ROUTER v1.0
// React Native equivalent of router.ts / vite-router.ts
//
// KEY DIFFERENCES from web stacks:
//   - Pages → Screens (src/screens/{tat}/{screen}.tsx)
//   - React Router → React Navigation stack
//   - Route registry → navigation stack config (routes.ts)
//   - CSS/Tailwind → React Native StyleSheet
//   - HTML elements → RN View, Text, TouchableOpacity, etc.
//
// STATUS: Generates scaffold/placeholder screens.
//   The web JSX from @arkzen:page blocks is wrapped in a
//   placeholder screen component with a TODO comment.
//   Full web-to-native JSX transformation is planned for v9 final.
//   For now you get: working navigation stack + placeholder screens
//   that show the page name and a "build this screen" message.
// ============================================================

import * as fs   from 'fs'
import * as path from 'path'
import type { ParsedTatemono, ArkzenPage } from '../types'

const SRC_DIR       = path.resolve(process.cwd(), 'src')
const SCREENS_DIR   = path.join(SRC_DIR, 'screens')
const GENERATED_DIR = path.join(SRC_DIR, 'arkzen', 'generated')
const ROUTES_FILE   = path.join(GENERATED_DIR, 'routes.ts')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function toPascalCase(str: string): string {
  return str.replace(/(^\w|-\w|_\w)/g, m => m.replace(/[-_]/, '').toUpperCase())
}

function ensureDir(dir: string): void {
  fs.mkdirSync(dir, { recursive: true })
}

// ─── Generate a native screen file ───────────────────────────────────────────
//
// v9.0 foundation: generates a placeholder screen that shows the tatemono name
// and page name. The original web JSX is preserved as a comment block so you
// can see what the screen should do and build the native version.
//
// v9 final plan: transform web JSX → native JSX:
//   <div>      → <View>
//   <p>        → <Text>
//   <button>   → <TouchableOpacity><Text>
//   className  → StyleSheet
//   Tailwind   → StyleSheet.create({}) equivalents
//   navigate() → navigation.navigate()
//   fetch()    → arkzenFetch() (same as web)

function generateNativeScreenFile(tatemono: ParsedTatemono, page: ArkzenPage): string {
  const tatName    = tatemono.meta.name
  const screenName = toPascalCase(page.name) + 'Screen'
  const isAuth     = page.layout === 'auth' || (tatemono.meta.auth && page.layout !== 'guest')

  return `// ============================================================
// ARKZEN GENERATED SCREEN — ${tatName}/${page.name} [React Native]
// Auth required: ${isAuth}
// DO NOT EDIT — edit tatemono instead
// Generated: ${new Date().toISOString()}
//
// STATUS: Placeholder screen (v9 foundation)
// The web JSX from the tatemono is shown below as a reference.
// Replace this placeholder with native components to build the real screen.
//
// NATIVE PATTERNS TO USE:
//   navigation.navigate('ScreenName')  instead of navigate('/path')
//   StyleSheet.create({})              instead of Tailwind/CSS
//   <View>                             instead of <div>
//   <Text>                             instead of <p>, <h1>, <span>
//   <TouchableOpacity>                 instead of <button>
//   <TextInput>                        instead of <input>
//   <ScrollView>                       instead of overflow-y: scroll
//   <FlatList>                         instead of .map() inside ScrollView
//   AsyncStorage.getItem()             instead of localStorage
//   arkzenFetch()                      same as web — API is shared
// ============================================================

import React from 'react'
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  SafeAreaView,
} from 'react-native'
import type { NativeStackScreenProps } from '@react-navigation/native-stack'
import type { ArkzenRootStackParamList } from '@/arkzen/generated/routes'

type Props = NativeStackScreenProps<ArkzenRootStackParamList, '${tatName}/${page.name}'>

export function ${screenName}({ navigation, route }: Props) {
  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>

        {/* ── PLACEHOLDER — Replace with your native UI ─────────────── */}
        <View style={styles.placeholder}>
          <Text style={styles.tatName}>${tatName}</Text>
          <Text style={styles.screenName}>${page.name}</Text>
          <Text style={styles.note}>
            Build this screen with React Native components.
            See the web JSX reference in the comment block above.
          </Text>
          <TouchableOpacity
            style={styles.button}
            onPress={() => navigation.goBack()}
          >
            <Text style={styles.buttonText}>← Go Back</Text>
          </TouchableOpacity>
        </View>

        {/*
        ── WEB JSX REFERENCE (from @arkzen:page:${page.name}) ────────────
        The original web component code is below for reference.
        This is NOT valid React Native code — use it as a blueprint.

        ${page.raw.trim().split('\n').map(line => '        ' + line).join('\n')}

        ─────────────────────────────────────────────────────────────── */}

      </ScrollView>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f0',
  },
  content: {
    flexGrow: 1,
    padding: 24,
  },
  placeholder: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 12,
  },
  tatName: {
    fontSize: 12,
    color: '#aaa',
    fontFamily: 'System',
    letterSpacing: 1,
    textTransform: 'uppercase',
  },
  screenName: {
    fontSize: 28,
    fontWeight: '600',
    color: '#1a1a1a',
    fontFamily: 'System',
  },
  note: {
    fontSize: 13,
    color: '#888',
    textAlign: 'center',
    maxWidth: 280,
    lineHeight: 20,
    marginTop: 8,
  },
  button: {
    marginTop: 24,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: '#1a1a1a',
    borderRadius: 8,
  },
  buttonText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '500',
  },
})

export default ${screenName}
`
}

// ─── Route registry (React Navigation stack config) ──────────────────────────

interface NativeRoute {
  tatName:    string
  screenName: string
  routeKey:   string   // e.g. 'my-app/dashboard'
  auth:       boolean
}

function readExistingRoutes(): NativeRoute[] {
  if (!fs.existsSync(ROUTES_FILE)) return []
  const content = fs.readFileSync(ROUTES_FILE, 'utf-8')
  const matches = [...content.matchAll(/\/\/ ROUTE:([^:]+):([^:]+):([^:]+):(true|false)/g)]
  return matches.map(m => ({
    tatName:    m[1],
    screenName: m[2],
    routeKey:   m[3],
    auth:       m[4] === 'true',
  }))
}

function writeRouteRegistry(routes: NativeRoute[]): void {
  ensureDir(GENERATED_DIR)

  // Build the paramList type (React Navigation requires this)
  const paramListEntries = routes.map(r =>
    `  '${r.routeKey}': undefined`
  ).join('\n')

  // Build screen imports
  const imports = routes.map(r => {
    const screenComp = toPascalCase(r.tatName) + toPascalCase(r.screenName) + 'Screen'
    const filePath   = `@/screens/${r.tatName}/${r.screenName}`
    return `// ROUTE:${r.tatName}:${r.screenName}:${r.routeKey}:${r.auth}\nimport { ${toPascalCase(r.screenName)}Screen as ${screenComp} } from '${filePath}'`
  }).join('\n')

  // Build screen array
  const screenDefs = routes.map(r => {
    const screenComp = toPascalCase(r.tatName) + toPascalCase(r.screenName) + 'Screen'
    return `  {
    name:      '${r.routeKey}',
    component: ${screenComp},
    auth:      ${r.auth},
    tatemono:  '${r.tatName}',
  }`
  }).join(',\n')

  const content = `// ============================================================
// ARKZEN GENERATED — React Navigation Route Registry
// Auto-updated when tatemonos are built/removed
// DO NOT EDIT — managed by Arkzen engine
//
// Used in src/App.tsx to build the navigation stack
// ============================================================

${imports}

// React Navigation param list — required for type-safe navigation
export type ArkzenRootStackParamList = {
${paramListEntries}
}

export interface ArkzenNativeRoute {
  name:      string
  component: React.ComponentType<any>
  auth:      boolean
  tatemono:  string
}

export const ARKZEN_NATIVE_ROUTES: ArkzenNativeRoute[] = [
${screenDefs}
]
`
  fs.writeFileSync(ROUTES_FILE, content, 'utf-8')
}

// ─── Main: register tatemono screens ─────────────────────────────────────────

export function registerNativeScreens(tatemono: ParsedTatemono): void {
  const tatName  = tatemono.meta.name
  const tatDir   = path.join(SCREENS_DIR, tatName)
  ensureDir(tatDir)

  const existingRoutes = readExistingRoutes().filter(r => r.tatName !== tatName)
  const newRoutes: NativeRoute[] = []

  for (const page of tatemono.pages) {
    const screenContent = generateNativeScreenFile(tatemono, page)
    const screenPath    = path.join(tatDir, `${page.name}.tsx`)
    fs.writeFileSync(screenPath, screenContent, 'utf-8')

    const routeKey = `${tatName}/${page.name}`
    newRoutes.push({
      tatName,
      screenName: page.name,
      routeKey,
      auth: tatemono.meta.auth,
    })

    console.log(`[Arkzen Native Router] ✓ ${routeKey} [native]`)
  }

  writeRouteRegistry([...existingRoutes, ...newRoutes])
  console.log(`[Arkzen Native Router] ✓ Navigation registry updated: ${newRoutes.length} screen(s)`)
}

// ─── Remove tatemono screens ──────────────────────────────────────────────────

export function unregisterNativeScreens(tatName: string): void {
  const tatDir = path.join(SCREENS_DIR, tatName)
  if (fs.existsSync(tatDir)) {
    fs.rmSync(tatDir, { recursive: true, force: true })
    console.log(`[Arkzen Native Router] ✓ Removed screens: ${tatName}`)
  }

  const routes = readExistingRoutes().filter(r => r.tatName !== tatName)
  writeRouteRegistry(routes)
  console.log(`[Arkzen Native Router] ✓ Navigation registry updated`)
}