// ARKZEN GENERATED — layout-test/native-guest (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.723Z
import { NativeLayerBadge } from './components/NativeLayerBadge'

/* @arkzen:native:page:layout:+guest */

import React from 'react'

const NativeGuestLynxPage = () => (
  <div className="flex-1 overflow-y-auto p-5 gap-3 flex flex-col">
    <h1 className="text-lg font-black text-gray-900">Native Guest Guard</h1>
    <p className="text-sm text-gray-600 leading-relaxed">
      Guest guard only. Uses <span className="font-mono text-indigo-600">+guest</span>.
      {'\n'}Redirects to dashboard if already authenticated.
    </p>
    <NativeLayerBadge layers={['GuestLayout (guard)']} />
  </div>
)
