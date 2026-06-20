// ARKZEN GENERATED — layout-test/index (Lynx page)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-20T06:17:52.708Z

import React from 'react'

const IndexLynxPage = () => (
  <div className="flex-1 overflow-y-auto p-4 gap-3 flex flex-col">
    <h1 className="text-lg font-black text-gray-900">Layout Test</h1>
    <p className="text-sm text-gray-600 leading-relaxed">
      This test demonstrates nested layout chains in the arkzen native framework. 
      Each screen declares a layout, which can chain to parent layouts or apply guards.
    </p>
    <div className="space-y-3">
      <button
        onClick={() => window.location.href = '/layout-test/single'}
        className="w-full px-4 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 transition-colors text-left"
      >
        <div className="font-bold">Single Layout</div>
        <div className="text-xs text-indigo-100">No chain, uses: AppShellLayout</div>
      </button>

      <button
        onClick={() => window.location.href = '/layout-test/chain'}
        className="w-full px-4 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 transition-colors text-left"
      >
        <div className="font-bold">Layout Chain</div>
        <div className="text-xs text-indigo-100">Chain: AppShellLayout → TabPanelLayout</div>
      </button>

      <button
        onClick={() => window.location.href = '/layout-test/guard-only'}
        className="w-full px-4 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 transition-colors text-left"
      >
        <div className="font-bold">Guard Only (+auth)</div>
        <div className="text-xs text-indigo-100">Uses AuthLayout guard, no custom layout</div>
      </button>

      <button
        onClick={() => window.location.href = '/layout-test/guard-chain'}
        className="w-full px-4 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 transition-colors text-left"
      >
        <div className="font-bold">Guard + Chain (+auth:tab-panel)</div>
        <div className="text-xs text-indigo-100">Chain: AppShellLayout → TabPanelLayout → AuthLayout</div>
      </button>

      <button
        onClick={() => window.location.href = '/layout-test/native-parity'}
        className="w-full px-4 py-3 bg-indigo-600 text-white text-sm font-semibold rounded-lg hover:bg-indigo-500 transition-colors text-left"
      >
        <div className="font-bold">Native Parity Test</div>
        <div className="text-xs text-indigo-100">Demonstrates native + web layout equivalence</div>
      </button>

      <div className="mt-8 space-y-2">
        <div className="text-xs font-bold text-gray-700 uppercase tracking-wider">Guide Reference</div>
        {[
          { label: 'Single layout (no chain)', combo: 'layout: app-shell', tag: '@arkzen:native:layout:app-shell' },
          { label: 'Layout chaining', combo: 'layout: tab-panel (with parent: app-shell)', tag: '@arkzen:native:layout:tab-panel' },
          { label: 'Guard only', combo: 'layout: +auth', tag: 'Guard: AuthLayout' },
          { label: 'Guard + chain', combo: 'layout: +auth:tab-panel', tag: 'Chain: auth → app-shell' },
        ].map(({ label, combo, tag }) => (
          <div
            key={label}
            className="border border-opacity-40 border-indigo-300 rounded-lg p-3.5 flex flex-row items-center gap-3 mb-1.5"
          >
            <div className="flex-1">
              <div className="text-xs font-bold text-gray-600">{label}</div>
              <div className="text-xs text-gray-500 mt-0.5">{combo}</div>
            </div>
            <div className="bg-indigo-100 px-2 py-0.75 rounded-md">
              <div className="text-xs text-indigo-700 font-bold font-mono">
                {tag}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </div>
)
