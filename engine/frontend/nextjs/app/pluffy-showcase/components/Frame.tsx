'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — Frame
// Source: @arkzen:components (pluffy-showcase)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T05:54:03.344Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, ChevronDown, CircleCheck, CodeXml, Copy, Download, Home, MessageSquare, Plus, Puzzle, Search, Settings, Terminal, Upload } from 'lucide-react'
import { SIDE_NAMES } from './constants'
import { Mark } from './Mark'

export const Frame = ({ children, dock, modal, active = 'home' }: { children: React.ReactNode; dock?: React.ReactNode; modal?: React.ReactNode; active?: string }) => (
  <div className="pf-win" aria-hidden="true">
    <div className="pf-w-title">
      <i style={{ background: '#ff5f57' }} /><i style={{ background: '#febc2e' }} /><i style={{ background: '#28c840' }} />
      <div className="pf-w-brand"><Mark />Pluffy Studio</div>
      <div className="pf-w-ta"><span className="pf-w-g"><CodeXml />VS Code</span><span className="pf-w-g"><Terminal />CMD</span><span className="pf-w-g"><MessageSquare />Chat</span></div>
    </div>
    <div className="pf-w-side">
      <span className="pf-w-new"><Plus />New tatemono</span>
      <span className={'pf-w-nav pf-nav-home' + (active === 'home' ? ' on' : '')}><Home />Home</span>
      <span className="pf-w-nav"><Puzzle />Extensions</span>
      <span className="pf-w-nav"><Settings />Engine</span>
      <div className="pf-w-lab">TATEMONOS (66)</div>
      <div className="pf-w-nav"><Search />Search tatemonos</div>
      <div className="pf-w-list">
        <span className={'pf-w-nav pf-side-new' + (active === 'new' ? ' pf-vis on' : '')}><Building2 />warung-sore</span>
        {SIDE_NAMES.map((n) => <span className="pf-w-nav" key={n}><Building2 />{n}</span>)}
      </div>
    </div>
    <div className="pf-w-sheet">{children}</div>
    {dock}
    {modal}
    <svg className="pf-cursor" viewBox="0 0 24 24"><path d="M4 2 L4 19 L8.6 14.8 L11.6 21.6 L14.4 20.4 L11.5 13.8 L18 13.6 Z" fill="#212121" stroke="#fbfbfd" strokeWidth="1.5" strokeLinejoin="round" /></svg>
  </div>
)
