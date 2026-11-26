'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — StudioWindow
// Source: @arkzen:components (pluffy-showcase)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-26T13:18:24.121Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, ChevronDown, CircleCheck, CodeXml, Copy, Download, Home, MessageSquare, Plus, Puzzle, Search, Settings, Terminal } from 'lucide-react'
import { CODE, RAIL, SIDE_NAMES } from './constants'
import { Mark } from './Mark'

export const StudioWindow = React.memo(() => (
  <div className="pf-win" aria-hidden="true">
    <div className="pf-w-title">
      <i style={{ background: '#ff5f57' }} /><i style={{ background: '#febc2e' }} /><i style={{ background: '#28c840' }} />
      <div className="pf-w-brand"><Mark />Pluffy Studio</div>
      <div className="pf-w-ta">
        <span className="pf-w-g"><CodeXml />VS Code</span><span className="pf-w-g"><Terminal />CMD</span><span className="pf-w-g"><MessageSquare />Chat</span>
      </div>
    </div>
    <div className="pf-w-side">
      <span className="pf-w-new"><Plus />New tatemono</span>
      <span className="pf-w-nav pf-nav-home on"><Home />Home</span>
      <span className="pf-w-nav"><Puzzle />Extensions</span>
      <span className="pf-w-nav"><Settings />Engine</span>
      <div className="pf-w-lab">TATEMONOS (66)</div>
      <div className="pf-w-nav" style={{ background: 'var(--wash,rgba(255,255,255,.55))' }}><Search />Search tatemonos</div>
      <div className="pf-w-list">
        <span className="pf-w-nav pf-side-new"><Building2 />warung-sore</span>
        {SIDE_NAMES.map((n) => <span className="pf-w-nav" key={n}><Building2 />{n}</span>)}
      </div>
    </div>
    <div className="pf-w-sheet">
      <div className="pf-v pf-v-home">
        <div className="pf-w-h2">What are we building?</div>
        <p style={{ color: 'var(--muted)', marginTop: 8, maxWidth: 520 }}>Pick a tatemono in the sidebar to edit it, or describe a new one.</p>
        <div className="pf-w-prompt"><span className="pf-typed" /><span className="pf-w-write">Write tatemono</span></div>
      </div>
      <div className="pf-v pf-v-ed">
        <div className="pf-w-bar">
          <div><h3>warung-sore</h3><div style={{ color: 'var(--muted)', fontSize: 13 }}>v1.0.0 · Warung menu and a table booking form</div></div>
          <div className="pf-w-btns"><span className="pf-w-b pf-w-check"><CircleCheck />Check</span><span className="pf-w-b p"><Plus />Add block</span></div>
        </div>
        <span className="pf-w-tab">core.tsx</span>
        <div className="pf-w-rail">
          {RAIL.map((r) => <div className="pf-rail-i" key={String(r[0])} style={{ ['--fam' as any]: r[3] }}><b>{r[0]}</b><span>{r[1]} · line {r[2]}</span></div>)}
        </div>
        <div className="pf-w-code">
          {CODE.map((ln, i) => <div className="pf-code-l" key={i}><u>{i + 1}</u>{ln.map((p, j) => <span key={j} className={p[0]}>{p[1]}</span>)}</div>)}
        </div>
      </div>
    </div>
    <div className="pf-dock">
      <div className="pf-w-dh"><span>Terminal</span><i className="pf-w-chev"><ChevronDown /></i></div>
      <div className="pf-w-term">
        <div className="pf-t-l">$ mizumi check warung-sore</div>
        <div className="pf-t-l"><span className="ok">✓</span> warung-sore  0 error(s), 0 warning(s)</div>
        <div className="pf-t-l m">1/1 tatemono(s) clean of errors</div>
      </div>
    </div>
    <svg className="pf-cursor" viewBox="0 0 24 24"><path d="M4 2 L4 19 L8.6 14.8 L11.6 21.6 L14.4 20.4 L11.5 13.8 L18 13.6 Z" fill="#212121" stroke="#fbfbfd" strokeWidth="1.5" strokeLinejoin="round" /></svg>
  </div>
))
