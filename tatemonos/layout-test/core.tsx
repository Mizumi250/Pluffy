/* @arkzen:meta
name: layout-test
version: 1.0.0
description: Tests the v11.0 infinite layout nesting system — every combo of single layout, chain, guard-only, guard+chain, and native parity.
auth: false
*/

/* @arkzen:web:config
toast:
  position: top-right
  duration: 3000
*/

// ─────────────────────────────────────────────────────────────────────────────
// WEB LAYOUTS
// Hierarchy:
//   shell (outermost)
//     └── panel (mid shell)
//           └── modal (innermost custom)
//
// DSL contract:
//   page:layout:shell        → <ShellLayout>
//   page:layout:panel        → <ShellLayout><PanelLayout>
//   page:layout:modal        → <ShellLayout><PanelLayout><ModalLayout>
//   page:layout:+auth        → <AuthLayout requireAuth>
//   page:layout:+auth:panel  → <ShellLayout><PanelLayout><AuthLayout requireAuth>
//   page:layout:+guest       → <GuestLayout>
//   page:layout:+guest:shell → <ShellLayout><GuestLayout>
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:web:layout:shell */

'use client'

import React from 'react'

export const ShellLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #f0f4ff 0%, #e8eeff 50%, #f4f0ff 100%)',
      }}
    >
      {/* Shell header */}
      <header
        className="sticky top-0 z-50 px-6 py-3 flex items-center gap-3"
        style={{
          background: 'rgba(255,255,255,0.70)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(200,210,255,0.40)',
        }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          A
        </div>
        <span className="text-sm font-semibold text-neutral-700">ShellLayout</span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'rgba(99,102,241,0.10)', color: '#6366f1' }}
        >
          outermost
        </span>
      </header>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <footer className="px-6 py-3 text-center text-xs text-neutral-400"
        style={{ borderTop: '1px solid rgba(200,210,255,0.30)' }}
      >
        ShellLayout footer
      </footer>
    </div>
  )
}

/* @arkzen:web:layout:shell:end */

/* @arkzen:web:layout:panel
parent: shell
*/

'use client'

import React from 'react'

export const PanelLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      {/* Side panel */}
      <aside
        className="w-52 shrink-0 p-4 flex flex-col gap-2"
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(200,210,255,0.35)',
        }}
      >
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-2 mb-1">
          PanelLayout
        </p>
        {['Overview', 'Settings', 'Reports'].map(item => (
          <button
            key={item}
            className="text-left text-sm px-3 py-2 rounded-lg text-neutral-600 hover:bg-indigo-50 transition-colors"
          >
            {item}
          </button>
        ))}
        <div
          className="mt-auto text-xs px-2 py-1 rounded-full text-center font-medium"
          style={{ background: 'rgba(99,102,241,0.08)', color: '#8b5cf6' }}
        >
          parent: shell
        </div>
      </aside>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}

/* @arkzen:web:layout:panel:end */

/* @arkzen:web:layout:modal
parent: panel
*/

'use client'

import React from 'react'

export const ModalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="p-6 flex items-start justify-center">
      <div
        className="w-full max-w-lg rounded-2xl p-6"
        style={{
          background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(200,210,255,0.50)',
          boxShadow: '0 8px 40px rgba(99,102,241,0.08)',
        }}
      >
        <div
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-4"
          style={{ background: 'rgba(139,92,246,0.10)', color: '#7c3aed' }}
        >
          ModalLayout — parent: panel
        </div>
        {children}
      </div>
    </div>
  )
}

/* @arkzen:web:layout:modal:end */

// ─────────────────────────────────────────────────────────────────────────────
// WEB PAGES — one per layout combo
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:web:page:index */
/* @arkzen:web:page:layout:shell */

'use client'

import React from 'react'
import { useRouter } from 'next/navigation'

