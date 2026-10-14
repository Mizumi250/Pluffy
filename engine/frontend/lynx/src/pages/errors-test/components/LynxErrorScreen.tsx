// ============================================================
// ARKZEN GENERATED LYNX COMPONENT — LynxErrorScreen
// Source: @arkzen:native:components:lynx:* (errors-test)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-10-14T08:58:40.284Z
// ============================================================

import { useState } from '@lynx-js/react'
import { LYNX_ERRORS } from './constants'

export const LynxErrorScreen = ({ code, reset }: { code: number; reset?: () => void }) => {
  const err = LYNX_ERRORS.find(e => e.code === code) ?? {
    code,
    title: 'Error',
    message: 'An unexpected error occurred.',
    color: 'text-neutral-700',
    bg:    'bg-neutral-50',
    border: 'border-neutral-100',
  }

  return (
    <view className={`flex-1 items-center justify-center px-8 ${err.bg}`}>
      <text className={`text-8xl font-black mb-2 ${err.color}`}>{err.code}</text>
      <text className="text-xl font-bold text-neutral-900 mb-3">{err.title}</text>
      <text className="text-sm text-neutral-500 text-center leading-6 mb-10">{err.message}</text>
      <view className="flex-row gap-x-3">
        {reset && (
          <view bindtap={reset} className="bg-neutral-900 px-6 py-3 rounded-2xl">
            <text className="text-white text-sm font-semibold">Try again</text>
          </view>
        )}
        <view className="border border-neutral-200 bg-white px-6 py-3 rounded-2xl">
          <text className="text-neutral-600 text-sm font-medium">Home</text>
        </view>
      </view>
      <text className="mt-10 text-xs text-neutral-300">Error {err.code}</text>
    </view>
  )
}
