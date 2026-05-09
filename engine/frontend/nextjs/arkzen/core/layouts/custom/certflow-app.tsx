'use client'
// ARKZEN CUSTOM LAYOUT — certflow/app
// Generated from tatemono: certflow

'use client'

import React from 'react'
import { usePathname, useRouter } from 'next/navigation'

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #0f0c29 0%, #302b63 50%, #24243e 100%)',
    }}>
      {children}
    </div>
  )
}
