'use client'

// ─────────────────────────────────────────────────────────────────────────────
// ARKZEN DSL ERROR OVERLAY
// Place this in: engine/frontend/react-vite/arkzen/core/components/ArkzenDslErrorOverlay.tsx
// Then import and render it in src/App.tsx so it shows on every page.
//
// How it works:
//   1. validateDslTags() in parser.ts writes /public/arkzen-errors/<tatemono>.json
//   2. This component polls /arkzen-errors/<tatemono>.json every 2 seconds
//   3. When errors exist, renders a full-screen overlay with clear fix instructions
//   4. When the tatemono is fixed and rebuilt, the error file is deleted and overlay disappears
// ─────────────────────────────────────────────────────────────────────────────

import React, { useState, useEffect } from 'react'

interface DslTagError {
  line:    number
  tag:     string
  problem: string
  fix:     string
}

interface DslErrorPayload {
  tatemono:  string
  filePath:  string
  errors:    DslTagError[]
  timestamp: number
}

export const ArkzenDslErrorOverlay: React.FC = () => {
  const [activeErrors, setActiveErrors] = useState<DslErrorPayload[]>([])

  useEffect(() => {
    if (import.meta.env.MODE !== 'development') return

    const check = async () => {
      try {
        // Fetch the index of current error files
        const res = await fetch('/api/arkzen/dsl-errors', { cache: 'no-store' })
        if (!res.ok) return
        const data: DslErrorPayload[] = await res.json()
        setActiveErrors(data)
      } catch {
        // silently ignore — overlay just won't show
      }
    }

    check()
    const interval = setInterval(check, 2000)
    return () => clearInterval(interval)
  }, [])

  if (activeErrors.length === 0) return null

  return (
    <div style={{
      position:        'fixed',
      inset:           0,
      zIndex:          99999,
      background:      'rgba(0,0,0,0.92)',
      backdropFilter:  'blur(4px)',
      display:         'flex',
      alignItems:      'center',
      justifyContent:  'center',
      padding:         '24px',
      fontFamily:      'monospace',
      overflowY:       'auto',
    }}>
      <div style={{
        width:        '100%',
        maxWidth:     '700px',
        background:   '#0f0f0f',
        border:       '1px solid #ef4444',
        borderRadius: '16px',
        overflow:     'hidden',
        boxShadow:    '0 0 60px rgba(239,68,68,0.2)',
      }}>
        {/* Header */}
        <div style={{
          background:  '#1a0000',
          borderBottom: '1px solid #ef444433',
          padding:     '16px 20px',
          display:     'flex',
          alignItems:  'center',
          gap:         '10px',
        }}>
          <span style={{ fontSize: '18px' }}>🚨</span>
          <div>
            <div style={{ color: '#ef4444', fontWeight: 'bold', fontSize: '14px', letterSpacing: '0.05em' }}>
              ARKZEN DSL ERROR
            </div>
            <div style={{ color: '#ffffff44', fontSize: '11px', marginTop: '2px' }}>
              Fix these tags and save — overlay disappears automatically
            </div>
          </div>
        </div>

        {/* Error blocks per tatemono */}
        <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
          {activeErrors.map((payload) => (
            <div key={payload.tatemono}>
              {/* Tatemono name + path */}
              <div style={{
                fontSize:     '11px',
                color:        '#ffffff30',
                marginBottom: '10px',
                wordBreak:    'break-all',
              }}>
                📄 {payload.filePath}
              </div>

              {/* Individual errors */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {payload.errors.map((err, idx) => (
                  <div key={idx} style={{
                    background:   '#1a1a1a',
                    border:       '1px solid #333',
                    borderLeft:   '3px solid #ef4444',
                    borderRadius: '8px',
                    padding:      '12px 14px',
                  }}>
                    {/* Line + tag */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span style={{
                        background:   '#ef444422',
                        color:        '#ef4444',
                        fontSize:     '10px',
                        fontWeight:   'bold',
                        padding:      '2px 7px',
                        borderRadius: '4px',
                      }}>
                        Line {err.line}
                      </span>
                      <span style={{ color: '#7dd3fc', fontSize: '12px' }}>{err.tag}</span>
                    </div>

                    {/* Problem */}
                    <div style={{ fontSize: '12px', marginBottom: '6px' }}>
                      <span style={{ color: '#f97316', fontWeight: 'bold' }}>Problem: </span>
                      <span style={{ color: '#ffffff99' }}>{err.problem}</span>
                    </div>

                    {/* Fix */}
                    <div style={{
                      background:   '#0a1a0a',
                      border:       '1px solid #16a34a33',
                      borderRadius: '6px',
                      padding:      '8px 10px',
                      fontSize:     '11px',
                    }}>
                      <span style={{ color: '#4ade80', fontWeight: 'bold' }}>Fix: </span>
                      <span style={{ color: '#86efac' }}>{err.fix}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>

        {/* Footer */}
        <div style={{
          borderTop:   '1px solid #1a1a1a',
          padding:     '12px 20px',
          fontSize:    '11px',
          color:       '#ffffff22',
          textAlign:   'center',
        }}>
          Arkzen DSL Validator · Save the file after fixing to rebuild
        </div>
      </div>
    </div>
  )
}