const PAGES = [
  { href: '/layout-test',             label: 'index',          combo: 'shell only',                tag: 'layout:shell' },
  { href: '/layout-test/panel',       label: 'panel',          combo: 'shell → panel',             tag: 'layout:panel' },
  { href: '/layout-test/deep',        label: 'deep',           combo: 'shell → panel → modal',     tag: 'layout:modal' },
  { href: '/layout-test/guard-auth',  label: 'guard-auth',     combo: 'auth guard only',           tag: '+auth' },
  { href: '/layout-test/chain-auth',  label: 'chain-auth',     combo: 'shell → panel → auth guard',tag: '+auth:panel' },
  { href: '/layout-test/guard-guest', label: 'guard-guest',    combo: 'guest guard only',          tag: '+guest' },
  { href: '/layout-test/chain-guest', label: 'chain-guest',    combo: 'shell → guest guard',       tag: '+guest:shell' },
]

const IndexPage = () => {
  const router = useRouter()

  return (
    <div className="p-8 max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-black text-neutral-800 mb-1">Layout Test</h1>
        <p className="text-sm text-neutral-500">
          v11.0 — infinite layout nesting. Each page below tests a different combo.
        </p>
      </div>

      <div className="space-y-2">
        {PAGES.map(({ href, label, combo, tag }) => (
          <button
            key={href}
            onClick={() => router.push(href)}
            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl text-left transition-all hover:scale-[1.01]"
            style={{
              background: 'rgba(255,255,255,0.70)',
              border: '1px solid rgba(200,210,255,0.40)',
              boxShadow: '0 2px 12px rgba(99,102,241,0.05)',
            }}
          >
            <div className="flex-1">
              <span className="text-sm font-semibold text-neutral-700">{label}</span>
              <span className="text-xs text-neutral-400 ml-2">{combo}</span>
            </div>
            <code
              className="text-xs px-2 py-0.5 rounded-md font-mono"
              style={{ background: 'rgba(99,102,241,0.08)', color: '#6366f1' }}
            >
              {tag}
            </code>
          </button>
        ))}
      </div>
    </div>
  )
}

/* @arkzen:web:page:index:end */

/* @arkzen:web:page:panel */
/* @arkzen:web:page:layout:panel */

'use client'

import React from 'react'

const PanelPage = () => (
  <div className="p-6 space-y-3">
    <h2 className="text-lg font-bold text-neutral-800">Panel Page</h2>
    <p className="text-sm text-neutral-500">
      Rendered inside <code>ShellLayout → PanelLayout</code>.
      PanelLayout declared <code>parent: shell</code> — the router resolved the chain automatically.
    </p>
    <LayerBadge layers={['ShellLayout', 'PanelLayout']} />
  </div>
)

/* @arkzen:web:page:panel:end */

/* @arkzen:web:page:deep */
/* @arkzen:web:page:layout:modal */

'use client'

import React from 'react'

const DeepPage = () => (
  <div className="space-y-3">
    <h2 className="text-lg font-bold text-neutral-800">Deep Page</h2>
    <p className="text-sm text-neutral-500">
      Three layouts deep: <code>ShellLayout → PanelLayout → ModalLayout</code>.
      Only <code>layout:modal</code> was declared — the full chain resolved via <code>parent</code> links.
    </p>
    <LayerBadge layers={['ShellLayout', 'PanelLayout', 'ModalLayout']} />
  </div>
)

/* @arkzen:web:page:deep:end */

/* @arkzen:web:page:guard-auth */
/* @arkzen:web:page:layout:+auth */

'use client'

import React from 'react'

const GuardAuthPage = () => (
  <div className="p-8 max-w-md mx-auto space-y-3">
    <h2 className="text-lg font-bold text-neutral-800">Guard Auth Page</h2>
    <p className="text-sm text-neutral-500">
      Auth guard only — no custom layout chain. Uses <code>+auth</code> prefix.
      Equivalent to old <code>layout:auth</code> behavior.
    </p>
    <LayerBadge layers={['AuthLayout (guard)']} />
  </div>
)

/* @arkzen:web:page:guard-auth:end */

/* @arkzen:web:page:chain-auth */
/* @arkzen:web:page:layout:+auth:panel */

'use client'

import React from 'react'

