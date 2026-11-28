'use client'
// ============================================================
// ARKZEN GENERATED COMPONENT — PairTerm
// Source: @arkzen:components (pluffy-showcase)
// DO NOT EDIT DIRECTLY. Edit the tatemono file instead.
// Generated: 2026-11-28T11:31:48.129Z
// ============================================================

import React, { useEffect, useRef, useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowUpRight, Building2, ChevronDown, CircleCheck, CodeXml, Copy, Download, Home, Laptop, ListChecks, MessageSquare, Plus, Puzzle, RefreshCw, Search, Settings, Terminal, Upload } from 'lucide-react'

export const PairTerm = () => (
  <div className="pf-pterm" id="pair-term" role="img" aria-label="What the laptop prints when the bridge starts: an address, a 6 digit pairing PIN, then a line saying the phone paired.">
    <div className="ln"><span className="m">$ </span><span className="pf-ptx" data-t="node mizumi.js bridge" /></div>
    <div className="ln pf-hid pf-pl-a"><span className="pin">{'✿'} Pluffy bridge</span>{'  '}<span className="m">v1  MIZUMI</span></div>
    <div className="ln pf-hid pf-pl-a m">Address, type one of these in the app:</div>
    <div className="ln pf-hid pf-pl-a">{'  '}<b>192.168.1.37:7471</b>{'  '}<span className="m">Wi-Fi</span></div>
    <div className="ln pf-hid pf-pl-a"><span className="m">Pairing PIN</span>{'   '}<span className="pin">482 915</span>{'   '}<span className="m">(works once, 10 minutes)</span></div>
    <div className="ln pf-hid pf-pl-b"><span className="ok">{'✓'}</span> Paired <b>Phone</b> <span className="m">(3fa9c1d2)</span></div>
  </div>
)
