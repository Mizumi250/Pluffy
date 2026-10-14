// ARKZEN CUSTOM LAYOUT — layout-test/modal [React+Inertia]
// Generated from tatemono: layout-test

import React from 'react'

export const ModalLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div className="p-6 flex items-start justify-center">
      <div
        className="w-full max-w-lg rounded-2xl p-6"
        style={{
          background: 'rgba(255,255,255,0.80)',
          backdropFilter: 'blur(20px)',
          border: '1px solid rgba(200,210,255,0.50)',
          boxShadow: '0 8px 40px rgba(99,102,241,0.08)',
        }}
      >
        <div
          className="inline-flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-full mb-4"
          style={{ background: 'rgba(139,92,246,0.10)', color: '#7c3aed' }}
        >
          ModalLayout — parent: panel
        </div>
        {children}
      </div>
    </div>
  )
}
