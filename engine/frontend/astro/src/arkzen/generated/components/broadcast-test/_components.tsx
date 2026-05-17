// ============================================================
// ARKZEN GENERATED SHARED UTILITIES — broadcast-test
// React island components — rendered with client:load in .astro pages
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-05-17T03:10:01.908Z
// ============================================================

import React, { memo, useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '@/arkzen/core/stores/authStore'
import { Radio } from 'lucide-react'

if (typeof window !== 'undefined') {
  setActiveTatemono('broadcast-test')
}

const REVERB_HOST   = import.meta.env.PUBLIC_REVERB_HOST    ?? 'localhost'
const REVERB_PORT   = import.meta.env.PUBLIC_REVERB_PORT    ?? '8080'
const REVERB_SCHEME = import.meta.env.PUBLIC_REVERB_SCHEME  ?? 'ws'
const APP_KEY       = import.meta.env.PUBLIC_REVERB_APP_KEY ?? 'arkzen-key'

// ── ChannelPanel — top-level memo so it never remounts on parent re-render.
// Defined outside DashboardPage to preserve input focus on mobile (Android keyboard
// dismisses when a component is unmounted/remounted, which happens if Panel is an
// inline const inside a parent that re-renders on every keystroke).
type WsStatus = 'connecting' | 'connected' | 'error'

interface Message {
  id:           number
  content:      string
  channel_type: string | null
  created_at:   string
}

const dot = (s: WsStatus) => ({
  connecting: 'bg-yellow-400',
  connected:  'bg-green-400',
  error:      'bg-red-400',
}[s])

const ChannelPanel = memo(({
  title, badge, badgeColor, description, status, count, msgs, onSend, footer,
}: {
  title: string; badge: string; badgeColor: string; description: string
  status: WsStatus; count: number; msgs: Message[]
  onSend: (value: string) => void
  footer?: React.ReactNode
}) => {
  // Uncontrolled input with ref — keystrokes never bubble up to parent state,
  // so the parent doesn't re-render and the mobile keyboard stays open.
  const inputRef = useRef<HTMLInputElement>(null)

  const handleSend = () => {
    const val = inputRef.current?.value?.trim()
    if (!val) return
    onSend(val)
    if (inputRef.current) inputRef.current.value = ''
  }

  return (
    <div className="bg-white rounded-2xl border border-neutral-100 overflow-hidden">
      <div className="px-5 py-4 border-b border-neutral-100">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className={`text-xs font-medium px-2 py-0.5 rounded-full text-white ${badgeColor}`}>{badge}</span>
            <h2 className="font-semibold text-sm">{title}</h2>
          </div>
          <div className="flex items-center gap-2 text-xs text-neutral-400">
            <div className={`w-1.5 h-1.5 rounded-full ${dot(status)}`} />
            <span>{status}</span>
            <span className="text-neutral-300">·</span>
            <span>{count} received</span>
          </div>
        </div>
        <p className="text-xs text-neutral-400 mt-1">{description}</p>
      </div>

      <div className="px-5 py-3 border-b border-neutral-50 flex gap-2">
        <input
          ref={inputRef}
          className="arkzen-input flex-1 text-sm"
          onKeyDown={e => e.key === 'Enter' && handleSend()}
          placeholder="Type and press Enter..."
        />
        <button className="arkzen-btn text-sm" onClick={handleSend}>Send</button>
      </div>

      {footer && <div className="px-5 py-2 border-b border-neutral-50">{footer}</div>}

      <div className="max-h-48 overflow-y-auto">
        {msgs.length === 0 ? (
          <div className="p-6 text-center text-xs text-neutral-300">No messages yet</div>
        ) : (
          <div className="divide-y divide-neutral-50">
            {msgs.map((m, i) => (
              <div key={i} className="px-5 py-2.5 flex items-start gap-2">
                <p className="text-sm text-neutral-700 flex-1">{m.content}</p>
                <span className="text-xs text-neutral-300 shrink-0">{m.created_at?.slice(11, 19)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
})
ChannelPanel.displayName = 'ChannelPanel'