const ChainAuthPage = () => (
  <div className="p-6 space-y-3">
    <h2 className="text-lg font-bold text-neutral-800">Chain Auth Page</h2>
    <p className="text-sm text-neutral-500">
      Auth guard wrapping a full chain: <code>ShellLayout → PanelLayout → AuthLayout</code>.
      Declared as <code>+auth:panel</code> — guard attaches innermost, chain resolves outward.
    </p>
    <LayerBadge layers={['ShellLayout', 'PanelLayout', 'AuthLayout (guard)']} />
  </div>
)

/* @arkzen:web:page:chain-auth:end */

/* @arkzen:web:page:guard-guest */
/* @arkzen:web:page:layout:+guest */

'use client'

import React from 'react'

const GuardGuestPage = () => (
  <div className="p-8 max-w-md mx-auto space-y-3">
    <h2 className="text-lg font-bold text-neutral-800">Guard Guest Page</h2>
    <p className="text-sm text-neutral-500">
      Guest guard only — redirects to dashboard if already authenticated.
      Uses <code>+guest</code> prefix. Equivalent to old <code>layout:guest</code>.
    </p>
    <LayerBadge layers={['GuestLayout (guard)']} />
  </div>
)

/* @arkzen:web:page:guard-guest:end */

/* @arkzen:web:page:chain-guest */
/* @arkzen:web:page:layout:+guest:shell */

'use client'

import React from 'react'

const ChainGuestPage = () => (
  <div className="p-8 space-y-3">
    <h2 className="text-lg font-bold text-neutral-800">Chain Guest Page</h2>
    <p className="text-sm text-neutral-500">
      Guest guard inside shell: <code>ShellLayout → GuestLayout</code>.
      Declared as <code>+guest:shell</code>.
    </p>
    <LayerBadge layers={['ShellLayout', 'GuestLayout (guard)']} />
  </div>
)

/* @arkzen:web:page:chain-guest:end */

// ─────────────────────────────────────────────────────────────────────────────
// SHARED WEB COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:web:components:shared */

'use client'

import React from 'react'

const COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']

export const LayerBadge: React.FC<{ layers: string[] }> = ({ layers }) => (
  <div className="flex flex-wrap gap-2 pt-2">
    {layers.map((layer, i) => (
      <span
        key={layer}
        className="text-xs px-2.5 py-1 rounded-full font-semibold text-white"
        style={{ background: COLORS[i % COLORS.length] }}
      >
        {i + 1}. {layer}
      </span>
    ))}
  </div>
)

/* @arkzen:web:components:shared:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE LAYOUTS
// Same hierarchy as web, native-specific implementations.
//   app-shell (outermost)
//     └── tab-panel (mid)
//           └── card-modal (innermost custom)
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:layout:app-shell */

import React from 'react'
import { View, Text, Platform } from 'react-native'
import { SafeAreaView } from 'react-native-safe-area-context'
import { useRouter, usePathname } from 'expo-router'
import { TouchableOpacity } from 'react-native'

export const AppShellLayout: React.FC<{ children: React.ReactNode; tatSlug?: string }> = ({ children }) => {
  return (
    <View style={{ flex: 1, backgroundColor: '#f0f4ff' }}>
      {/* Shell header */}
      <SafeAreaView edges={['top']} style={{ backgroundColor: 'rgba(255,255,255,0.85)' }}>
        <View style={{
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
          paddingVertical: 10,
          gap: 10,
          borderBottomWidth: 1,
          borderBottomColor: 'rgba(200,210,255,0.40)',
        }}>
          <View style={{
            width: 28, height: 28, borderRadius: 8,
            backgroundColor: '#6366f1',
            alignItems: 'center', justifyContent: 'center',
          }}>
            <Text style={{ color: '#fff', fontSize: 12, fontWeight: '900' }}>A</Text>
          </View>
          <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151' }}>AppShellLayout</Text>
          <View style={{
            marginLeft: 'auto',
            backgroundColor: 'rgba(99,102,241,0.10)',
            paddingHorizontal: 8, paddingVertical: 2, borderRadius: 999,
          }}>
            <Text style={{ fontSize: 10, color: '#6366f1', fontWeight: '600' }}>outermost</Text>
          </View>
        </View>
      </SafeAreaView>

      {/* Content */}
      <View style={{ flex: 1 }}>
        {children}
      </View>

      {/* Shell footer */}
      <SafeAreaView edges={['bottom']} style={{ backgroundColor: 'rgba(255,255,255,0.70)' }}>
        <View style={{
          alignItems: 'center', paddingVertical: 8,
          borderTopWidth: 1, borderTopColor: 'rgba(200,210,255,0.30)',
        }}>
          <Text style={{ fontSize: 10, color: '#9ca3af' }}>AppShellLayout footer</Text>
        </View>
      </SafeAreaView>
    </View>
  )
}

