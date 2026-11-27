'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — ConfirmDialog
// Source: @arkzen:components (webmcp-lab)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T06:52:00.340Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import type { Draft, Service } from './types'

export const ConfirmDialog = ({ draft, onAnswer }: { draft: Draft; onAnswer: (ok: boolean) => void }) => {
  const confirmButton = useRef<HTMLButtonElement>(null)
  useEffect(() => { confirmButton.current?.focus() }, [])
  return (
    <div className="wm-scrim" role="presentation">
      <div className="wm-dialog" role="alertdialog" aria-modal="true" aria-labelledby="wm-confirm-title">
        <h2 id="wm-confirm-title">Confirm this booking?</h2>
        <p className="wm-sub">A browser assistant asked for this. Nothing is saved until you confirm.</p>
        <dl className="wm-facts">
          <div><dt>Service</dt><dd>{draft.service}</dd></div>
          <div><dt>Day</dt><dd>{draft.day}</dd></div>
          <div><dt>Time</dt><dd>{draft.slot}</dd></div>
          <div><dt>Name</dt><dd>{draft.name}</dd></div>
        </dl>
        <div className="wm-actions">
          <button type="button" className="wm-ghost" onClick={() => onAnswer(false)}>Decline</button>
          <button type="button" className="wm-primary" ref={confirmButton} onClick={() => onAnswer(true)}>Confirm booking</button>
        </div>
      </div>
    </div>
  )
}
