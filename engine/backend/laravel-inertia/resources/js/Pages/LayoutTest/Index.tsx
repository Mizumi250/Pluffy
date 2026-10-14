// ============================================================
// ARKZEN GENERATED PAGE — layout-test/index [React+Inertia]
// Layout: shell | Auth: false | Guest-only: false
// DO NOT EDIT — edit tatemono instead
// Generated: 2026-10-13T17:05:21.549Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { LayerBadge } from './components/LayerBadge'
import { Link } from '@/arkzen/core/adapters/Link'
import { useArkzenPathname, useArkzenRouter } from '@/arkzen/core/adapters/router'
import { ShellLayout } from '@/arkzen/core/layouts/custom/layout-test-shell'
import { router, usePage } from '@inertiajs/react'

// Props passed from Laravel via Inertia::render()
export type LayoutTestIndexProps = {
  auth?: { user?: Record<string, unknown> }
  flash?: { success?: string; error?: string }
  errors?: Record<string, string>
  [key: string]: unknown
}

// ── Page component from @arkzen:page:index ─────────────────────────────
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
  const router = useArkzenRouter()

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

// ── Arkzen Inertia wrapper ─────────────────────────────────────────────────────
function ArkzenPage_LayoutTest_Index() {
  const props   = usePage<LayoutTestIndexProps>().props
  const pageRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!pageRef.current) return
    // No animation initializer
  }, [])

  const content = (
    <motion.div
      ref={pageRef}
      variants={{}}
      initial="initial"
      animate="animate"
      exit="exit"
    >
      <IndexPage {...props} />
    </motion.div>
  )

  return (
    <ShellLayout>
    {content}
    </ShellLayout>
  )
}

export default ArkzenPage_LayoutTest_Index
