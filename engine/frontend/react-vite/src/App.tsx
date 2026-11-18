// ============================================================
// ARKZEN React+Vite — App Router + Hub
// ============================================================
import * as React from 'react'
import { Suspense } from 'react'
import { Routes, Route } from 'react-router'
import { createArkzenHub } from '../../../shared/arkzen/hub/Hub.js'
import { ARKZEN_ROUTES, ARKZEN_ERROR_BOUNDARIES } from '@/arkzen/generated/routes'

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

const ArkzenHub = createArkzenHub(React, { platform: 'React + Vite' })

function NotFoundScreen() {
  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: '#f5f5f0', fontFamily: 'system-ui',
    }}>
      <div style={{ fontSize: '48px', marginBottom: '16px' }}>404</div>
      <div style={{ fontSize: '14px', color: '#aaa' }}>Page not found</div>
    </div>
  )
}

export default function App() {
  return (
    <Suspense fallback={<LoadingScreen />}>
      <Routes>
        {ARKZEN_ROUTES.map(route => {
          const Boundary = ARKZEN_ERROR_BOUNDARIES[route.tatemono]
          const element  = Boundary
            ? <Boundary><route.component /></Boundary>
            : <route.component />
          return <Route key={route.path} path={route.path} element={element} />
        })}
        <Route path="/" element={<ArkzenHub />} />
        <Route path="*" element={<NotFoundScreen />} />
      </Routes>
    </Suspense>
  )
}
