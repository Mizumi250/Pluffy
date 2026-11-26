'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Inspector
// Source: @arkzen:components (kairo)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T13:03:48.193Z
// ============================================================

import React, { useEffect, useMemo, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { arkzenFetch } from '@/arkzen/core/stores/authStore'
import { START, Stage, buildSample, gcol, truthTable } from '@/arkzen/generated/kairo.scripts'
import type { Lib, Part, Wire } from '@/arkzen/generated/kairo.scripts'
import { BookOpen, Check, ChevronLeft, ChevronRight, Cpu, Download, Info, Layers, Lightbulb, Maximize, MousePointer2, Package, Pause, Play, Redo2, RotateCcw, RotateCw, Timer, ToggleRight, Trash2, Undo2, Upload } from 'lucide-react'
import { create } from 'zustand'
import { KR_DESC, KR_NAME } from './constants'
import { useKairo, useLive } from './hooks'
import { PartTile } from './PartTile'

export const Inspector = ({ onHide }: { onHide: () => void }) => {
  const parts: Part[] = useKairo((s: any) => s.parts)
  const wires: Wire[] = useKairo((s: any) => s.wires)
  const lib: Lib = useKairo((s: any) => s.lib)
  const sel: number[] = useKairo((s: any) => s.sel)
  const run = useKairo((s: any) => s.run)
  const speed = useKairo((s: any) => s.speed)
  const msg = useKairo((s: any) => s.msg)
  const save = useKairo((s: any) => s.save)
  const exportBoard = useKairo((s: any) => s.exportBoard)
  const importFile = useKairo((s: any) => s.importFile)
  const vals = useLive((s: any) => s.vals)
  const t = useLive((s: any) => s.t)
  const [tab, setTab] = useState('inspect')
  const [name, setName] = useState('')
  const fileRef = useRef<HTMLInputElement>(null)
  const key = JSON.stringify([parts.map((p) => [p.id, p.kind, p.chip]), wires]) + Object.keys(lib).join()
  const tt = useMemo(() => truthTable({ parts, wires }, lib), [key])
  const cur = parts.find((p) => p.id === sel[0])
  const k = sel.length > 1 ? '' : cur ? cur.kind : ''
  const cnt: Record<string, number> = {}
  const rows = parts.filter((p) => p.kind === 'in' || p.kind === 'out' || p.kind === 'clk' || p.kind === 'btn').map((p) => {
    const i = (cnt[p.kind] = (cnt[p.kind] || 0) + 1)
    return { id: p.id, title: p.kind === 'in' ? 'Switch ' + 'ABCDEFGH'[i - 1] : p.kind === 'out' ? 'Lamp ' + i : p.kind === 'btn' ? 'Button ' + i : 'Clock', hi: !!vals[p.id] }
  })
  return (
    <aside className="kr-col kr-r">
      <div className="kr-tabs">
        <button className={'kr-pill' + (tab === 'inspect' ? ' dark' : '')} onClick={() => setTab('inspect')}>Inspector</button>
        <button className={'kr-pill' + (tab === 'out' ? ' dark' : '')} onClick={() => setTab('out')}>Output</button>
        <button className="kr-x" aria-label="Hide panel" onClick={onHide}><ChevronRight size={16} /></button>
      </div>
      {tab === 'out' ? (
        <div className="kr-card col">
          {tt ? (
            <table className="kr-tt">
              <thead><tr>{tt.head.map((h) => <th key={h}>{h}</th>)}</tr></thead>
              <tbody>{tt.rows.map((r, i) => <tr key={i}>{r.map((c, j) => <td key={j} className={c ? 'kr-1' : ''}>{c}</td>)}</tr>)}</tbody>
            </table>
          ) : (
            <small>A truth table appears when the board has 1 to 4 switches and at least one lamp.</small>
          )}
        </div>
      ) : (
        <>
          <div className="kr-card">
            {k ? <PartTile kind={k} /> : <span className="kr-tile" style={{ background: '#e6e9e1' }}><Layers size={18} /></span>}
            <span>
              <b>{sel.length > 1 ? sel.length + ' parts selected' : cur ? (cur.kind === 'chip' ? cur.chip : KR_NAME[k]) : 'Whole board'}</b>
              <small>{sel.length > 1 ? 'Name them below to save as a chip.' : cur ? KR_DESC[k] : parts.length + ' parts, ' + wires.length + ' wires'}</small>
            </span>
            <span className="kr-state">{run ? 'RUNNING' : 'PAUSED'}</span>
          </div>
          {parts.some((p) => sel.includes(p.id) && p.g) && <button className="kr-pill" onClick={() => useKairo.getState().ungroup()}>Ungroup</button>}
          <div className="kr-lbl"><span>SAVE AS CHIP</span></div>
          <div className="kr-card col">
            <span className="kr-tag">REUSE IT</span>
            <input className="kr-in" aria-label="Chip name" placeholder="Name this circuit" value={name} onChange={(e) => setName(e.target.value)} />
            <small style={{ marginBottom: 10 }}>Saves the selected parts, or the whole board if nothing is selected. Copies keep their layout inside a colored outline, and every part stays editable.</small>
            <div className="kr-row2"><button className="kr-pill lime" onClick={() => save(name)}><Package size={15} />Save chip</button></div>
          </div>
          <div className="kr-lbl"><span>BOARD FILE</span></div>
          <div className="kr-card col">
            <small style={{ marginBottom: 10 }}>Export the board and your chips as a .json file, or import one. A chip file is added to Your chips.</small>
            <div className="kr-row2">
              <button className="kr-pill" onClick={() => exportBoard()}><Download size={14} />Export</button>
              <button className="kr-pill" onClick={() => fileRef.current && fileRef.current.click()}><Upload size={14} />Import</button>
            </div>
            <input
              ref={fileRef}
              type="file"
              accept=".json,application/json"
              hidden
              onChange={async (e) => {
                const f = e.target.files && e.target.files[0]
                e.target.value = ''
                if (f) importFile(await f.text())
              }}
            />
          </div>
          {msg && <p className="kr-msg" role="status">{msg}</p>}
          <div className="kr-lbl"><span>WHAT IT IS ACTUALLY DOING</span></div>
          <div className="kr-tl">
            <div className="kr-step">
              <span className="kr-dot act"><Play size={10} /></span>
              <span style={{ flex: 1 }}>
                <b>Simulation</b>
                <small>Tick {t}, {speed}x speed</small>
                <div className="kr-prog"><span style={{ width: ((t % 48) / 48) * 100 + '%' }} /></div>
              </span>
            </div>
            {rows.map((r) => (
              <div key={r.id} className="kr-step">
                <span className={'kr-dot' + (r.hi ? '' : ' lo')}>{r.hi && <Check size={11} />}</span>
                <span><b>{r.title}</b><small>{r.hi ? 'High, 1' : 'Low, 0'}</small></span>
              </div>
            ))}
          </div>
        </>
      )}
    </aside>
  )
}
