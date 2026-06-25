// ============================================================
// ARKZEN GENERATED COMPONENT — CreditsModal [React+Vite]
// Source: @arkzen:components (coveo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-06-25T14:31:55.697Z
// ============================================================

import React, { useCallback, useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { handleTrigger } from './utils'

// ─── MODAL (simple credits) ──────────────────────────────────

export const CreditsModal = () => {
  const [open, setOpen] = useState(false)

  useEffect(() => {
    const handleTrigger = (e: CustomEvent) => {
      if (e.detail === 'credits-modal') setOpen(true)
    }
    window.addEventListener('modal-trigger', handleTrigger as EventListener)
    return () => window.removeEventListener('modal-trigger', handleTrigger as EventListener)
  }, [])

  if (!open) return null
  return (
    <div className="modal-overlay" onClick={() => setOpen(false)}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Credits</h2>
          <button className="close-btn" onClick={() => setOpen(false)}>×</button>
        </div>
        <div className="modal-body">
          <p>A project by <a href="https://connellmccarthy.com" target="_blank">Connell McCarthy</a></p>
          <p>Designed & Developed by <a href="https://boandco.studio" target="_blank">Bo & Co Studio</a></p>
          <hr />
          <p className="muted">Thanks for reading this, not many people do.</p>
          <p style={{ textAlign: 'center' }}>
            <span className="pill">production.25-276.f0c9c2b</span>
          </p>
        </div>
      </div>
    </div>
  )
}
