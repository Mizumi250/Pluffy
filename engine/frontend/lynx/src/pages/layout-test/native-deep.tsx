// ARKZEN GENERATED — layout-test/native-deep (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.716Z
import { NativeLayerBadge } from './components/NativeLayerBadge'

/* @arkzen:native:page:layout:card-modal */

import React from 'react'

const NativeDeepLynxPage = () => (
  <div className="p-4 gap-3 flex flex-col">
    <h1 className="text-lg font-black text-gray-900 mb-2">Deep Page</h1>
    <p className="text-sm text-gray-600 leading-relaxed mb-3">
      Three native layouts deep:{'\n'}
      <span className="font-mono text-indigo-600">AppShellLayout → TabPanelLayout → CardModalLayout</span>.
      {'\n'}Only <span className="font-mono text-purple-600">layout:card-modal</span> declared.
    </p>
    <NativeLayerBadge layers={['AppShellLayout', 'TabPanelLayout', 'CardModalLayout']} />
  </div>
)
