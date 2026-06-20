// ARKZEN GENERATED — layout-test/native-auth (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.718Z
import { NativeLayerBadge } from './components/NativeLayerBadge'

/* @arkzen:native:page:layout:+auth */

import React from 'react'

const NativeAuthLynxPage = () => (
  <div className="flex-1 overflow-y-auto p-5 gap-3 flex flex-col">
    <h1 className="text-lg font-black text-gray-900">Native Auth Guard</h1>
    <p className="text-sm text-gray-600 leading-relaxed">
      Guard only — no custom layout chain. Uses <span className="font-mono text-indigo-600">+auth</span>.
      {'\n'}Equivalent to old <span className="font-mono text-purple-600">layout:auth</span>.
    </p>
    <NativeLayerBadge layers={['AuthLayout (guard)']} />
  </div>
)
