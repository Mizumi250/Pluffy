// ARKZEN GENERATED — layout-test/single (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T13:08:04.294Z
import { NativeLayerBadge } from './components/NativeLayerBadge'

/* @arkzen:native:page:layout:app-shell */

import React from '@lynx-js/react'

const SingleLynxPage = () => (
  <scroll-view className="flex-1 p-4" contentContainerStyle={{ gap: 12 }}>
    <text className="text-lg font-black text-gray-900">Single Layout</text>
    <text className="text-sm text-gray-600 leading-relaxed">
      Rendered inside <text className="font-mono text-indigo-600">AppShellLayout</text>.
      {'\n'}Declared as <text className="font-mono text-purple-600">layout: app-shell</text> — no parent chain.
    </text>
    <NativeLayerBadge layers={['AppShellLayout']} />
  </scroll-view>
)
