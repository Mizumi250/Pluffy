'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — TermStack
// Source: @arkzen:components (pluffy-showcase)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-27T10:24:16.344Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, ChevronDown, CircleCheck, CodeXml, Copy, Download, Home, MessageSquare, Plus, Puzzle, Search, Settings, Terminal, Upload } from 'lucide-react'
import { DockHead } from './DockHead'

export const TermStack = () => (
  <div className="pf-dock pf-xl pf-open">
    <DockHead />
    <div className="pf-w-term">
      <div><span className="pf-pr">$ </span><span className="pf-tx" data-t="mizumi web react-vite" /></div>
      <div className="pf-to" data-g="0"><span className="ok">✓</span> Web stack switched: nextjs → react-vite</div>
      <div style={{ height: 10 }} />
      <div><span className="pf-pr">$ </span><span className="pf-tx" data-t="mizumi backend go" /></div>
      <div className="pf-to" data-g="1"><span className="ok">✓</span> Backend switched: laravel → go</div>
      <div className="pf-to m" data-g="1">Tatemonos without a :go variant will be inactive on this backend</div>
      <div style={{ height: 10 }} />
      <div><span className="pf-pr">$ </span><span className="pf-tx" data-t="mizumi stack" /></div>
      {['Web stack:      react-vite  React + Vite', 'App stack:      expo  Expo (SDK 58, Expo Go)', 'Desktop stack:  electron  Electron desktop (wraps the running web stack)', 'Backend:        go  :go  Go (Chi)', 'Database:       sqlite  SQLite (one .sqlite file per tatemono)'].map((l) => <div className="pf-to" data-g="2" key={l} style={{ whiteSpace: 'pre' }}>{l}</div>)}
    </div>
  </div>
)
