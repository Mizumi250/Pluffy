// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxResultBanner
// Source: @arkzen:native:components:lynx:* (errors-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T01:58:47.525Z
// ============================================================

import { useState } from '@lynx-js/react'
import { LYNX_ERRORS } from './constants'

export const LynxResultBanner = ({ result }: { result: { code: number; body: string } | null }) => {
  if (!result) return null
  const err = LYNX_ERRORS.find(e => e.code === result.code)
  return (
    <view className={`mx-4 mt-3 p-4 rounded-2xl border ${err ? err.border + ' ' + err.bg : 'bg-neutral-50 border-neutral-100'}`}>
      <text className={`text-xs font-semibold mb-1 ${err ? err.color : 'text-neutral-600'}`}>
        HTTP {result.code}{err ? ` — ${err.title}` : ''}
      </text>
      <text className="text-xs text-neutral-500 font-mono">{result.body}</text>
    </view>
  )
}
