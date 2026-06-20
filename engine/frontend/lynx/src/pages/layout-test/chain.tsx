// ARKZEN GENERATED — layout-test/chain (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.714Z
import { NativeLayerBadge } from './components/NativeLayerBadge'

/* @arkzen:native:page:layout:tab-panel */

import React from 'react'

const ChainLynxPage = () => (
  <div className="flex-1 overflow-y-auto p-4 gap-3 flex flex-col">
    <h1 className="text-lg font-black text-gray-900">Layout Chain</h1>
    <p className="text-sm text-gray-600 leading-relaxed">
      Rendered inside <span className="font-mono text-indigo-600">AppShellLayout → TabPanelLayout</span>.
      {'\n'}TabPanelLayout declared <span className="font-mono text-purple-600">parent: app-shell</span> — chain resolved automatically.
    </p>
    <NativeLayerBadge layers={['AppShellLayout', 'TabPanelLayout']} />
  </div>
)
