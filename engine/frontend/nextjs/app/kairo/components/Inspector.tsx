'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Inspector
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-23T13:11:30.102Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { Cpu, Lightbulb, Package, Pause, Play, ToggleRight, Trash2 } from 'lucide-react'
import { create } from 'zustand'
import { useKairo } from './hooks'
import type { KairoState } from './types'

export const Inspector = () => {
  const parts = useKairo((s) => s.parts)
  const wires = useKairo((s) => s.wires)
  const lib = useKairo((s) => s.lib)
  const sel = useKairo((s) => s.sel)
  const wsel = useKairo((s) => s.wsel)
  const msg = useKairo((s) => s.msg)
  const remove = useKairo((s) => s.remove)
  const save = useKairo((s) => s.save)
  const [name, setName] = useState('')
  const key = JSON.stringify([parts.map((p) => [p.id, p.kind, p.chip]), wires]) + Object.keys(lib).join()
  const tt = useMemo(() => truthTable({ parts, wires }, lib), [key])
  const picked = sel.length ? sel.length + (sel.length > 1 ? ' parts selected' : ' part selected') : wsel ? '1 wire selected' : 'Nothing selected'
  return (
    <aside className="kr-insp">
      <div className="kr-sec">
        <h2 className="kr-h">What this board does</h2>
        {tt ? (
          <table className="kr-tt">
            <thead><tr>{tt.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
            <tbody>
              {tt.rows.map((r, i) => (
                <tr key={i}>{r.map((c, j) => <td key={j} className={c ? 'kr-1' : ''}>{c}</td>)}</tr>
              ))}
            </tbody>
          </table>
        ) : (
          <p className="kr-help">A truth table appears when the board has 1 to 4 switches and at least one lamp.</p>
        )}
      </div>
      <div className="kr-sec">
        <h2 className="kr-h">Selection</h2>
        <p className="kr-help" style={{ marginBottom: 10 }}>{picked}</p>
        <button className="kr-btn ghost" disabled={!sel.length && !wsel} onClick={() => remove()}>
          <Trash2 size={18} />
          Delete
        </button>
      </div>
      <div className="kr-sec">
        <h2 className="kr-h">Save as chip</h2>
        <input className="kr-in" aria-label="Chip name" placeholder="Chip name" value={name} onChange={(e) => setName(e.target.value)} />
        <button className="kr-btn" onClick={() => save(name)}>
          <Package size={18} />
          Save chip
        </button>
        <p className="kr-help" style={{ marginTop: 10 }}>Saves the selected parts, or the whole board if nothing is selected. Switches become input pins and lamps become output pins, top to bottom.</p>
        {msg && <p className="kr-msg" role="status">{msg}</p>}
      </div>
    </aside>
  )
}
