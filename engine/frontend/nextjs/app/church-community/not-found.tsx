// ============================================================
// ARKZEN GENERATED — church-community/not-found.tsx
// Next.js segment-scoped 404 handler.
// Rendered when notFound() is called or no route matches under /church-community.
// DO NOT EDIT DIRECTLY. Edit the @arkzen:error:404 block in the tatemono instead.
// Generated: 2026-05-06T13:26:25.470Z
// ============================================================

import React from 'react'
import { ErrorScreen } from './components'

const NotFoundPage = () => (
  <div style={{
    minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #c5d0de 0%, #d4dde8 50%, #bcc8d6 100%)',
  }}>
    <div style={{ textAlign: 'center' }}>
      <p style={{ fontSize: 80, fontWeight: 800, background: Z.purpleGrad, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', lineHeight: 1 }}>404</p>
      <p style={{ color: Z.textMid, marginTop: 8, fontSize: 15 }}>Page not found</p>
      <a href="/church-community" style={{
        display: 'inline-block', marginTop: 20, padding: '10px 28px', borderRadius: 20,
        background: Z.purpleGrad, color: '#fff', fontWeight: 700, fontSize: 14,
        textDecoration: 'none', boxShadow: Z.shadowPurp,
      }}>Go home</a>
    </div>
  </div>
)

export default NotFoundPage
