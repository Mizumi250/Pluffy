// ARKZEN GENERATED — layout-test/native-chain-auth (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.719Z
import { NativeLayerBadge } from './components/NativeLayerBadge'

/* @arkzen:native:page:layout:+auth:tab-panel */

import React from 'react'

const NativeChainAuthLynxPage = () => (
  <div className="flex-1 overflow-y-auto p-4 gap-3 flex flex-col">
    <h1 className="text-lg font-black text-gray-900">Native Chain + Auth</h1>
    <p className="text-sm text-gray-600 leading-relaxed">
      Auth guard wrapped in full native chain:{'\n'}
      <span className="font-mono text-indigo-600">AppShellLayout → TabPanelLayout → AuthLayout</span>.
      {'\n'}Declared as <span className="font-mono text-purple-600">+auth:tab-panel</span>.
    </p>
    <NativeLayerBadge layers={['AppShellLayout', 'TabPanelLayout', 'AuthLayout (guard)']} />
  </div>
)
