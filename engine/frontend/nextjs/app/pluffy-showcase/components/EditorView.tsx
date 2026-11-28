'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — EditorView
// Source: @arkzen:components (pluffy-showcase)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T05:54:03.348Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, ChevronDown, CircleCheck, CodeXml, Copy, Download, Home, MessageSquare, Plus, Puzzle, Search, Settings, Terminal, Upload } from 'lucide-react'
import { CODE, RAIL } from './constants'

export const EditorView = ({ stat = false, extra = false }: { stat?: boolean; extra?: boolean }) => (
  <div className={'pf-v pf-v-ed' + (stat ? ' pf-static' : '')}>
    <div className="pf-w-bar">
      <div><h3>warung-sore</h3><div style={{ color: 'var(--muted)', fontSize: 13 }}>v1.0.0 · Warung menu and a table booking form</div></div>
      <div className="pf-w-btns">
        <span className="pf-w-b pf-w-check"><CircleCheck />Check</span><span className="pf-w-b pf-w-export"><Upload />Export</span><span className="pf-w-b p pf-w-add"><Plus />Add block</span>
      </div>
    </div>
    <span className="pf-w-tab">core.tsx</span>
    <div className="pf-w-rail">
      {RAIL.map((r) => <div className="pf-rail-i" key={String(r[0])} style={{ ['--fam' as any]: r[3] }}><b>{r[0]}</b><span>{r[1]} · line {r[2]}</span></div>)}
      {extra && <div className="pf-rail-i pf-rail-x" style={{ ['--fam' as any]: '#b0642f' }}><b>database</b><span>Shared · line 52</span></div>}
      {extra && <div className="pf-rail-i pf-rail-x" style={{ ['--fam' as any]: '#6a4fb0' }}><b>api</b><span>Backend · line 61</span></div>}
    </div>
    <div className="pf-w-code">
      {CODE.map((ln, i) => <div className="pf-code-l" key={i}><u>{i + 1}</u>{ln.map((p, j) => <span key={j} className={p[0]}>{p[1]}</span>)}</div>)}
    </div>
  </div>
)