/* @arkzen:native:layout:app-shell:end */

/* @arkzen:native:layout:tab-panel
parent: app-shell
*/

import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'

export const TabPanelLayout: React.FC<{ children: React.ReactNode; tatSlug?: string }> = ({ children }) => {
  const tabs = ['Overview', 'Settings', 'Reports']

  return (
    <View style={{ flex: 1, flexDirection: 'row' }}>
      {/* Side tabs */}
      <View style={{
        width: 120,
        backgroundColor: 'rgba(255,255,255,0.60)',
        borderRightWidth: 1,
        borderRightColor: 'rgba(200,210,255,0.35)',
        paddingTop: 12,
        gap: 4,
        paddingHorizontal: 8,
      }}>
        <Text style={{
          fontSize: 9, fontWeight: '800', color: '#9ca3af',
          textTransform: 'uppercase', letterSpacing: 1.2,
          paddingHorizontal: 8, marginBottom: 4,
        }}>
          TabPanel
        </Text>
        {tabs.map(tab => (
          <TouchableOpacity
            key={tab}
            style={{
              paddingHorizontal: 10, paddingVertical: 8,
              borderRadius: 8, backgroundColor: 'transparent',
            }}
            activeOpacity={0.7}
          >
            <Text style={{ fontSize: 12, color: '#6b7280' }}>{tab}</Text>
          </TouchableOpacity>
        ))}
        <View style={{
          marginTop: 'auto',
          backgroundColor: 'rgba(99,102,241,0.08)',
          borderRadius: 999, paddingHorizontal: 8, paddingVertical: 4,
          alignItems: 'center', marginBottom: 12,
        }}>
          <Text style={{ fontSize: 9, color: '#8b5cf6', fontWeight: '600' }}>parent: app-shell</Text>
        </View>
      </View>

      {/* Panel content */}
      <View style={{ flex: 1 }}>
        {children}
      </View>
    </View>
  )
}

/* @arkzen:native:layout:tab-panel:end */

/* @arkzen:native:layout:card-modal
parent: tab-panel
*/

import React from 'react'
import { View, Text, ScrollView } from 'react-native'

export const CardModalLayout: React.FC<{ children: React.ReactNode; tatSlug?: string }> = ({ children }) => {
  return (
    <ScrollView
      contentContainerStyle={{ flexGrow: 1, padding: 16 }}
      showsVerticalScrollIndicator={false}
    >
      <View style={{
        backgroundColor: 'rgba(255,255,255,0.85)',
        borderRadius: 20,
        padding: 20,
        borderWidth: 1,
        borderColor: 'rgba(200,210,255,0.50)',
        shadowColor: '#6366f1',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.08,
        shadowRadius: 20,
        elevation: 4,
      }}>
        <View style={{
          flexDirection: 'row', alignItems: 'center',
          backgroundColor: 'rgba(139,92,246,0.10)',
          alignSelf: 'flex-start',
          paddingHorizontal: 10, paddingVertical: 4,
          borderRadius: 999, marginBottom: 16,
        }}>
          <Text style={{ fontSize: 10, color: '#7c3aed', fontWeight: '700' }}>
            CardModalLayout — parent: tab-panel
          </Text>
        </View>
        {children}
      </View>
    </ScrollView>
  )
}

/* @arkzen:native:layout:card-modal:end */

// ─────────────────────────────────────────────────────────────────────────────
// NATIVE PAGES — mirrors web combos exactly
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:page:index */
/* @arkzen:native:page:layout:app-shell */

import React from 'react'
import { View, Text, TouchableOpacity, ScrollView } from 'react-native'
import { useRouter } from 'expo-router'
import { StatusBar } from 'expo-status-bar'
import { SafeAreaView } from 'react-native-safe-area-context'

