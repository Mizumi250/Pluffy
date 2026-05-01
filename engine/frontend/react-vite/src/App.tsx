// ============================================================
// ARKZEN React+Vite — App Router
// Auto-updated by Arkzen engine when tatemonos are built
// DO NOT EDIT — edit tatemonos instead
// ============================================================
import React, { Suspense, lazy } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { ARKZEN_ROUTES } from '@/arkzen/generated/routes'

function LoadingScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center',
      justifyContent: 'center', background: '#f5f5f0',
    }}>
      <div style={{ fontSize: '13px', color: '#aaa', fontFamily: 'system-ui' }}>
        Loading...
      </div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {ARKZEN_ROUTES.map(route => (
          <Route
            key={route.path}
            path={route.path}
            element={<route.component />}
          />
        ))}
        {/* Root redirect to first tatemono */}
        <Route path="/" element={
          ARKZEN_ROUTES.length > 0
            ? <Navigate to={ARKZEN_ROUTES[0].path} replace />
            : <LoadingScreen />
        } />
        {/* 404 fallback */}
        <Route path="*" element={
          <div style={{
            minHeight: '100vh', display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center',
            background: '#f5f5f0', fontFamily: 'system-ui',
          }}>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>404</div>
            <div style={{ fontSize: '14px', color: '#aaa' }}>Page not found</div>
          </div>
        } />
      </Routes>
    </Suspense>
  )
}