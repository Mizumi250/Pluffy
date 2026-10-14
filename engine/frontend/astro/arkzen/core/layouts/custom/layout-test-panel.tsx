// ARKZEN CUSTOM LAYOUT — layout-test/panel
// Generated from tatemono: layout-test

import React from 'react'

export const PanelLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="flex min-h-[calc(100vh-56px)]">
      {/* Side panel */}
      <aside
        className="w-52 shrink-0 p-4 flex flex-col gap-2"
        style={{
          background: 'rgba(255,255,255,0.55)',
          backdropFilter: 'blur(12px)',
          borderRight: '1px solid rgba(200,210,255,0.35)',
        }}
      >
        <p className="text-xs font-bold text-neutral-400 uppercase tracking-widest px-2 mb-1">
          PanelLayout
        </p>
        {['Overview', 'Settings', 'Reports'].map(item => (
          <button
            key={item}
            className="text-left text-sm px-3 py-2 rounded-lg text-neutral-600 hover:bg-indigo-50 transition-colors"
          >
            {item}
          </button>
        ))}
        <div
          className="mt-auto text-xs px-2 py-1 rounded-full text-center font-medium"
          style={{ background: 'rgba(99,102,241,0.08)', color: '#8b5cf6' }}
        >
          parent: shell
        </div>
      </aside>

      {/* Panel content */}
      <div className="flex-1 overflow-y-auto">
        {children}
      </div>
    </div>
  )
}
