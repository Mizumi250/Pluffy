// ARKZEN GENERATED — layout-test/single (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.712Z
import { NativeLayerBadge } from './components/NativeLayerBadge'

/* @arkzen:native:page:layout:app-shell */

import React from 'react'

const SingleLynxPage = () => (
  <div className="flex-1 overflow-y-auto p-4 gap-3 flex flex-col">
    <h1 className="text-lg font-black text-gray-900">Single Layout</h1>
    <p className="text-sm text-gray-600 leading-relaxed">
      Rendered inside <span className="font-mono text-indigo-600">AppShellLayout</span>.
      {'\n'}Declared as <span className="font-mono text-purple-600">layout: app-shell</span> — no parent chain.
    </p>
    <NativeLayerBadge layers={['AppShellLayout']} />
  </div>
)