const NATIVE_PAGES = [
  { href: '/layout-test',                  label: 'index',        combo: 'app-shell only',                        tag: 'app-shell' },
  { href: '/layout-test/tab',              label: 'tab',          combo: 'app-shell → tab-panel',                 tag: 'tab-panel' },
  { href: '/layout-test/native-deep',      label: 'native-deep',  combo: 'app-shell → tab-panel → card-modal',   tag: 'card-modal' },
  { href: '/layout-test/native-auth',      label: 'native-auth',  combo: 'auth guard only',                      tag: '+auth' },
  { href: '/layout-test/native-chain-auth',label: 'native-chain', combo: 'app-shell → tab-panel → auth guard',   tag: '+auth:tab-panel' },
  { href: '/layout-test/native-guest',     label: 'native-guest', combo: 'guest guard only',                     tag: '+guest' },
]

const IndexNativePage = () => {
  const router = useRouter()

  return (
    <ScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ padding: 20, gap: 8 }}
      showsVerticalScrollIndicator={false}
    >
      <StatusBar style="dark" />
      <Text style={{ fontSize: 22, fontWeight: '900', color: '#1f2937', marginBottom: 4 }}>
        Layout Test
      </Text>
      <Text style={{ fontSize: 13, color: '#6b7280', marginBottom: 16 }}>
        v11.0 native — tap each to test the layout combo.
      </Text>

      {NATIVE_PAGES.map(({ href, label, combo, tag }) => (
        <TouchableOpacity
          key={href}
          onPress={() => router.push(href as any)}
          activeOpacity={0.85}
          style={{
            backgroundColor: 'rgba(255,255,255,0.75)',
            borderRadius: 14,
            padding: 14,
            borderWidth: 1,
            borderColor: 'rgba(200,210,255,0.40)',
            flexDirection: 'row',
            alignItems: 'center',
            gap: 12,
            marginBottom: 6,
          }}
        >
          <View style={{ flex: 1 }}>
            <Text style={{ fontSize: 13, fontWeight: '700', color: '#374151' }}>{label}</Text>
            <Text style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>{combo}</Text>
          </View>
          <View style={{
            backgroundColor: 'rgba(99,102,241,0.08)',
            paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6,
          }}>
            <Text style={{ fontSize: 10, color: '#6366f1', fontFamily: 'monospace', fontWeight: '600' }}>
              {tag}
            </Text>
          </View>
        </TouchableOpacity>
      ))}
    </ScrollView>
  )
}

/* @arkzen:native:page:index:end */

/* @arkzen:native:page:tab */
/* @arkzen:native:page:layout:tab-panel */

import React from 'react'
import { View, Text, ScrollView } from 'react-native'

const TabNativePage = () => (
  <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
    <Text style={{ fontSize: 17, fontWeight: '800', color: '#1f2937' }}>Tab Page</Text>
    <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 20 }}>
      Rendered inside <Text style={{ fontFamily: 'monospace', color: '#6366f1' }}>AppShellLayout → TabPanelLayout</Text>.
      {'\n'}TabPanelLayout declared <Text style={{ fontFamily: 'monospace', color: '#8b5cf6' }}>parent: app-shell</Text> — chain resolved automatically.
    </Text>
    <NativeLayerBadge layers={['AppShellLayout', 'TabPanelLayout']} />
  </ScrollView>
)

/* @arkzen:native:page:tab:end */

/* @arkzen:native:page:native-deep */
/* @arkzen:native:page:layout:card-modal */

import React from 'react'
import { Text } from 'react-native'

const NativeDeepPage = () => (
  <>
    <Text style={{ fontSize: 17, fontWeight: '800', color: '#1f2937', marginBottom: 8 }}>Deep Page</Text>
    <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 20, marginBottom: 12 }}>
      Three native layouts deep:{'\n'}
      <Text style={{ fontFamily: 'monospace', color: '#6366f1' }}>AppShellLayout → TabPanelLayout → CardModalLayout</Text>.
      {'\n'}Only <Text style={{ fontFamily: 'monospace', color: '#8b5cf6' }}>layout:card-modal</Text> declared.
    </Text>
    <NativeLayerBadge layers={['AppShellLayout', 'TabPanelLayout', 'CardModalLayout']} />
  </>
)

