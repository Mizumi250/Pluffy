// ARKZEN CUSTOM LAYOUT — certflow/app [React+Vite]

import React from 'react'

export const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  return (
    <div style={{
      minHeight: '100vh',
      background: 'linear-gradient(135deg, #eaf3fa 0%, #f5e8fe 100%)',
    }}>
      {children}
    </div>
  )
}
