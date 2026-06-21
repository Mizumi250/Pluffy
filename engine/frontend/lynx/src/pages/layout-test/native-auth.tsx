// ARKZEN GENERATED — layout-test/native-auth (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-21T02:50:31.005Z
import { NativeLayerBadge } from './components/NativeLayerBadge'

/* @arkzen:native:page:layout:+auth */

import React from '@lynx-js/react'

const NativeAuthLynxPage = () => (
  <scroll-view className="flex-1 p-5" contentContainerStyle={{ gap: 12 }}>
    <text className="text-lg font-black text-gray-900">Native Auth Guard</text>
    <text className="text-sm text-gray-600 leading-relaxed">
      Guard only — no custom layout chain. Uses <text className="font-mono text-indigo-600">+auth</text>.
      {'\n'}Equivalent to old <text className="font-mono text-purple-600">layout:auth</text>.
    </text>
    <NativeLayerBadge layers={['AuthLayout (guard)']} />
  </scroll-view>
)

export const LayoutTestNativeAuth = NativeAuthLynxPage;