/* @arkzen:native:page:native-deep:end */

/* @arkzen:native:page:native-auth */
/* @arkzen:native:page:layout:+auth */

import React from 'react'
import { View, Text, ScrollView } from 'react-native'

const NativeAuthPage = () => (
  <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} showsVerticalScrollIndicator={false}>
    <Text style={{ fontSize: 17, fontWeight: '800', color: '#1f2937' }}>Native Auth Guard</Text>
    <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 20 }}>
      Guard only — no custom layout chain. Uses <Text style={{ fontFamily: 'monospace', color: '#6366f1' }}>+auth</Text>.
      Equivalent to old <Text style={{ fontFamily: 'monospace', color: '#8b5cf6' }}>layout:auth</Text>.
    </Text>
    <NativeLayerBadge layers={['AuthLayout (guard)']} />
  </ScrollView>
)

/* @arkzen:native:page:native-auth:end */

/* @arkzen:native:page:native-chain-auth */
/* @arkzen:native:page:layout:+auth:tab-panel */

import React from 'react'
import { ScrollView, Text } from 'react-native'

const NativeChainAuthPage = () => (
  <ScrollView contentContainerStyle={{ padding: 16, gap: 12 }} showsVerticalScrollIndicator={false}>
    <Text style={{ fontSize: 17, fontWeight: '800', color: '#1f2937' }}>Native Chain + Auth</Text>
    <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 20 }}>
      Auth guard wrapped in full native chain:{'\n'}
      <Text style={{ fontFamily: 'monospace', color: '#6366f1' }}>AppShellLayout → TabPanelLayout → AuthLayout</Text>.
      {'\n'}Declared as <Text style={{ fontFamily: 'monospace', color: '#8b5cf6' }}>+auth:tab-panel</Text>.
    </Text>
    <NativeLayerBadge layers={['AppShellLayout', 'TabPanelLayout', 'AuthLayout (guard)']} />
  </ScrollView>
)

/* @arkzen:native:page:native-chain-auth:end */

/* @arkzen:native:page:native-guest */
/* @arkzen:native:page:layout:+guest */

import React from 'react'
import { View, Text, ScrollView } from 'react-native'

const NativeGuestPage = () => (
  <ScrollView contentContainerStyle={{ padding: 20, gap: 12 }} showsVerticalScrollIndicator={false}>
    <Text style={{ fontSize: 17, fontWeight: '800', color: '#1f2937' }}>Native Guest Guard</Text>
    <Text style={{ fontSize: 13, color: '#6b7280', lineHeight: 20 }}>
      Guest guard only. Uses <Text style={{ fontFamily: 'monospace', color: '#6366f1' }}>+guest</Text>.
      Redirects to dashboard if already authenticated.
    </Text>
    <NativeLayerBadge layers={['GuestLayout (guard)']} />
  </ScrollView>
)

/* @arkzen:native:page:native-guest:end */

// ─────────────────────────────────────────────────────────────────────────────
// SHARED NATIVE COMPONENT
// ─────────────────────────────────────────────────────────────────────────────

/* @arkzen:native:components:shared */

import React from 'react'
import { View, Text } from 'react-native'

const NATIVE_COLORS = ['#6366f1', '#8b5cf6', '#a78bfa', '#c4b5fd', '#ddd6fe']

export const NativeLayerBadge: React.FC<{ layers: string[] }> = ({ layers }) => (
  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 6 }}>
    {layers.map((layer, i) => (
      <View
        key={layer}
        style={{
          backgroundColor: NATIVE_COLORS[i % NATIVE_COLORS.length],
          paddingHorizontal: 10,
          paddingVertical: 4,
          borderRadius: 999,
        }}
      >
        <Text style={{ color: '#fff', fontSize: 11, fontWeight: '700' }}>
          {i + 1}. {layer}
        </Text>
      </View>
    ))}
  </View>
)

/* @arkzen:native:components:shared:end */
