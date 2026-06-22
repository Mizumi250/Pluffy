// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — ChannelCard
// Source: @arkzen:native:components:lynx:* (broadcast-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-22T00:05:27.538Z
// ============================================================

import { useCallback, useEffect, useRef, useState } from '@lynx-js/react'
import { arkzenFetch, setActiveTatemono, useAuthStore } from '../../../../arkzen/core/stores/authStore'
import type { LynxMessage, WsStatus } from './types'
import { StatusDot } from './StatusDot'

// ── Channel card ──────────────────────────────────────────────
export const ChannelCard = ({
  title, badge, badgeColor, description, status, count, msgs, onSend, footer,
}: {
  title:       string
  badge:       string
  badgeColor:  string  // passed as Tailwind bg class e.g. "bg-blue-500"
  description: string
  status:      WsStatus
  count:       number
  msgs:        LynxMessage[]
  onSend:      (val: string) => void
  footer?:     any
}) => {
  const [input, setInput] = useState('')

  const handleSend = () => {
    const val = input.trim()
    if (!val) return
    onSend(val)
    setInput('')
  }

  return (
    <view className="bg-white rounded-2xl border border-neutral-100 overflow-hidden mb-4">
      {/* Header */}
      <view className="px-4 py-3.5 border-b border-neutral-100">
        <view className="flex-row items-center justify-between">
          <view className="flex-row items-center gap-2">
            <view className={`px-2 py-0.5 rounded-full ${badgeColor}`}>
              <text className="text-white text-xs font-semibold">{badge}</text>
            </view>
            <text className="text-sm font-semibold text-neutral-800">{title}</text>
          </view>
          <view className="flex-row items-center gap-1.5">
            <StatusDot status={status} />
            <text className="text-xs text-neutral-400">{status}</text>
            <text className="text-xs text-neutral-300"> · </text>
            <text className="text-xs text-neutral-400">{count} rx</text>
          </view>
        </view>
        <text className="text-xs text-neutral-400 mt-1">{description}</text>
      </view>

      {/* Input row */}
      <view className="px-4 py-2.5 border-b border-neutral-50 flex-row gap-2 items-center">
        <input
          className="flex-1 bg-neutral-50 border border-neutral-200 rounded-xl px-3 py-2.5 text-sm text-neutral-900"
          placeholder="Type and send…"
          bindinput={e => setInput(e.detail.value)}
        />
        <view bindtap={handleSend} className="bg-neutral-900 px-4 py-2.5 rounded-xl">
          <text className="text-white text-xs font-semibold">Send</text>
        </view>
      </view>

      {footer && (
        <view className="px-4 py-2.5 border-b border-neutral-50">
          {footer}
        </view>
      )}

      {msgs.length === 0 ? (
        <view className="py-8 items-center">
          <text className="text-xs text-neutral-300">No messages yet</text>
        </view>
      ) : (
        msgs.slice(0, 20).map((m, i) => (
          <view key={i} className="px-4 py-2.5 border-b border-neutral-50 flex-row items-start gap-2">
            <text className="flex-1 text-sm text-neutral-700">{m.content}</text>
            <text className="text-xs text-neutral-300 shrink-0">{m.created_at?.slice(11, 19)}</text>
          </view>
        ))
      )}
    </view>
  )
}
