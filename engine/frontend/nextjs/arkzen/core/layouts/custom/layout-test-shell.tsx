'use client'
// ARKZEN CUSTOM LAYOUT — layout-test/shell
// Generated from tatemono: layout-test

import React from 'react'

export const ShellLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div
      className="min-h-screen flex flex-col"
      style={{
        background: 'linear-gradient(160deg, #f0f4ff 0%, #e8eeff 50%, #f4f0ff 100%)',
      }}
    >
      {/* Shell header */}
      <header
        className="sticky top-0 z-50 px-6 py-3 flex items-center gap-3"
        style={{
          background: 'rgba(255,255,255,0.70)',
          backdropFilter: 'blur(20px)',
          WebkitBackdropFilter: 'blur(20px)',
          borderBottom: '1px solid rgba(200,210,255,0.40)',
        }}
      >
        <div
          className="w-7 h-7 rounded-lg flex items-center justify-center text-xs font-black text-white"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
        >
          A
        </div>
        <span className="text-sm font-semibold text-neutral-700">ShellLayout</span>
        <span
          className="ml-auto text-xs px-2 py-0.5 rounded-full font-medium"
          style={{ background: 'rgba(99,102,241,0.10)', color: '#6366f1' }}
        >
          outermost
        </span>
      </header>

      <main className="flex-1 overflow-y-auto">
        {children}
      </main>

      <footer className="px-6 py-3 text-center text-xs text-neutral-400"
        style={{ borderTop: '1px solid rgba(200,210,255,0.30)' }}
      >
        ShellLayout footer
      </footer>
    </div>
  )
}
