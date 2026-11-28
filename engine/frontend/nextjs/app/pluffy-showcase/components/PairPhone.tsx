'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — PairPhone
// Source: @arkzen:components (pluffy-showcase)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T11:31:48.132Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, ChevronDown, CircleCheck, CodeXml, Copy, Download, Home, Laptop, ListChecks, MessageSquare, Plus, Puzzle, RefreshCw, Search, Settings, Terminal, Upload } from 'lucide-react'
import { Mark } from './Mark'

export const PairPhone = () => (
  <div className="pf-phone" aria-hidden="true">
    <div className="pf-ph-scr">
      <i className="pf-ph-cam" />
      <div className="pf-ph-s pf-ph-c">
        <Mark />
        <h4>Connect to your laptop</h4>
        <p>Your tatemonos and the engine stay on the laptop. This phone starts commands there and watches them.</p>
        <div className="pf-ph-lab">Address</div>
        <div className="pf-ph-in pf-ph-addr-f"><span className="pf-ph-addr" data-t="192.168.1.37:7471" data-ph="192.168.1.20:7471" /></div>
        <div className="pf-ph-probe pf-hid"><CircleCheck />Found MIZUMI</div>
        <div className="pf-ph-lab">Pairing PIN</div>
        <div className="pf-ph-in pf-ph-pin-f"><span className="pf-ph-pinv" data-t="482915" data-ph="6 digits" /></div>
        <p className="pf-ph-hint">The PIN works once and expires after 10 minutes.</p>
        <div className="pf-ph-btn">Pair with laptop</div>
      </div>
      <div className="pf-ph-s pf-ph-t pf-hid">
        <div className="pf-ph-top"><h4>Tasks</h4><span className="pf-ph-chip"><Mark /><span><b>MIZUMI</b><span>Online</span></span></span></div>
        <div className="pf-ph-list">
          <div className="pf-ph-row pf-ph-r1 pf-hid"><span className="ico ok"><CircleCheck /></span><div><b>mizumi check warung-sore</b><span className="s"><i>Done, 2 s</i></span></div></div>
          <div className="pf-ph-row pf-ph-r2 pf-hid">
            <span className="ico"><i className="pf-ph-on"><RefreshCw /></i><i className="pf-ph-fin ok pf-hid"><CircleCheck /></i></span>
            <div><b>mizumi export warung-sore nextjs</b><span className="s"><i className="pf-ph-on">Running</i><i className="pf-ph-fin pf-hid">Done, 6 s</i></span></div>
          </div>
        </div>
        <div className="pf-ph-term">
          <div className="pf-ph-tl pf-hid m">$ mizumi export warung-sore nextjs</div>
          <div className="pf-ph-tl pf-hid"><span className="ok">{'✓'}</span> Exported warung-sore for nextjs</div>
          <div className="pf-ph-tl pf-hid m">Done.</div>
        </div>
        <div className="pf-ph-tab"><div className="on"><ListChecks />Tasks</div><div><Terminal />Commands</div><div><Building2 />Tatemonos</div><div><Laptop />Laptop</div></div>
      </div>
      <i className="pf-tap" />
    </div>
  </div>
)
